import { SupplierConsumerTopicBrand } from "#cds-models/ConsumerTopicBrandService";
import { Article, Products, ProductSizes } from "#cds-models/Product";
import { WritingAppointments } from "#cds-models/WritingAppointmentService";
import { fetchAllowedConsumerTopics } from "../lib/common/access-control";

import cds, { Request } from "@sap/cds";

class ConsumerTopicBrandService extends cds.ApplicationService {
  init() {
    this.before(
      "DELETE",
      "SupplierConsumerTopicBrands",
      async (req: Request) => {
        const { WritingAppointments } = cds.entities(
          "com.valantic.preorder.writingAppointments"
        );
        const { SELECT } = cds.ql;
        const activeWritingAppointments = await cds.run(
          SELECT.from(WritingAppointments).where({
            consumerTopic_ID: req.data.consumerTopic_ID,
            brand_ID: req.data.brand_ID,
            date: { ">=": new Date().toISOString() },
          })
        );
        if (activeWritingAppointments && activeWritingAppointments.length > 0) {
          req.reject(409, "ACTIVE_WRITING_APPOINTMENT_ERROR");
        }
      }
    );

    this.on("DELETE", "SupplierConsumerTopicBrands", async (req: Request) => {
      const { SupplierConsumerTopicBrands } = cds.entities(
        "com.valantic.preorder.consumertopicbrand",
      );
      const { UPDATE } = cds.ql;
      const archiveSupplierConsumerTopicBrandsQuery = UPDATE.entity(
        SupplierConsumerTopicBrands,
      )
        .where({
          consumerTopic_ID: req.data.consumerTopic_ID,
          brand_ID: req.data.brand_ID,
          supplier_ID: req.data.supplier_ID,
        })
        .set({ isArchived: true });
      const archiveArticleQuery = UPDATE.entity(Article)
        .where({
          consumerTopic_ID: req.data.consumerTopic_ID,
          brand_ID: req.data.brand_ID,
          supplier_ID: req.data.supplier_ID,
        })
        .set({ isArchived: true });
      const archiveOptionQuery = UPDATE.entity(Products)
        .where({
          consumerTopic_ID: req.data.consumerTopic_ID,
          brand_ID: req.data.brand_ID,
          supplier_ID: req.data.supplier_ID,
        })
        .set({ isArchived: true });
      const archiveVariantQuery = UPDATE.entity(ProductSizes)
        .where({
          consumerTopic_ID: req.data.consumerTopic_ID,
          brand_ID: req.data.brand_ID,
          supplier_ID: req.data.supplier_ID,
        })
        .set({ isArchived: true });
      const archiveOrderQuery = UPDATE.entity(WritingAppointments)
        .where({
          consumerTopic_ID: req.data.consumerTopic_ID,
          brand_ID: req.data.brand_ID,
          supplier_ID: req.data.supplier_ID,
        })
        .set({ isArchived: true });

      await cds.run(archiveSupplierConsumerTopicBrandsQuery);
      await cds.run(archiveArticleQuery);
      await cds.run(archiveOptionQuery);
      await cds.run(archiveVariantQuery);
      await cds.run(archiveOrderQuery);
    });

    this.before("READ", "ConsumerTopics", async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map((topic: any) => topic.consumerTopic_ID);

      if (req.query.SELECT?.where) {
        req.query.and({ ID: { in: ids } });
      } else {
        req.query.where({ ID: { in: ids } });
      }
    });

    this.before("READ", "SupplierConsumerTopicBrands", async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID
      );
      if (req.query.SELECT.where) {
        req.query.and({ isArchived: false });
      } else {
        req.query.where({ isArchived: false });
      }
      req.query.and({ consumerTopic_ID: { in: ids } });
    });

    this.before(
      "CREATE",
      "SupplierConsumerTopicBrands.drafts",
      async (req: Request) => {
        const SupplierConsumerTopicBrands = await cds.run(
          SELECT.from("ConsumerTopicBrandService.SupplierConsumerTopicBrands")
            .where({
              supplier_ID: req.data.supplier_ID,
              consumerTopic_ID: req.data.consumerTopic_ID,
              brand_ID: req.data.brand_ID,
            })
            .limit(1)
        );
        if (SupplierConsumerTopicBrands.length > 0) {
          req.reject(409, "RULE_EXISTS_ERROR");
        } else {
          await cds.run(
            DELETE.from(
              "ConsumerTopicBrandService.SupplierConsumerTopicBrands.drafts"
            ).where({
              supplier_ID: req.data.supplier_ID,
              consumerTopic_ID: req.data.consumerTopic_ID,
              brand_ID: req.data.brand_ID,
              HasActiveEntity: false,
            })
          );
        }
      }
    );

    return super.init();
  }
}
module.exports = ConsumerTopicBrandService;
