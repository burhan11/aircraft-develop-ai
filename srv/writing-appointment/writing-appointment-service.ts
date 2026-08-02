import cds, { Request } from "@sap/cds";

import { fetchAllowedConsumerTopics } from "../lib/common/access-control";
import {
  ConsumerTopics,
  WritingAppointments,
} from "#cds-models/WritingAppointmentService";
import {
  SupplierConsumerTopicBrand,
  SupplierConsumerTopicBrands,
} from "#cds-models/ConsumerTopicBrandService";

export class WritingAppointmentService extends cds.ApplicationService {
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

    this.before("READ", WritingAppointments, async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
      );
      if (req.query.SELECT.where) {
        req.query.and({ isArchived: false });
      } else {
        req.query.where({ isArchived: false });
      }
      req.query.and({ consumerTopic_ID: { in: ids } });
    });

    this.on("DELETE", WritingAppointments, async (req: Request) => {
      const archiveQuery = UPDATE.entity(WritingAppointments)
        .where(req.data)
        .set({ isArchived: true });
      await cds.run(archiveQuery);
    });

    this.before("CREATE", WritingAppointments.drafts, async (req: Request) => {
      if (!req.data.productionPlant_WERKS) {
        req.data.productionPlant_WERKS = "C/Y)";
      }

      const SupplierConsumerTopicBrand = await cds.run(
        SELECT.from(SupplierConsumerTopicBrands)
          .where({
            consumerTopic_ID: req.data.consumerTopic_ID,
            brand_ID: req.data.brand_ID,
          })
          .limit(1),
      );

      if (SupplierConsumerTopicBrand.length > 0) {
        req.reject(409, "WRTING_APPOINTMENT_EXISTS_ERROR");
      } else {
        await cds.run(
          DELETE.from(SupplierConsumerTopicBrands.drafts).where({
            supplier_ID: req.data.supplier_ID,
            consumerTopic_ID: req.data.consumerTopic_ID,
            brand_ID: req.data.brand_ID,
            HasActiveEntity: false,
          }),
        );
      }
    });

    this.before(
      ["CREATE", "UPDATE"],
      WritingAppointments,
      async (req: Request) => {
        const supplierConsumerTopicBrand = await cds.run(
          SELECT.from(SupplierConsumerTopicBrands)
            .where({
              consumerTopic_ID: req.data.consumerTopic_ID,
              brand_ID: req.data.brand_ID,
            })
            .columns("orderOption")
            .limit(1),
        );

        if (supplierConsumerTopicBrand.length === 0) {
          req.reject(409, "NO_CT_EXISTS_ERROR");
        }

        // if (supplierConsumerTopicBrand[0].orderOption_ID === "None") {
        //   req.reject(409, "ONLY_ARTICLE_OR_BRANCH_ERROR");
        // }
      },
    );

    //We need this update to use delta load in datasphere and draft handling in preorder tool together
    this.after("CREATE", WritingAppointments, async (result) => {
      const { UPDATE } = cds.ql;
      if (result?.ID) {
        await cds.run(
          UPDATE.entity(WritingAppointments).where({ ID: result.ID }).set({
            status_ID: `InProgress`,
          }),
        );
      }
    });

    this.after("READ", WritingAppointments, (each) => {
      const items = Array.isArray(each) ? each : [each];
      for (const item of items) {
        if (item?.consumerTopic_ID) {
          (item as any).consumerTopicShortID = item.consumerTopic_ID.slice(-3);
        }
      }
    });

    return super.init();
  }
}
