import cds, { Request } from "@sap/cds";
import { fetchAllowedConsumerTopics } from "../lib/common/access-control";
import {
  SupplierConsumerTopicBrand,
  SupplierConsumerTopicBrands,
} from "#cds-models/ConsumerTopicBrandService";
import { Planning } from "#cds-models/PlanningService";
import {
  getSignedS3ImageUrl,
  initAWS,
  isValidHttpUrl,
} from "../lib/common/file-uploader";
import {
  getCurrentSalesComposition,
  addProductsToPlanning,
  getCurrentIndexForProductInWritingAppointment,
  getBudgetHG,
  updateSizeDistribution,
  updatePlanningProductStatusToCheck,
  checkSupplyTypeForProduct,
  updateProductSizesDistribution,
  updateProductsDistribution,
  checkSizeKeyAndManuallyEdited,
  updateManuallyEditedFlag,
  validateProductSizesDistribution,
  deleteProductSizesForPlanningProduct,
  updatePsToWAWithChangedPlanningFields,
} from "../lib/common/db-functions";
import {
  calculateHouseGroupQuantity,
  createOrderInSAP,
  createSAPOrderDraftV2,
  getHouseGroupData,
} from "../lib/common/sap-functions";
import {
  validatePlanning,
  validatePlanningProducts,
  validateSizeDistribution,
} from "../lib/common/planning-validation";
import { defaultPlanningGeneration } from "../lib/common/default-planning-generation";
import {
  buildBudgetKTTree,
  getPlanningBudgets,
  getWritingAppointmentBudgets,
} from "../lib/common/budgetKT";
import {
  getSapMessageFromStatusText,
  getSapMessages,
} from "../lib/common/status-messages";

