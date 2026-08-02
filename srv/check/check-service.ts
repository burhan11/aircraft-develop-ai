import cds, { Request } from "@sap/cds";

import { fetchAllowedConsumerTopics } from "../lib/common/access-control";
// import {
//     WritingAppointments,
// } from "#cds-models/WritingAppointmentService";

import { WritingAppointments } from "#cds-models/com/valantic/preorder/writingAppointments";

import {
  SupplierConsumerTopicBrand,
  SupplierConsumerTopicBrands,
} from "#cds-models/ConsumerTopicBrandService";
import { CombinedDataView, ConsumerTopics, Products } from "#cds-models/Check";
import {
  createOrderInSAP,
  createSAPOrderDraftV2,
  createSAPProduct,
} from "../lib/common/sap-functions";
import { validateArticle } from "../lib/common/product-validation";
import { validateProduct } from "../lib/common/product-validation";
import { validateProductSizes } from "../lib/common/product-validation";
import {
  getSapMessageFromStatusText,
  getSapMessages,
} from "../lib/common/status-messages";

export class Check extends cds.ApplicationService {
  init() {
    this.before("READ", ConsumerTopics, async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
      );

      if (req.query.SELECT.where) {
        req.query.and({ ID: { in: ids } });
      } else {
        req.query.where({ ID: { in: ids } });
      }
    });

    this.before("READ", CombinedDataView, async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
      );

      if (req.query.SELECT.where) {
        req.query.and({
          consumerTopic_ID: { in: ids },
          status_ID: { in: ["ToCheck", "RequestedToSAP", "CreationFailed"] },
        });
      } else {
        req.query.where({
          consumerTopic_ID: { in: ids },
          status_ID: {
            in: ["ToCheck", "RequestedToSAP", "CreationFailed"],
          },
        });
      }
    });

    this.after("READ", "CombinedDataView", async (result) => {
      if (!Array.isArray(result)) return;

      for (const row of result) {
        const status =
          row.status?.ID || row.status_ID || row.statusName || row.sapStatus;
        let criticality = 0;

        switch (status) {
          case "Creation Failed":
          case "MarkedForDeletion":
          case "Failed":
            criticality = 1; // Red
            break;

          case "InProgress":
          case "RequestedToSAP":
          case "Check":
          case "PartiallyCreatedInSAP":
            criticality = 2; // Orange
            break;

          case "NewSupplierProduct":
          case "ReleasedForSupplier":
          case "CreatedInSAP":
            criticality = 3; // Green
            break;

          default:
            criticality = 0; // Neutral
        }

        row.Criticality = criticality;
      }
    });

    this.on("approve", async (req: any) => {
      const { entity, ID } = req.data;

      // ---------------------------------------------------------
      // LOGIC FOR AUFTRAG
      // ---------------------------------------------------------
      if (entity === "Auftrag") {
        await createSAPOrderDraftV2(ID);
        const { positions, error } = await createOrderInSAP(ID);

        if (!positions) {
          // 1. We must await this block so the handler doesn't finish yet
          try {
            // Connect to DB and start a NEW transaction
            // (Separate from req so it persists even after req.reject)
            const db = await cds.connect.to("db");
            const tx = db.tx();

            await tx.run(
              UPDATE.entity(WritingAppointments).where({ ID: ID }).set({
                status_ID: "CreationFailed",
                sapHttpStatus: error?.status,
                sapHttpStatusText: error?.statusText,
                sapStatus: error?.sapStatus,
                sapStatusText: error?.sapStatusText,
                sapTransactionId: error?.sapTransactionId,
              }),
            );

            // Commit the error status explicitly
            await tx.commit();
            console.log("Status updated to CreationFailed");
          } catch (e) {
            console.error("Failed to update status:", e);
          }

          // 2. NOW we reject the request. The UI will receive the 502 error.
          return req.reject(502, "SAP_ORDER_CREATION_FAILED");
        } else {
          // Success case
          const { SAPOrderItems } = cds.entities(
            "com.valantic.preorder.writingAppointments",
          );
          for (const pos of positions) {
            if (pos.sapArticleNumber && pos.shop) {
              await cds.run(
                UPDATE.entity(SAPOrderItems)
                  .where({
                    writingAppointment_ID: ID,
                    sapArticleNumber: pos.sapArticleNumber,
                    shop: pos.shop ?? "VZ",
                  })
                  .set({
                    orderNumber: pos.orderNumber,
                    allocationNumber: pos.allocationNumber,
                   }),
              );
            }
          }
          await cds.run(
            UPDATE.entity(WritingAppointments)
              .where({ ID: ID })
              .set({
                status_ID: "CreatedInSAP",
                sapOrderNumber: positions?.[0]?.orderNumber ?? null,
              }),
          );
        }
      }

      // ---------------------------------------------------------
      // LOGIC FOR ARTIKEL
      // ---------------------------------------------------------
      if (entity === "Artikel") {
        const { Articles } = cds.entities("com.valantic.preorder.product");
        const validationError = await validateArticle(ID);

        if (validationError) {
          return req.reject(409, validationError.code, validationError.args);
        }

        const { successful, error } = await createSAPProduct(ID);

        if (!successful) {
          // Same fix applied here: Remove setImmediate, use await
          try {
            const db = await cds.connect.to("db");
            const tx = db.tx();
            await tx.run(
              UPDATE.entity(Articles)
                .where({ ID: ID })
                .set({
                  status_ID: "CreationFailed",
                  sapHttpStatus: error?.status,
                  sapHttpStatusText: getSapMessageFromStatusText(
                    error?.statusText,
                  ),
                  sapStatus: error?.sapStatus,
                  sapStatusText: getSapMessages(error?.sapStatusText),
                  sapTransactionId: error?.sapTransactionId,
                }),
            );
            await tx.commit();
            console.log("Status updated to CreationFailed");
          } catch (e) {
            console.error("Failed to update status:", e);
          }

          return req.reject(502, "SAP_PRODUCT_CREATION_FAILED");
        } else {
          await cds.run(
            UPDATE.entity(Articles).where({ ID: ID }).set({
              status_ID: "CreatedInSAP",
              sapHttpStatus: null,
              sapHttpStatusText: null,
              sapStatus: null,
              sapStatusText: null,
              sapTransactionId: null,
            }),
          );
        }
      }

      // ---------------------------------------------------------
      // LOGIC FOR OPTION
      // ---------------------------------------------------------
      if(entity === "Option") {
        const { Products } = cds.entities("com.valantic.preorder.product");
        const validationError = await validateProduct(ID);

        if (validationError) {
          return req.reject(409, validationError.code, validationError.args);
        }

        const { successful, error } = await createSAPProduct(ID);

        if (!successful) {
          try {
            const db = await cds.connect.to("db");
            const tx = db.tx();
            await tx.run(
              UPDATE.entity(Products)
                .where({ ID: ID })
                .set({
                  status_ID: "CreationFailed",
                  sapHttpStatus: error?.status,
                  sapHttpStatusText: getSapMessageFromStatusText(
                    error?.statusText,
                  ),
                  sapStatus: error?.sapStatus,
                  sapStatusText: getSapMessages(error?.sapStatusText),
                  sapTransactionId: error?.sapTransactionId,
                }),
            );
            await tx.commit();
            console.log("Status updated to CreationFailed");
          } catch (e) {
            console.error("Failed to update status:", e);
          }

          return req.reject(502, "SAP_PRODUCT_CREATION_FAILED");
        } else {
          await cds.run(
            UPDATE.entity(Products).where({ ID: ID }).set({
              status_ID: "CreatedInSAP",
              sapHttpStatus: null,
              sapHttpStatusText: null,
              sapStatus: null,
              sapStatusText: null,
              sapTransactionId: null,
            }),
          );
        }
      }

      // ---------------------------------------------------------
      // LOGIC FOR VARIANTE
      // ---------------------------------------------------------
      if(entity === "Variante") {
        const { ProductSizes } = cds.entities("com.valantic.preorder.product");
        const validationError = await validateProductSizes(ID);

        if (validationError) {
          return req.reject(409, validationError.code, validationError.args);
        }

        const { successful, error } = await createSAPProduct(ID);

        if (!successful) {
          try {
            const db = await cds.connect.to("db");
            const tx = db.tx();
            await tx.run(
              UPDATE.entity(ProductSizes)
                .where({ ID: ID })
                .set({
                  status_ID: "CreationFailed",
                  sapHttpStatus: error?.status,
                  sapHttpStatusText: getSapMessageFromStatusText(
                    error?.statusText,
                  ),
                  sapStatus: error?.sapStatus,
                  sapStatusText: getSapMessages(error?.sapStatusText),
                  sapTransactionId: error?.sapTransactionId,
                }),
            );
            await tx.commit();
            console.log("Status updated to CreationFailed");
          } catch (e) {
            console.error("Failed to update status:", e);
          }

          return req.reject(502, "SAP_PRODUCT_CREATION_FAILED");
        } else {
          await cds.run(
            UPDATE.entity(ProductSizes).where({ ID: ID }).set({
              status_ID: "CreatedInSAP",
              sapHttpStatus: null,
              sapHttpStatusText: null,
              sapStatus: null,
              sapStatusText: null,
              sapTransactionId: null,
            }),
          );
        }
      }
    });
    
    return super.init();
  }

}