class PlanningService extends cds.ApplicationService {
  async init() {
    const { s3, bucket } = await initAWS();
    this.before("READ", "ConsumerTopics", async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
      );

      if (req.query.SELECT?.where) {
        req.query.and({ ID: { in: ids } });
      } else {
        req.query.where({ ID: { in: ids } });
      }
    });
    this.before(
      "READ",
      ["Planning", "WritingAppointments"],
      async (req: any) => {
        const allowedTopics = await fetchAllowedConsumerTopics(req);
        const ids = allowedTopics.map(
          (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
        );
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();
        if (req.query.SELECT?.where) {
          req.query.and({
            consumerTopic_ID: { in: ids },
          });
        } else {
          req.query.where({
            consumerTopic_ID: { in: ids },
          });
        }
        req.query.or({
          consumerTopic_ID: null,
        });
      },
    );

    this.after("READ", "Products", async (result: any) => {
      for (const product of result) {
        if (!Object.keys(product).includes("imageUrl")) {
          continue;
        }
        if (product.imageUrl && isValidHttpUrl(product.imageUrl)) {
          continue;
        }
        if (product.isUploaded) {
          product.imageUrl = await getSignedS3ImageUrl(s3, bucket, product.ID);
        }
      }
    });
    this.on("generateDefaultHGAmounts", async (req: Request) => {
      const { planning_ID } = req.data;

      const result = await defaultPlanningGeneration(planning_ID);
      if (result) {
        req.reject(409, result);
      }
      await updateSizeDistribution(planning_ID);
    });

    this.on("addPlanningProducts", async (req) => {
      const { product_ID, planning_ID } = req.data;

      const error = await checkSupplyTypeForProduct(
        planning_ID,
        product_ID,
        "option",
      );
      if (error) {
        req.reject(409, error.code, undefined, error.args);
      }

      const index =
        await getCurrentIndexForProductInWritingAppointment(planning_ID);
      await addProductsToPlanning(product_ID, planning_ID, index);
    });
    this.after("READ", "PlanningProducts", async (results: any) => {
      for (const planningProduct of results) {
        //load prices
        const { purchase, sales } = await getCurrentSalesComposition(
          planningProduct.product_ID,
        );
        planningProduct.salesPrice = sales?.retailPrice ?? null;
        planningProduct.purchasePrice = purchase?.purchasePriceEURNetto ?? null;
        planningProduct.purchaseDiscount = purchase?.productDiscount1 ?? null;
        //No imageUrl requested
        if (!planningProduct.product) {
          continue;
        }
        if (!Object.keys(planningProduct?.product).includes("imageUrl")) {
          continue;
        }
        if (
          planningProduct.product.imageUrl &&
          isValidHttpUrl(planningProduct.product.imageUrl)
        ) {
          continue;
        }
        if (planningProduct.product.isUploaded) {
          planningProduct.product.imageUrl = await getSignedS3ImageUrl(
            s3,
            bucket,
            planningProduct.product.ID,
          );
        }
        if (planningProduct.sizeKey) {
          await updateProductSizesDistribution(
            planningProduct.writingAppointment_ID,
            planningProduct.product_ID,
          );
        }
      }
    });

    this.before("READ", "PlanningProductSizes", async (req: any) => {
      if (req.query.SELECT?.where) {
        req.query.and({ isValidSizeCurve: true });
      } else {
        req.query.where({ isValidSizeCurve: true });
      }
    });

    this.after("READ", "PlanningProductSizes", async (results: any) => {
      const { ProductSizes } = cds.entities("com.valantic.preorder.product");
      for (const planningProductSize of results) {
        //load prices
        const { purchase, sales } = await getCurrentSalesComposition(
          undefined,
          planningProductSize.productSize_ID,
        );
        planningProductSize.salesPrice = sales?.retailPrice ?? null;
        planningProductSize.purchasePrice =
          purchase?.purchasePriceEURNetto ?? null;
        planningProductSize.purchaseDiscount =
          purchase?.productDiscount1 ?? null;
        //No imageUrl requested
        if (!planningProductSize.productSize) {
          continue;
        }
        if (
          !Object.keys(planningProductSize?.productSize).includes("imageUrl")
        ) {
          continue;
        }
        if (
          planningProductSize.productSize.imageUrl &&
          isValidHttpUrl(planningProductSize.productSize.imageUrl)
        ) {
          continue;
        }
        if (planningProductSize.productSize.isUploaded) {
          const productId = (await cds.run(
            SELECT.one.from(ProductSizes)
              .where({ ID: planningProductSize.productSize.ID })
              .columns("product_ID")
          ))?.product_ID;
          planningProductSize.productSize.imageUrl = await getSignedS3ImageUrl(
            s3,
            bucket,
            productId,
          );
        }
      }
    });

    this.before("UPDATE", Planning, async (req: any) => {
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );
      const { status_ID, ID } = req.data;

      if (ID && status_ID === "ToCheck" && Object.keys(req.data).length === 2) {
        //Check iff all products exists in SAP
        //Only validate size distribution
        const validationError = await validatePlanning(ID);
        if (validationError) {
          req.reject(409, validationError.code, validationError.args);
        }
        await updatePlanningProductStatusToCheck(ID);
        await updateSizeDistribution(ID);
        //Do not create SAP Order Draft here anymore because article must not be created in SAP yet
        //await createSAPOrderDraft(ID);
      }

      if (
        ID &&
        status_ID === "CreatedInSAP" &&
        Object.keys(req.data).length === 2
      ) {
        const validationError = await validatePlanning(ID);
        if (validationError) {
          req.reject(409, validationError.code, validationError.args);
        }
        const productErrror = await validatePlanningProducts(ID);
        if (productErrror) {
          req.reject(409, productErrror.code, productErrror.args);
        }
        await updateSizeDistribution(ID);
        await createSAPOrderDraftV2(ID);
        const { positions, error } = await createOrderInSAP(ID);
        if (!positions) {
          setImmediate(async () => {
            try {
              const db = await cds.connect.to("db");
              const tx = db.tx();
              await tx.run(
                UPDATE.entity(WritingAppointments)
                  .where({
                    ID: ID,
                  })
                  .set({
                    status_ID: "CreationFailed",
                    sapHttpStatus: error?.status,
                    sapHttpStatusText: getSapMessageFromStatusText(error?.statusText),
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
          });

          req.reject(502, "SAP_ORDER_CREATION_FAILED");
        }
        if (positions) {
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
          req.data.sapOrderNumber = positions?.[0]?.orderNumber ?? null;
          req.data.sapHttpStatus = null;
          req.data.sapHttpStatusText = null;
          req.data.sapStatus = null;
          req.data.sapStatusText = null;
          req.data.sapTransactionId = null;
        }
      }
    });

    this.before("CREATE", Planning, async (req: Request) => {
      if (!req.data.productionPlant_WERKS) {
        req.data.productionPlant_WERKS = "C/Y)";
      }

      if (req.data.name) {
        const trimmedName = req.data.name.trim();
        req.data.name = trimmedName;

        const { WritingAppointments } = cds.entities(
          "com.valantic.preorder.writingAppointments",
        );
        const existing = await cds.run(
          SELECT.one
            .from(WritingAppointments)
            .where("lower(name) =", trimmedName.toLowerCase()),
        );
        if (existing) {
          req.reject(409, "PLANNING_NAME_ALREADY_EXISTS_ERROR", undefined, [
            trimmedName,
          ]);
        }
      }

      const SupplierConsumerTopicBrand = await cds.run(
        SELECT.from(SupplierConsumerTopicBrands)
          .where({
            consumerTopic_ID: req.data.consumerTopic_ID,
            brand_ID: req.data.brand_ID,
            supplier_ID: req.data.supplier_ID,
          })
          .limit(1),
      );
    });

    this.before("UPDATE", "PlanningProducts", async (req: any) => {
      const sizeKey = req.data.sizeKey;
      const { SELECT } = cds.ql;
      if (sizeKey) {
        const { TB_SAC_SIZE_PLAN } = cds.entities("");
        const count = (
          await cds.run(
            SELECT.one
              .from(TB_SAC_SIZE_PLAN)
              .columns("count(*) as count")
              .where({
                SIZE_KEY: sizeKey,
              }),
          )
        )?.count;

        if (count === 0) {
          req.reject(409, "SIZE_KEY_NOT_FOUND_ERROR");
        }
      }
      const { ProductsToWritingAppointments } = cds.entities(
        "com.valantic.preorder.product",
      );
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );

      if (!sizeKey) {
        const response = await checkSizeKeyAndManuallyEdited(req.data);
        if (response) {
          req.reject(409, "RESELECT_SIZE_KEY_ERROR");
        }
      } else {
        await updateManuallyEditedFlag(req.data);
      }

      const currentPlanning = await cds.run(
        SELECT.one
          .from(WritingAppointments)
          .where({ ID: req.data.writingAppointment_ID }),
      );
      if (currentPlanning.status_ID !== "InProgress" && currentPlanning.status_ID !== "CreationFailed") {
        req.reject(409, "PLANNING_NOT_IN_PROGRESS_ERROR");
      }
      const oldPlanningProduct: any = await cds.run(
        SELECT.one.from(ProductsToWritingAppointments).where({
          writingAppointment_ID: req.data.writingAppointment_ID,
          product_ID: req.data.product_ID,
        }),
      );
      const houseGroupData = await getHouseGroupData(
        req.data.writingAppointment_ID,
      );
      let totalAmount = 0;
      const totQuantPlanning =
        currentPlanning.allocationMode_ID === "AutomaticAllocation";
      if (!totQuantPlanning) {
        for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
          if (req.data[`houseGroup${hgIndex}`] === null) {
            req.data[`houseGroup${hgIndex}`] = 0;
          }
          const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
          const currentAmount =
            req.data[`houseGroup${hgIndex}`] ??
            oldPlanningProduct[`houseGroup${hgIndex}`] ??
            0;
          totalAmount += currentAmount * houseCount;
        }
      } else {
        totalAmount =
          req.data.totalAmount ?? oldPlanningProduct.totalAmount ?? 0;
      }
      const { purchase } = await getCurrentSalesComposition(
        req.data.product_ID,
      );

      req.data.totalPurchaseAmount =
        totalAmount *
        ((purchase?.purchasePriceEURNetto ?? 0) *
          (1 - (purchase?.productDiscount1 ?? 0) / 100));
      req.data.totalAmount = totalAmount;
      req.data.oldPlanningProduct = oldPlanningProduct;
    });

    this.after(
      "UPDATE",
      "PlanningProducts",
      async (result: any, req: Request) => {
        if (result.sizeKey || req.data.oldPlanningProduct.sizeKey) {
          await updateProductSizesDistribution(
            result.writingAppointment_ID,
            result.product_ID,
          );
        }
        // const budgetResult = await getBudgetHG(result.writingAppointment_ID);
        // const { WritingAppointments } = cds.entities(
        //   "com.valantic.preorder.writingAppointments",
        // );
        // if (typeof budgetResult !== "string") {
        //   await cds.run(
        //     UPDATE.entity(WritingAppointments)
        //       .where({ ID: result.writingAppointment_ID })
        //       .set({ purchaseVolume: budgetResult?.overallBudget?.overallCosts }),
        //   );
        // }
        await updateSizeDistribution(result.writingAppointment_ID);
        await updatePsToWAWithChangedPlanningFields(req.data);
      },
    );
    this.on("DELETE", "PlanningProducts", async (req: any) => {
      await cds.run(req.query);
      await deleteProductSizesForPlanningProduct(
        req.data.writingAppointment_ID,
        req.data.product_ID,
      );
      await updateSizeDistribution(req.data.writingAppointment_ID);
    });

    this.before("UPDATE", "PlanningProductSizes", async (req: any) => {
      const { SELECT } = cds.ql;
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );
      const { ProductSizesToWritingAppointments } = cds.entities(
        "com.valantic.preorder.product",
      );

      const currentPlanning = await cds.run(
        SELECT.one
          .from(WritingAppointments)
          .where({ ID: req.data.writingAppointment_ID }),
      );
      if (currentPlanning.status_ID !== "InProgress") {
        req.reject(409, "PLANNING_NOT_IN_PROGRESS_ERROR");
      }
      const oldPlanningProductSize: any = await cds.run(
        SELECT.one.from(ProductSizesToWritingAppointments).where({
          writingAppointment_ID: req.data.writingAppointment_ID,
          productSize_ID: req.data.productSize_ID,
        }),
      );
      
      let totalAmount = 0;
      const totQuantPlanning = currentPlanning.allocationMode_ID === "AutomaticAllocation";
      if (!totQuantPlanning) {
        for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
          if (req.data[`houseGroup${hgIndex}`] === null) {
            req.data[`houseGroup${hgIndex}`] = 0;
          }
          const currentAmount =
            req.data[`houseGroup${hgIndex}`] ??
            oldPlanningProductSize[`houseGroup${hgIndex}`] ??
            0;
          totalAmount += currentAmount;
        }
      } else {
        totalAmount =
          req.data.totalAmount ?? oldPlanningProductSize.totalAmount ?? 0;
      }
      const { purchase } = await getCurrentSalesComposition(
        undefined,
        req.data.productSize_ID,
      );

      req.data.totalPurchaseAmount =
        totalAmount *
        ((purchase?.purchasePriceEURNetto ?? 0) *
          (1 - (purchase?.productDiscount1 ?? 0) / 100));
      req.data.totalAmount = totalAmount;
      req.data.oldPlanningProductSize = oldPlanningProductSize;
      req.data.isManuallyEdited = true;
    });

    this.after(
      "UPDATE",
      "PlanningProductSizes",
      async (result: any, req: Request) => {
        const { WritingAppointments } = cds.entities(
          "com.valantic.preorder.writingAppointments",
        );

        await updateProductsDistribution(req.data);
        const budgetResult = await getBudgetHG(result.writingAppointment_ID);
        if (typeof budgetResult !== "string") {
          await cds.run(
            UPDATE.entity(WritingAppointments)
              .where({ ID: result.writingAppointment_ID })
              .set({
                purchaseVolume: budgetResult?.overallBudget?.overallCosts,
              }),
          );
        }
      },
    );

    this.on("DELETE", Planning, async (req: Request) => {
      const archiveQuery = UPDATE.entity(Planning)
        .where(req.data)
        .set({ isArchived: true });
      await cds.run(archiveQuery);
    });

    this.on("validateSizeDistribution", async (req: Request) => {
      const error = await validateSizeDistribution(req.data.planning_ID);
      if (error) {
        req.reject(409, error.code, undefined, error.args);
      }
    });
    this.on("validatePlanning", async (req: Request) => {
      let planning_ID = req.data.planning_ID;

      if (typeof planning_ID === "string") {
        planning_ID = planning_ID.replace(/'/g, "");
      }

      const planningError = await validatePlanning(planning_ID);
      if (planningError) {
        req.reject(409, planningError.code, undefined, planningError.args);
      }
      const productError = await validatePlanningProducts(planning_ID);
      if (productError) {
        req.reject(409, productError.code, undefined, productError.args);
      }
      await updateSizeDistribution(planning_ID);
      await createSAPOrderDraftV2(planning_ID);
    });

    this.on("getBudgetHG", async (req: Request) => {
      const result = await getBudgetHG(req.data.planning_ID);
      if (result === "NO_HOUSE_GROUP_DATA_FOUND") {
        req.reject(404, "NO_HOUSE_GROUP_DATA_FOUND");
      }
      return result;
    });

    this.on("getBudgetKT", async (req: Request) => {
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );
      const planning = await cds.run(
        SELECT.one
          .from(WritingAppointments)
          .where({ ID: req.data.planning_ID }),
      );
      const planningBudgets = await getPlanningBudgets(
        planning.consumerTopic_ID,
        planning.brand_ID,
      );
      return buildBudgetKTTree(planningBudgets);
    });

    this.on("updateTotalAmount", "PlanningProducts", async (req: Request) => {
      const { totalAmount } = req.data;
      const { product_ID, writingAppointment_ID } = req.params[0] as {
        product_ID: string;
        writingAppointment_ID: string;
      };

      const { ProductsToWritingAppointments } = cds.entities(
        "com.valantic.preorder.product",
      );
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );

      // Check if planning is in progress
      const currentPlanning = await cds.run(
        SELECT.one
          .from(WritingAppointments)
          .where({ ID: writingAppointment_ID }),
      );

      if (currentPlanning.status_ID !== "InProgress") {
        req.reject(409, "PLANNING_NOT_IN_PROGRESS_ERROR");
      }

      // Get current planning product data
      const planningProduct: any = await cds.run(
        SELECT.one.from(ProductsToWritingAppointments).where({
          writingAppointment_ID: writingAppointment_ID,
          product_ID: product_ID,
        }),
      );

      if (!planningProduct) {
        req.reject(404, "PLANNING_PRODUCT_NOT_FOUND");
      }

      const newValues: any = {};
      const totQuantPlanning = currentPlanning.allocationMode_ID === "AutomaticAllocation";
      if (!totQuantPlanning) {
        const houseGroupData = await getHouseGroupData(writingAppointment_ID);

        // Check if at least one house group has an amount > 0
        let currentTotal = 0;

        for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
          const currentAmount = planningProduct[`houseGroup${hgIndex}`] ?? 0;
          if (currentAmount > 0) {
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            currentTotal += currentAmount * houseCount;
          }
        }

        if (planningProduct.totalAmount > 0) {
          // Distribute proportionally based on current amounts
          for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
            const currentAmount = planningProduct[`houseGroup${hgIndex}`] ?? 0;
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            if (houseCount === 0) continue;
            if (currentAmount > 0 && currentTotal > 0) {
              const proportion = (currentAmount * houseCount) / currentTotal;
              newValues[`houseGroup${hgIndex}`] = Math.round(
                (totalAmount * proportion) / houseCount,
              );
            } else {
              newValues[`houseGroup${hgIndex}`] = 0;
            }
          }
        } else {
          // All house groups are 0, distribute based on house count
          let totalHouseCount = 0;
          for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            totalHouseCount += houseCount;
          }

          if (totalHouseCount === 0) {
            req.reject(409, "NO_HOUSE_GROUPS_FOUND");
          }

          for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            if (houseCount > 0) {
              const proportion = houseCount / totalHouseCount;
              newValues[`houseGroup${hgIndex}`] = Math.round(
                (totalAmount * proportion) / houseCount,
              );
            } else {
              newValues[`houseGroup${hgIndex}`] = 0;
            }
          }
        }
      }

      // Calculate total purchase amount
      const { purchase } = await getCurrentSalesComposition(product_ID);
      newValues.totalPurchaseAmount =
        totalAmount *
        ((purchase?.purchasePriceEURNetto ?? 0) *
          (1 - (purchase?.productDiscount1 ?? 0) / 100));
      newValues.totalAmount = totalAmount;

      // Update planning product
      await cds.run(
        UPDATE.entity(ProductsToWritingAppointments)
          .where({
            writingAppointment_ID: writingAppointment_ID,
            product_ID: product_ID,
          })
          .set(newValues),
      );

      if (planningProduct.sizeKey) {
        await updateProductSizesDistribution(
          planningProduct.writingAppointment_ID,
          planningProduct.product_ID,
        );
      }

      // Update budget and size distribution
      const budgetResult = await getBudgetHG(writingAppointment_ID);
      if (typeof budgetResult !== "string") {
        await cds.run(
          UPDATE.entity(WritingAppointments)
            .where({ ID: writingAppointment_ID })
            .set({ purchaseVolume: budgetResult?.overallBudget?.overallCosts }),
        );
      }
      await updateSizeDistribution(writingAppointment_ID);
    });

    this.on("updateTotalAmount", "PlanningProductSizes", async (req: Request) => {
      const { totalAmount } = req.data;
      const { productSize_ID, writingAppointment_ID } = req.params[0] as {
        productSize_ID: string;
        writingAppointment_ID: string;
      };

      const { ProductSizesToWritingAppointments } = cds.entities(
        "com.valantic.preorder.product",
      );
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );

      // Check if planning is in progress
      const currentPlanning = await cds.run(
        SELECT.one
          .from(WritingAppointments)
          .where({ ID: writingAppointment_ID }),
      );

      if (currentPlanning.status_ID !== "InProgress") {
        req.reject(409, "PLANNING_NOT_IN_PROGRESS_ERROR");
      }

      // Get current planning product data
      const planningProductSize: any = await cds.run(
        SELECT.one.from(ProductSizesToWritingAppointments).where({
          writingAppointment_ID: writingAppointment_ID,
          productSize_ID: productSize_ID,
          isValidSizeCurve: true,
        }),
      );

      if (!planningProductSize) {
        req.reject(404, "PLANNING_PRODUCT_NOT_FOUND");
      }

      const newValues: any = {};
      const totQuantPlanning = currentPlanning.allocationMode_ID === "AutomaticAllocation";
      if (!totQuantPlanning) {
        const houseGroupData = await getHouseGroupData(writingAppointment_ID);

        // Check if at least one house group has an amount > 0
        let currentTotal = 0;

        for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
          const currentAmount = planningProductSize[`houseGroup${hgIndex}`] ?? 0;
          if (currentAmount > 0) {
            // const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            currentTotal += currentAmount; //* houseCount;
          }
        }

        if (planningProductSize.totalAmount > 0) {
          // Distribute proportionally based on current amounts
          for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
            const currentAmount = planningProductSize[`houseGroup${hgIndex}`] ?? 0;
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            if (houseCount === 0) continue;
            if (currentAmount > 0 && currentTotal > 0) {
              const proportion = (currentAmount) / currentTotal; //(currentAmount * houseCount) / currentTotal;
              newValues[`houseGroup${hgIndex}`] = Math.round(
                (totalAmount * proportion), // / houseCount,
              );
            } else {
              newValues[`houseGroup${hgIndex}`] = 0;
            }
          }
        } else {
          // All house groups are 0, distribute based on house count
          let totalHouseCount = 0;
          for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            totalHouseCount += houseCount;
          }

          if (totalHouseCount === 0) {
            req.reject(409, "NO_HOUSE_GROUPS_FOUND");
          }

          for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
            const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
            if (houseCount > 0) {
              const proportion = houseCount / totalHouseCount;
              newValues[`houseGroup${hgIndex}`] = Math.round(
                (totalAmount * proportion) / houseCount,
              );
            } else {
              newValues[`houseGroup${hgIndex}`] = 0;
            }
          }
        }
      }

      // Calculate total purchase amount
      const { purchase } = await getCurrentSalesComposition(undefined, productSize_ID);
      newValues.totalPurchaseAmount =
        totalAmount *
        ((purchase?.purchasePriceEURNetto ?? 0) *
          (1 - (purchase?.productDiscount1 ?? 0) / 100));
      newValues.totalAmount = totalAmount;
      newValues.isManuallyEdited = true;

      // Update planning product
      await cds.run(
        UPDATE.entity(ProductSizesToWritingAppointments)
          .where({
            writingAppointment_ID: writingAppointment_ID,
            productSize_ID: productSize_ID,
          })
          .set(newValues),
      );
      newValues.writingAppointment_ID = writingAppointment_ID;
      newValues.productSize_ID = productSize_ID;
      newValues.oldPlanningProductSize = planningProductSize;
      await updateProductsDistribution(newValues);

      // Update budget and size distribution
      const budgetResult = await getBudgetHG(writingAppointment_ID);
      if (typeof budgetResult !== "string") {
        await cds.run(
          UPDATE.entity(WritingAppointments)
            .where({ ID: writingAppointment_ID })
            .set({ purchaseVolume: budgetResult?.overallBudget?.overallCosts }),
        );
      }
      await updateSizeDistribution(writingAppointment_ID);
    });

    this.on("updateProductsSizeKey", async (req: Request) => {
      const { SELECT } = cds.ql;
      const {
        ProductsToWritingAppointments,
        ProductSizesToWritingAppointments,
        ProductSizes,
      } = cds.entities("com.valantic.preorder.product");
      const psIds = await cds.run(
        SELECT.from(ProductSizesToWritingAppointments)
          .where({
            writingAppointment_ID: req.data.planning_ID,
            isManuallyEdited: true,
          })
          .columns("productSize_ID"),
      );

      const pIds = await cds.run(
        SELECT.from(ProductSizes)
          .where({ ID: { in: psIds.map((ps: any) => ps.productSize_ID) } })
          .columns("product_ID"),
      );

      if (pIds.length > 0) {
        await cds.run(
          UPDATE.entity(ProductsToWritingAppointments)
            .where({
              writingAppointment_ID: req.data.planning_ID,
              product_ID: { in: pIds.map((p: any) => p.product_ID) },
            })
            .set({ sizeKey: null }),
        );
      }
    });

    this.on("validateProductSizesDistribution", async (req: Request) => {
      const response = await validateProductSizesDistribution(
        req.data.planning_ID,
      );
      if (response) {
        req.reject(409, response.code, undefined, response.args);
      }
    });

    this.after("READ", Planning, (each) => {
      const items = Array.isArray(each) ? each : [each];
      for (const item of items) {
        if (item?.consumerTopic_ID) {
          (item as any).consumerTopicShortID = item.consumerTopic_ID.slice(-3);
        }
      }
    });

    this.after("READ", "AllowedTargetSupplyTypes", (results: any) => {
      if (Array.isArray(results))
        results.splice(
          0,
          results.length,
          ...new Map(results.map((r: any) => [r.SUPPLY_TYPE, r])).values(),
        );
    });

    // Scheduled job: auto-archive writing appointments every 24 hours
    cds.spawn({ every: 24 * 60 * 60 * 1000 }, async () => {
      console.log("Job started: Auto-archiving orders");
      const { WritingAppointments } = cds.entities(
        "com.valantic.preorder.writingAppointments",
      );
      const { ProductsToWritingAppointments } = cds.entities(
        "com.valantic.preorder.product",
      );

      // Calculate archiving thresholds
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const twoYearsAgo = new Date(now);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      // Case 1: ALL deliveryDateVZ are > 6 months past
      // MAX(deliveryDateVZ) < sixMonthsAgo guarantees every date lies before the threshold
      await cds.run(
        UPDATE.entity(WritingAppointments)
          .set({ isArchived: true })
          .where(
            "isArchived =",
            false,
            "and ID in",
            SELECT.from(ProductsToWritingAppointments).columns(
              "writingAppointment_ID",
            )
              .where`deliveryDateVZ is not null and writingAppointment_ID in ${SELECT.from(WritingAppointments).columns("ID").where({ isArchived: false })}`
              .groupBy("writingAppointment_ID")
              .having("MAX(deliveryDateVZ) <", sixMonthsAgo.toISOString()),
          ),
      );

      // Case 2: no allocated products at all, orders older than 2 years
      await cds.run(
        UPDATE.entity(WritingAppointments)
          .set({ isArchived: true })
          .where(
            "isArchived =",
            false,
            "and createdAt <",
            twoYearsAgo.toISOString(),
            "and ID not in",
            SELECT.from(ProductsToWritingAppointments).columns(
              "writingAppointment_ID",
            )
              .where`deliveryDateVZ is not null and writingAppointment_ID in ${SELECT.from(WritingAppointments).columns("ID").where({ isArchived: false })}`.groupBy(
              "writingAppointment_ID",
            ),
          ),
      );

      console.log("Job completed: Auto-archiving orders");
    });

    return super.init();
  }
}

module.exports = PlanningService;
