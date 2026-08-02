import { fetchAllowedConsumerTopics } from "../lib/common/access-control";

import cds, { entity, Request } from "@sap/cds";
import {
  addRuleDataToArticles,
  propagateRuleFromParent,
  getChangedFields,
  mapNewValue,
  calculateNetPrice,
  mapProperties,
  findCodeOfElement,
  findGSNROfElement,
  findIDOfElement,
  findLGORTOfElement,
  findPRODUCTIONPLANTOfElement,
  findSUPPLYTYPEOfElement,
  findTCIDOfElement,
} from "../lib/common/prefill-helper";
import {
  ConsumerTopic,
  SupplierConsumerTopicBrand,
} from "#cds-models/ConsumerTopicBrandService";
import {
  ConsumerTopicBrand,
  Suppliers,
  MARA,
  EINA,
  Product,
  Products,
  ProductSizes,
  ProductSiz,
  UploadProduct,
  WritingAppointments,
  PRICAT_K003,
  EINE,
  PricatCatalogs,
  ProductGroups,
  ProductGroup,
  AssortmentModules,
  Article,
  Articles,
} from "#cds-models/Product";
import {
  deleteS3Element,
  getSignedS3ImageUrl,
  initAWS,
  isValidHttpUrl,
  uploadToStorage,
} from "../lib/common/file-uploader";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getCurrentIndexForProductInWritingAppointment,
  updateByLevel,
  adjustProductParentStatus,
  adjustVariantParentStatus,
  getCurrentIndexForProductSizesInWritingAppointment,
  checkSupplyTypeForProduct,
  getPrefilledPlanningProductFields,
} from "../lib/common/db-functions";
import { createProductToSAP } from "../lib/common/sap-functions";
import { checkIfGTINExistsInTool, validateAllChild } from "../lib/common/sap-existance-check";
import { validateArticle, validateProduct, validateProductSizes } from "../lib/common/product-validation";
import { randomUUID } from "crypto";
import {
  getSapMessageFromStatusText,
  getSapMessages,
} from "../lib/common/status-messages";

class ProductMasterDataService extends cds.ApplicationService {
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

    this.after("READ", "WG_SBS", async (result, req) => {
      const { SELECT } = cds.ql;
      const searchValue: any = req.query.SELECT?.search;
      let likePattern;
      if (searchValue) {
        const value = searchValue[0]?.val?.replace(/"/g, '');
        if (value?.includes('*')) {
          likePattern = value?.replace(/\*/g, '%');
        } else {
          likePattern = `%${value}%`
        }
      }
      if (result.length === 0) {
        // If no record then get all values
        const filterValue = req.query?.SELECT?.columns?.[0]?.ref?.[0];

        if (filterValue === "productGroup_ID") {
          let ProductGroup;
          if (likePattern) {
            ProductGroup = await cds.run(
              SELECT.from(ProductGroups)
                .where`ID LIKE ${likePattern} OR
                  NAME LIKE ${likePattern}`
                .columns("ID", "NAME"),
            );
          } else {
            ProductGroup = await cds.run(
              SELECT.from(ProductGroups).columns("ID", "NAME"),
            );
          }
          if (ProductGroup && ProductGroup.length > 0) {
            for (const productgroup of ProductGroup) {
              result.push({
                ID: randomUUID(),
                productGroup_ID: productgroup.ID,
                productGroup_NAME: productgroup.NAME,
              });
            }
          }
        } else if (filterValue === "assortmentModule_ID") {
          const where = req.query?.SELECT?.where ?? [];
          const extractVal = (refName: string): string | undefined => {
            const idx = where.findIndex(
              (item: any) => item?.ref?.[0] === refName,
            );
            const item = where[idx + 2];
            if (
              idx !== -1 &&
              where[idx + 1] === "=" &&
              item &&
              typeof item === "object" &&
              "val" in item &&
              item.val
            ) {
              return (item as any).val;
            }
            return undefined;
          };
          const consumerTopic_ID = extractVal("up__consumerTopic_ID");
          const topicComponent_ID = extractVal("topicComponent_ID");
          let AssortmentModule;
          if (likePattern) {
            AssortmentModule = await cds.run(
              SELECT.from(AssortmentModules).columns("ID", "NAME")
                .where`HIERNODE6 = ${topicComponent_ID} AND
              HIERNODE5 = ${consumerTopic_ID} AND
              (ID LIKE ${likePattern} OR
              NAME LIKE ${likePattern})`
            );
          } else {
            AssortmentModule = await cds.run(
              SELECT.from(AssortmentModules).columns("ID", "NAME").where({
                HIERNODE6: topicComponent_ID,
                HIERNODE5: consumerTopic_ID,
              }),
            );
          }
          if (AssortmentModule && AssortmentModule.length > 0) {
            for (const assortmentModule of AssortmentModule) {
              result.push({
                ID: randomUUID(),
                assortmentModule_ID: assortmentModule.ID,
                assortmentModule_NAME: assortmentModule.NAME,
              });
            }
          }
        }
      }
    });

    this.before(["UPDATE", "CREATE"], "Products", async (req: Request) => {
      // If productText is provided but receiptText is not provided in request
      // if (req?.data?.productText && !req?.data?.receiptText) {
      // For UPDATE: Check if receiptText exists in database
      // if (req.event === "UPDATE") {
      //   const { Products } = cds.entities("com.valantic.preorder.product");
      //   const { SELECT } = cds.ql;
      //   const [ID] = req.params;

      //   const product = (await cds.run(
      //     SELECT.one.from(Products).where({ ID: ID }).columns("receiptText"),
      //   )) as Product;

      //   // Only set receiptText if it doesn't exist in database
      //   if (
      //     !product?.receiptText &&
      //     !req?.data?.receiptText &&
      //     req?.data?.productText
      //   ) {
      //     req.data.receiptText = req.data.productText;
      //   }
      // }
      // For CREATE: Always set receiptText from productText if not provided
      // else {
      //   if (!req?.data?.receiptText && req?.data?.productText) {
      //     req.data.receiptText = req?.data?.productText;
      //   }
      // }
      // }
    });

    this.before(["UPDATE", "CREATE"], "Articles", async (req: Request) => {
      // If productText is provided but receiptText is not provided in request
      if (req?.data?.productText && !req?.data?.receiptText) {
        // For UPDATE: Check if receiptText exists in database
        if (req.event === "UPDATE") {
          const { Articles } = cds.entities("com.valantic.preorder.product");
          const { SELECT } = cds.ql;
          const ID = req.params[0].ID;

          const product = (await cds.run(
            SELECT.one.from(Articles).where({ ID: ID }).columns("receiptText"),
          )) as Article;

          // Only set receiptText if it doesn't exist in database
          if (
            !product?.receiptText &&
            !req?.data?.receiptText &&
            req?.data?.productText
          ) {
            req.data.receiptText = req.data.productText;
          }
        }
        // For CREATE: Always set receiptText from productText if not provided
        else {
          if (!req?.data?.receiptText && req?.data?.productText) {
            req.data.receiptText = req?.data?.productText;
          }
        }
      }
    });

    this.before("UPDATE", "Articles", async (req: Request) => {
      // Set Purchase Price Net value
      if (req?.data?.purchasePriceEURNetto) return
      const { Articles } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.params[0].ID;
      const article = await cds.run(
        SELECT.one.from(Articles)
          .where({ ID: ID })
          .columns("currency_ID", "vat_ID", "purchasePrice", "purchaseFactor"),
      );
      calculateNetPrice(req.data, article);
    });

    this.before("UPDATE", "Articles", async (req: Request) => {
      const { Articles } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.params[0].ID;

      const article = await cds.run(
        SELECT.one.from(Articles).where({ ID: ID }).columns("productText", "supplierProductName"),
      );

      const supplierProductName = req?.data?.supplierProductName
        ? req?.data?.supplierProductName : article?.supplierProductName;

      if (
        req?.data?.supplierProductName &&
        !req?.data?.productText &&
        supplierProductName
      ) {
        req.data.productText = supplierProductName;
      }
    });

    this.before("UPDATE", "Products", async (req: Request) => {
      const { Products } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.params[0].ID;

      const product = await cds.run(
        SELECT.one.from(Products).where({ ID: ID })
          .columns("productText", "supplierProductName", "supplierColor"),
      );

      const supplierProductName = req?.data?.supplierProductName 
        ? req?.data?.supplierProductName : product?.supplierProductName;
      const supplierColor = req?.data?.supplierColor 
        ? req?.data?.supplierColor : product?.supplierColor;   

      
      if ((req?.data?.supplierProductName || req?.data?.supplierColor) &&
          !req?.data?.productText && 
          supplierProductName && supplierColor) {
        req.data.productText = supplierProductName + ", " + supplierColor;
      }
    });

    this.before("UPDATE", "ProductSizes", async (req: Request) => {
      const { ProductSizes } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.params[0].ID;

      const productSize = await cds.run(
        SELECT.one.from(ProductSizes).where({ ID: ID })
          .columns("productText", "supplierProductName", "supplierColor", "size_1_CODE"),
      );
      
      const supplierProductName = req?.data?.supplierProductName 
        ? req?.data?.supplierProductName : productSize?.supplierProductName;
      const supplierColor = req?.data?.supplierColor 
        ? req?.data?.supplierColor : productSize?.supplierColor;  
      const size_1_CODE = req?.data?.size_1_CODE 
        ? req?.data?.size_1_CODE : productSize?.size_1_CODE;  

      if ((req?.data?.supplierProductName || req?.data?.supplierColor || req?.data?.size_1_CODE) &&
          !req?.data?.productText && 
          supplierProductName && supplierColor && size_1_CODE) {
        req.data.productText = supplierProductName + ", " + supplierColor + ", " + size_1_CODE;
      }
    });

    this.before("UPDATE", "Products", async (req: Request) => {
      // Set Purchase Price Net value
      if (req?.data?.purchasePriceEURNetto) return
      const { Products } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.params[0].ID;
      const product = await cds.run(
        SELECT.one.from(Products)
          .where({ ID: ID })
          .columns("currency_ID", "vat_ID", "purchasePrice", "purchaseFactor"),
      );
      calculateNetPrice(req.data, product);
    });

    this.before("UPDATE", "ProductSizes", async (req: Request) => {
      // Set Purchase Price Net value
      if (req?.data?.purchasePriceEURNetto) return
      const { ProductSizes } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.params[0].ID;
      const productSize = await cds.run(
        SELECT.one.from(ProductSizes)
          .where({ ID: ID })
          .columns("currency_ID", "vat_ID", "purchasePrice", "purchaseFactor"),
      );
      calculateNetPrice(req.data, productSize);
    });

    this.after("CREATE", "Products", async (result: any, req: Request) => {
      const { Products } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.data.ID;

      const product = await cds.run(
        SELECT.one.from(Products).where({ ID: ID })
          .columns("productText", "supplierProductName"),
      );
      const matchingproductText = product?.supplierProductName === product?.productText;
      if (matchingproductText && req?.data?.supplierColor) {
        await cds.run(
          UPDATE.entity(Products)
            .set({ productText: (product.productText + ", " + req.data.supplierColor) })
            .where({ ID: ID })
        );
      }
    });

    this.after("CREATE", "ProductSizes", async (result: any, req: Request) => {
      const { ProductSizes } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const ID = req.data.ID;

      const productSize = await cds.run(
        SELECT.one.from(ProductSizes).where({ ID: ID })
          .columns("productText", "supplierProductName", "supplierColor"),
      );
      const matchingproductText = 
        productSize?.supplierProductName + ", " + productSize?.supplierColor === productSize?.productText;
      if (matchingproductText && req?.data?.size_1_CODE) {
        await cds.run(
          UPDATE.entity(ProductSizes)
            .set({ productText: (productSize.productText + ", " + req.data.size_1_CODE) })
            .where({ ID: ID })
        );
      }
    });

    this.before("READ", ["Articles", "FlatArticles"], async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
      );
      if (req.query.SELECT?.where) {
        req.query.and({ consumerTopic_ID: { in: ids } });
      } else {
        req.query.where({ consumerTopic_ID: { in: ids } });
        req.query.or({ consumerTopic_ID: null });
      }
    });

    this.before("READ", ["Products", "FlatAppointments", "ProductsTable"], async (req: any) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map((topic: Article) => topic.consumerTopic_ID);
      if (req.query.SELECT?.where) {
        req.query.and({ consumerTopic_ID: { in: ids } });
      } else {
        req.query.where({ consumerTopic_ID: { in: ids } });
        req.query.or({ consumerTopic_ID: null });
      }
    });

    this.before(
      "READ",
      ["ProductSizes", "FlatProductSizes", "ProductSizesTable"],
      async (req: any) => {
        const allowedTopics = await fetchAllowedConsumerTopics(req);
        const ids = allowedTopics.map(
          (topic: Product) => topic.consumerTopic_ID,
        );
        if (req.query.SELECT?.where) {
          req.query.and({ consumerTopic_ID: { in: ids } });
        } else {
          req.query.where({ consumerTopic_ID: { in: ids } });
          req.query.or({ consumerTopic_ID: null });
        }
      },
    );

    this.before(
      ["READ"],
      [
        "Articles",
        "Products",
        "ProductSizes",
        "FlatArticles",
        "FlatAppointments",
        "FlatProductSizes",
      ],
      async (req: any) => {
        const { Articles, Products, ProductSizes } = cds.entities(
          "com.valantic.preorder.product",
        );
        const { UPDATE } = cds.ql;

        const today = new Date();

        // 1) Auto-mark expired items
        switch (req.entity) {
          case "Product.Articles":
            await cds.run(
              UPDATE.entity(Articles)
                .set({ status_ID: "MarkedForDeletion" })
                .where({
                  endOfLifeCycle: { "<": today },
                  status_ID: { "<>": "MarkedForDeletion" },
                }),
            );
            break;
          case "Product.Products":
            await cds.run(
              UPDATE.entity(Products)
                .set({ status_ID: "MarkedForDeletion" })
                .where({
                  endOfLifeCycle: { "<": today },
                  status_ID: { "<>": "MarkedForDeletion" },
                }),
            );
            break;
          case "Product.ProductSizes":
            await cds.run(
              UPDATE.entity(ProductSizes)
                .set({ status_ID: "MarkedForDeletion" })
                .where({
                  endOfLifeCycle: { "<": today },
                  status_ID: { "<>": "MarkedForDeletion" },
                }),
            );
            break;
          default:
            break;
        }

        // 2) If UI explicitly filters for MarkedForDeletion → DO NOT block it
        const uiFilter = JSON.stringify(req.query.SELECT?.where || "");

        if (uiFilter.includes("MarkedForDeletion")) {
          console.log(
            "UI requested MarkedForDeletion → skipping backend filter",
          );
          return;
        }

        const hasID =
          req.data?.ID ||
          (req.params && req.params.length > 0) ||
          (typeof req.query?.SELECT?.from?.ref?.[1] === "object" &&
            req.query?.SELECT?.from?.ref?.[1]?.where); // object page pattern

        if (hasID) {
          console.log("Object page request → allow MarkedForDeletion");
          return;
        }

        // List page → hide deleted
        console.log("List request → hide MarkedForDeletion");
        if (req.query.SELECT?.where) {
          req.query.and({ status_ID: { "!=": "MarkedForDeletion" } });
        } else {
          req.query.where({ status_ID: { "!=": "MarkedForDeletion" } });
        }

        console.log("Applied backend filter hide deleted");
      },
    );

    this.before("CREATE", "Articles", async (req: Request) => {
      const rule = await this.getConsumerTopicBrand(req.data as Article);
      const alreadyExistingArticle =
        await this.getExistingSupplierProductNumber(
          req.data?.consumerTopic_ID,
          req.data?.brand_ID,
          req.data?.supplier_ID as string,
          req.data?.supplierProductNumber as string,
        );
      if (alreadyExistingArticle?.ID) {
        return req.error(409, "PRODUCT_ALREADY_EXISTS");
      }

      req.data.status_ID = req.data.status_ID ?? "InProgress";
      req.data.storageLocation_LGORT = '1000'
      req.data.productType_ID = '01';
      if (!rule) {
        return req.warn(404, "RULE_NOT_EXISTING_WARN");
      }
      addRuleDataToArticles(req.data, rule);
      Object.assign(req.data, await this.getSupplierTC(req.data.supplier_ID as string));
    });

    this.before("UPDATE", "Articles", async (req: Request) => {
      const articleId = req.data.ID;

      const oldArticle = await cds.run(
        SELECT.one.from(Article).where({ ID: articleId }),
      );
      // Stash it on the request object so 'after UPDATE' can access it
      req.data.oldArticle = oldArticle;
    });

    this.after("UPDATE", "Articles", async (result: any, req: Request) => {
      const articleId = req.data.ID;
      const oldArticle = req.data.oldArticle;
      const updatedArticle = result;

      const changedFields = getChangedFields(oldArticle, updatedArticle);
      if (changedFields.size === 0) return;

      // Update Option level fields
      const options = await cds.run(
        SELECT.from(Products).where({ article_ID: articleId }),
      );
      // if (!options || options.length === 0) return;
      for (const option of options) {
        const optionUpdatedData = mapNewValue(option, changedFields);
        if (Object.keys(optionUpdatedData).length > 0) {
          await UPDATE.entity(Products)
            .where({ ID: option.ID })
            .set(optionUpdatedData);
        }

        // Update Varaint level fields
        const variants = await cds.run(
          SELECT.from(ProductSizes).where({ product_ID: option.ID }),
        );
        // if (!variants || variants.length === 0) continue;
        for (const variant of variants) {
          const variantUpdatedData = mapNewValue(variant, changedFields);
          if (Object.keys(variantUpdatedData).length > 0) {
            await UPDATE.entity(ProductSizes)
              .where({ ID: variant.ID })
              .set(variantUpdatedData);
          }
        }
      }
    });

    this.before("CREATE", "Products", async (req: Request) => {
      const alreadyExistingOption = await this.getOption(req.data as Product);

      if (alreadyExistingOption?.ID) {
        return req.error(404, "OPTION_ALREADY_EXISTS")
      }
      const article = await this.getArticle(req.data as Product);
      const consumerTopicBrand = await this.getConsumerTopicBrand(
        req.data as Product,
      );
      if (!article) {
        return req.error(404, "ARTICLE_RULE_NOT_EXISTING_ERROR");
      }
      req.data.article_ID = article?.ID;
      req.data.status_ID = req.data.status_ID ?? "InProgress";
      if (article) {
        propagateRuleFromParent(req.data, article);
      }
      if (consumerTopicBrand) {
        propagateRuleFromParent(req.data, consumerTopicBrand);
      }
    });

    this.after("CREATE", "Products", async (result: any, req: Request) => {
      const { SELECT, UPDATE } = cds.ql;
      const {
        Articles,
        Products,
        ArticlesToWritingAppointments,
        ProductsToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      const product = await cds.run(
        SELECT.one.from(Products)
          .where({ ID: result.ID })
          .columns("article_ID")
      );
      const articleStatus = await this.getParentStatus(Articles, product?.article_ID)
      try {
        if (articleStatus === "CreatedInSAP") {
          await cds.run(
            UPDATE.entity(Articles)
              .where({ ID: product?.article_ID })
              .set({ status_ID: "PartiallyCreatedInSAP" })
          )
        }
        console.log("New Option added -> Article status updated");
        const PtoWA: any[] = [];
        const AToWA = await cds.run(
          SELECT.from(ArticlesToWritingAppointments)
            .where({ "article_ID": product?.article_ID })
            .columns("*")
        );
        if (AToWA && AToWA.length > 0) {
          AToWA.forEach((item: any, index: number) => {
            PtoWA.push({
              writingAppointment_ID: item.writingAppointment_ID,
              product_ID: result.ID,
              index: index,
              deliveryDateVZ: item.deliveryDateVZ,
              deliveryDateShop: item.deliveryDateShop,
            })
          });

          const res = await cds.run(
            INSERT.into(ProductsToWritingAppointments).entries(PtoWA)
          );
          console.log("Writing Appointments propagated", res);
        }
      } catch (error) {
        console.log("New Option added -> Article status update failed");
      }
    })

    this.before("UPDATE", "Products", async (req: Request) => {
      const optionId = req.data.ID;

      const oldOption = await cds.run(
        SELECT.one.from(Products).where({ ID: optionId }),
      );
      // Stash it on the request object so 'after UPDATE' can access it
      req.data.oldOption = oldOption;
    });

    this.after("UPDATE", "Products", async (result: any, req: Request) => {
      const optionId = req.data.ID;
      const oldOption = req.data.oldOption;
      const updatedOption = result;

      const changedFields = getChangedFields(oldOption, updatedOption);
      if (changedFields.size === 0) return;

      // Update Varaint level fields
      const variants = await cds.run(
        SELECT.from(ProductSizes).where({ product_ID: optionId }),
      );
      // if (!variants || variants.length === 0) return;
      for (const variant of variants) {
        const variantUpdatedData = mapNewValue(variant, changedFields);
        if (Object.keys(variantUpdatedData).length > 0) {
          await UPDATE.entity(ProductSizes)
            .where({ ID: variant.ID })
            .set(variantUpdatedData);
        }
      }
    });

    this.before("CREATE", "ProductSizes", async (req: Request) => {
      const alreadyExistingSizes = await this.getExistingSizes(
        req.data as ProductSizes,
      );

      if (alreadyExistingSizes?.ID) {
        return req.error(404, "PRODUCTSIZES_ALREADY_EXISTS")
      }

      const option = await this.getOption(req.data as ProductSizes);
      const article = await this.getArticle(req.data as ProductSizes);
      const consumerTopicBrand = await this.getConsumerTopicBrand(
        req.data as ProductSizes,
      );
      if (!option) {
        return req.error(404, "OPTION_RULE_NOT_EXISTING_ERROR");
      }
      req.data.article_ID = article?.ID;
      req.data.product_ID = option?.ID;
      req.data.status_ID = req.data.status_ID ?? "InProgress";
      if (option) {
        propagateRuleFromParent(req.data, option);
      }
      if (article) {
        propagateRuleFromParent(req.data, article);
      }
      if (consumerTopicBrand) {
        propagateRuleFromParent(req.data, consumerTopicBrand);
      }
    });

    this.after("CREATE", "ProductSizes", async (result: any, req: Request) => {
      const { SELECT, UPDATE } = cds.ql;
      const {
        Articles,
        Products,
        ProductSizes,
        ProductsToWritingAppointments,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      const productSize = await cds.run(
        SELECT.one.from(ProductSizes)
          .where({ ID: result.ID })
          .columns("product_ID", "article_ID")
      );
      const articleStatus = await this.getParentStatus(Articles, productSize?.article_ID)
      const productStatus = await this.getParentStatus(Products, productSize?.product_ID)
      try {
        if (productStatus === "CreatedInSAP") {
          await cds.run(
            UPDATE.entity(Products)
              .where({ ID: productSize?.product_ID })
              .set({ status_ID: "PartiallyCreatedInSAP" })
          )
        }
        if (articleStatus === "CreatedInSAP") {
          await cds.run(
            UPDATE.entity(Articles)
              .where({ ID: productSize?.article_ID })
              .set({ status_ID: "PartiallyCreatedInSAP" })
          )
        }
        console.log("New Variant added -> Article/Option status updated");
        const PStoWA: any[] = [];
        const PToWA = await cds.run(
          SELECT.from(ProductsToWritingAppointments)
            .where({ "product_ID": productSize?.product_ID })
            .columns("*")
        );
        if (PToWA && PToWA.length > 0) {
          PToWA.forEach((item: any, index: number) => {
            PStoWA.push({
              writingAppointment_ID: item.writingAppointment_ID,
              productSize_ID: result.ID,
              index: index,
              deliveryDateVZ: item.deliveryDateVZ,
              deliveryDateShop: item.deliveryDateShop,
            })
          });

          const res = await cds.run(
            INSERT.into(ProductSizesToWritingAppointments).entries(PStoWA)
          );
          console.log("Writing Appointments propagated", res);
        }
      } catch (error) {
        console.log("New Variant added -> Article/Option status update failed");
      }
    })

    /*this.before("UPDATE", "Products", async (req: Request) => {
      const { Products } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const [ID] = req.params;
      const product = (await cds.run(
        SELECT.one.from(Products).where({ ID: ID })
      )) as Product;

      //Set to in progress after change from buyer
      if (product.status_ID === "NewSupplierProduct")
        req.data.status_ID = "InProgress";
    });*/

    //Check iff supplier ID is assigned to user
    this.before("*", "SupplierProducts", async (req: Request) => {
      console.log("USER ATTRIBUTES", req.user, req.user?.attr);
      //TODO Supplier User Attribute
      if (!req.user?.attr?.supplier_ID) {
        req.reject(403, "SUPPLIER_NOT_ASSIGNED");
      }
    });

    //Filter products by supplier
    this.before("READ", "SupplierProducts", async (req: any) => {
      if (req.query.SELECT?.where) {
        //TODO Supplier User Attribute
        req.query.and({ supplier_ID: req.user?.attr?.supplier_ID });
      } else {
        req.query.where({ supplier_ID: req.user?.attr?.supplier_ID });
      }
    });

    //Check if the supplier ID of user and product match
    this.before("UPDATE", "SupplierProducts", async (req: Request) => {
      const { Products } = cds.entities("com.valantic.preorder.product");
      const { SELECT } = cds.ql;
      const [ID] = req.params;
      const product = (await cds.run(
        SELECT.one.from(Products).where({ ID: ID }),
      )) as Product;

      //TODO Check supplier attribute of user
      if (product.supplier_ID != req.user?.attr?.supplier_ID)
        req.reject(403, "NO_CROSS_SUPPLIER_UPDATE");

      //Do not allow updates if not in supplier status
      if (product.status_ID != "ReleasedForSupplier")
        req.reject(403, "ARTICLE_UPDATE_NOT_ALLOWED");
      //Set automaticall to in porgress after updating
      else req.data.status = "InProgress";
    });

    //Overwrite supplier ID by user supplier ID
    this.before("CREATE", "SupplierProducts", async (req: Request) => {
      req.data.supplier_ID = req.user?.attr?.supplier_ID;
      req.data.status = "NewSupplierProduct";
    });

    this.on("checkForExistingProduct", async (req: Request) => {
      const { supplierProductNumber, GTIN, SAPArticleNumber } = req.data as {
        supplierProductNumber: string;
        GTIN: string;
        SAPArticleNumber: string;
      };

      if (SAPArticleNumber) {
        //add leading zeros if needed. SAP Article Numbers are always 18 characters long
        const length = SAPArticleNumber.length;
        const leadingZeros = "0".repeat(18 - length);
        const SAPArticleNumberWithLeadingZeros =
          leadingZeros + SAPArticleNumber;

        //Check if product already exists in SAP
        const findInMARABySAPNumber = await cds.run(
          SELECT.one.from(MARA).where({ ID: SAPArticleNumberWithLeadingZeros }),
        );
        if (findInMARABySAPNumber) {
          return { existing: true, existingIn: "SAP" };
        }
      }

      if (supplierProductNumber) {
        const findInEINA = await cds.run(
          SELECT.one.from(EINA).where({ IDNLF: supplierProductNumber }),
        );
        if (findInEINA) {
          return { existing: true, existingIn: "SAP" };
        }
      }

      if (GTIN) {
        const findInMARA = await cds.run(
          SELECT.one.from(MARA).where({ EAN: GTIN }),
        );
        if (findInMARA) {
          return { existing: true, existingIn: "SAP" };
        }
        const findInPRICAT_K003 = await cds.run(
          SELECT.one.from(PRICAT_K003).where({ EAN_UPC_BASE: GTIN }),
        );

        if (findInPRICAT_K003) {
          return { existing: true, existingIn: "PRICAT" };
        }
      }

      return { existing: false, existingIn: null };
    });

    this.on("searchProductsInSAP", async (req: Request) => {
      const { searchTerm } = req.data as { searchTerm: string };

      const results: any = [];

      let queryTerm = searchTerm;

      const resultsFromEINA = await cds.run(
        SELECT.from(EINA)
          .where({
            IDNLF: queryTerm,
          })
          .columns("ID", "IDNLF", "INFNR")
          .limit(20),
      );

      if (resultsFromEINA && resultsFromEINA.length > 0) {
        queryTerm = resultsFromEINA[0].ID;
      }

      const maraID = queryTerm.padStart(18, "0");

      const resultsFromMARA = await cds.run(
        SELECT.from(MARA).where({
          ID: maraID,
          or: { EAN: queryTerm, or: { SATNR: queryTerm } },
        }),
      );

      if (resultsFromMARA && resultsFromMARA.length > 0) {
        const returnArray = resultsFromMARA.map((item: MARA) => ({
          ID: item.ID,
          COLOR: item.COLOR,
          EAN: item.EAN,
          TYPE: item.COLOR
            ? item.COLOR?.length > 0
              ? "Variante"
              : "Option"
            : "Option",
          NAME: item.NAME,
        }));

        const filteredReturnArray = returnArray.filter(
          (item: any) => item.TYPE === "Variante",
        );
        const sortedReturnArray = filteredReturnArray.sort((a: any, b: any) =>
          a.ID.localeCompare(b.ID),
        );
        return { exists: true, results: sortedReturnArray };
      }

      const resultsFromPRICAT_K003 = await cds.run(
        SELECT.distinct.from(PRICAT_K003).where({
          EAN_UPC_BASE: queryTerm,
        }),
      );

      if (resultsFromPRICAT_K003 && resultsFromPRICAT_K003.length > 0) {
        const returnArray = resultsFromPRICAT_K003.map((item: PRICAT_K003) => ({
          ID: item.EAN_UPC_BASE,
          TYPE: "PRICAT",
        }));
        return { exists: true, results: [returnArray[0]] };
      }

      return { exists: false };
    });

    this.on("importProductFromSAP", async (req: Request) => {
      const allowedTopics = await fetchAllowedConsumerTopics(req);
      const ids = allowedTopics.map(
        (topic: SupplierConsumerTopicBrand) => topic.consumerTopic_ID,
      );

      const { materialNumber, color, type } = req.data as {
        materialNumber: string;
        color: string;
        type: string;
      };
      //add leading zeros if needed. SAP Article Numbers are always 18 characters long
      const length = materialNumber.length;
      const leadingZeros = "0".repeat(18 - length);
      const materialNumberWithLeadingZeros = leadingZeros + materialNumber;

      let baseArticle: MARA;

      const formatSAPDate = (
        raw?: string | null,
      ):
        | `${number}${number}${number}${number}-${number}${number}-${number}${number}`
        | null
        | undefined => {
        if (!raw) return undefined;
        const trimmed = raw.trim();
        const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
        if (compact) {
          return `${compact[1]}-${compact[2]}-${compact[3]}` as `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          return trimmed as `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
        }
        return null;
      };

      //Step 1: Check if Product is in MARA

      if (type == "Variante") {
        const findInMARABySAPNumber: MARA = await cds.run(
          SELECT.one.from(MARA).where({ ID: materialNumberWithLeadingZeros }),
        );
        if (!findInMARABySAPNumber) {
          return { imported: false, reason: "NOT_FOUND_IN_SAP" };
        }
        baseArticle = await cds.run(
          SELECT.one.from(MARA).where({ ID: findInMARABySAPNumber.SATNR }),
        );
        const existingProduct: Product = await cds.run(
          SELECT.one
            .from(Products)
            .where({ sapNumber: baseArticle.ID, supplierColor: color }),
        );
        if (existingProduct) {
          if (existingProduct.status_ID == "ToCheck") {
            req.reject("PRODUCT_ALREADY_CREATED_IN_SAP");
          } else {
            const productSizes = await cds.run(
              UPDATE.entity(ProductSizes)
                .where({
                  product_ID: existingProduct.ID,
                  size_1_CODE: findInMARABySAPNumber.SIZE1 || null,
                  size_2_CODE: findInMARABySAPNumber.SIZE2 || null,
                })
                .set({
                  GTIN: findInMARABySAPNumber.EAN || null,
                  sapNumber: findInMARABySAPNumber.ID,
                  size_1_CODE: findInMARABySAPNumber.SIZE1,
                  size_2_CODE: findInMARABySAPNumber.SIZE2,
                }),
            );
            // return { imported: true, productID: existingProduct.ID }
          }
        }
        const resultsFromEINA = await cds.run(
          SELECT.from(EINA).where({
            ID: baseArticle.ID,
          }),
        );
        let to_Purchase = [];
        let supplierWithoutLeadingZeros = "";
        if (resultsFromEINA.length > 0) {
          const resultsFromEINE = await cds.run(
            SELECT.from(EINE).where({
              INFNR: resultsFromEINA[0].INFNR,
            }),
          );

          if (resultsFromEINE.length > 0) {
            to_Purchase.push({
              validTo: resultsFromEINE[0].PRDAT || null,
              currency_ID: resultsFromEINE[0].WAERS || null,
              purchasePrice: parseFloat(resultsFromEINE[0].NETPR || "0"),
              purchasePriceEURNetto: parseFloat(
                resultsFromEINE[0].NETPR || "0",
              ),
            });
          }

          supplierWithoutLeadingZeros = resultsFromEINA[0].LIFNR.replace(
            /^0+/,
            "",
          );
        }

        /* GPOPT-1175: Remove valid range in purchase and sales data
        let to_Sales = [
          {
            uvpType_ID: baseArticle.ZZUVP_TYP || null,
            uvpPrice: baseArticle.ZZUVP_PREIS || null,
          },
        ];
        */

        const options = await cds.run(
          SELECT.from(MARA).where({
            SATNR: findInMARABySAPNumber.SATNR,
            COLOR: color,
          }),
        );

        const optionsArray: ProductSizes = [];

        for (const option of options) {
          optionsArray.push({
            sapNumber: option.ID,
            size_1_CODE:
              typeof option.SIZE1 === "string" && option.SIZE1.length > 0
                ? option.SIZE1
                : null,
            size_2_CODE:
              typeof option.SIZE2 === "string" && option.SIZE2.length > 0
                ? option.SIZE2
                : null,
            GTIN:
              typeof option.EAN === "string" && option.EAN.length > 0
                ? option.EAN
                : null,
          });
        }

        const productData: Product = {
          supplierProductNumber:
            resultsFromEINA.length > 0 ? resultsFromEINA[0].IDNLF : null,
          supplierProductName: baseArticle.ZZMATNR_NAME,
          supplierColor: color || null,
          evaluationColor_ID:
            typeof findInMARABySAPNumber.ZZMATNR_COLOR === "string" &&
              findInMARABySAPNumber.ZZMATNR_COLOR.length > 0
              ? findInMARABySAPNumber.ZZMATNR_COLOR
              : null,
          program_ID:
            typeof baseArticle.FASHGRD === "string" &&
              baseArticle.FASHGRD.length > 0
              ? baseArticle.FASHGRD
              : null,
          productText: baseArticle.NAME,
          // GTIN: baseArticle.EAN,
          sapNumber: baseArticle.ID,
          status_ID: "CreatedInSAP",
          loadingGroup_ID:
            typeof baseArticle.WLADG === "string" &&
              baseArticle.WLADG.length > 0
              ? baseArticle.WLADG
              : null,
          gridBox_ID:
            typeof baseArticle.ZZ9GRIDBOX === "string" &&
              baseArticle.ZZ9GRIDBOX.length > 0
              ? baseArticle.ZZ9GRIDBOX
              : null,
          pattern_ID:
            typeof baseArticle.ZZMUSTER === "string" &&
              baseArticle.ZZMUSTER.length > 0
              ? baseArticle.ZZMUSTER
              : null,
          material1_ID:
            typeof baseArticle.FIBER_PART1 === "string" &&
              baseArticle.FIBER_PART1.length > 0
              ? baseArticle.FIBER_PART1
              : null,
          portion1: parseInt(baseArticle.FIBER_CODE1 || "0"),
          material2_ID:
            typeof baseArticle.FIBER_CODE2 === "string" &&
              baseArticle.FIBER_CODE2.length > 0
              ? baseArticle.FIBER_CODE2
              : null,
          portion2: parseInt(baseArticle.FIBER_PART2 || "0"),
          material3_ID:
            typeof baseArticle.FIBER_CODE3 === "string" &&
              baseArticle.FIBER_CODE3.length > 0
              ? baseArticle.FIBER_CODE3
              : null,
          portion3: parseInt(baseArticle.FIBER_PART3 || "0"),
          material4_ID:
            typeof baseArticle.FIBER_CODE4 === "string" &&
              baseArticle.FIBER_CODE4.length > 0
              ? baseArticle.FIBER_CODE4
              : null,
          portion4: parseInt(baseArticle.FIBER_PART4 || "0"),
          material5_ID:
            typeof baseArticle.FIBER_CODE5 === "string" &&
              baseArticle.FIBER_CODE5.length > 0
              ? baseArticle.FIBER_CODE5
              : null,
          portion5: parseInt(baseArticle.FIBER_PART5 || "0"),
          // sustainabilityCertificateNumber: baseArticle.ZZNH_ZERTNR,
          sustainabilitySealOfApproval_GSNR: baseArticle.ZZNH_GSNR || null,
          sustainabilityCertifier: baseArticle.ZZNH_ZERTI || null,
          sustainabilityPortion: parseInt(baseArticle.ZZNH_ANTEIL || "0"),
          targetGroup_ID:
            typeof baseArticle.ZZZIELGRUPPE === "string" &&
              baseArticle.ZZZIELGRUPPE.length > 0
              ? baseArticle.ZZZIELGRUPPE
              : null,
          sizeSystem_ID:
            typeof baseArticle.ZZGROE_SYS === "string" &&
              baseArticle.ZZGROE_SYS.length > 0
              ? baseArticle.ZZGROE_SYS
              : null,
          endOfLifeCycle: formatSAPDate(baseArticle.ZZENDLZ),
          specialProduct_ID:
            typeof baseArticle.ZZSONDERARTIKEL === "string" &&
              baseArticle.ZZSONDERARTIKEL.length > 0
              ? baseArticle.ZZSONDERARTIKEL
              : null,
          availableFrom: formatSAPDate(baseArticle.ZZLIFAB),
          availableUntil: formatSAPDate(baseArticle.ZZLIFBI),
          houseGroup_ID:
            typeof baseArticle.ZZHG_AKT === "string" &&
              baseArticle.ZZHG_AKT.length > 0
              ? baseArticle.ZZHG_AKT
              : null,
          seasonYear: baseArticle.SAISJ,
          // size1_CODE:
          //   typeof baseArticle.SIZE1 === "string" &&
          //   baseArticle.SIZE1.length > 0
          //     ? baseArticle.SIZE1
          //     : null,
          // size2_CODE:
          //   typeof baseArticle.SIZE2 === "string" &&
          //   baseArticle.SIZE2.length > 0
          //     ? baseArticle.SIZE2
          //     : null,
          brand_ID:
            typeof baseArticle.BRAND_ID === "string" &&
              baseArticle.BRAND_ID.length > 0
              ? baseArticle.BRAND_ID
              : null,
          series_ID:
            typeof baseArticle.ZZSERIE === "string" &&
              baseArticle.ZZSERIE.length > 0
              ? baseArticle.ZZSERIE
              : null,
          consumerTopic_ID:
            typeof baseArticle.HIERNODE5 === "string" &&
              baseArticle.HIERNODE5.length > 0
              ? baseArticle.HIERNODE5
              : null,
          supplier_ID:
            typeof supplierWithoutLeadingZeros === "string" &&
              supplierWithoutLeadingZeros.length > 0
              ? supplierWithoutLeadingZeros
              : null,
          topicComponent_ID:
            typeof baseArticle.HIERNODE6 === "string" &&
              baseArticle.HIERNODE6.length > 0
              ? baseArticle.HIERNODE6
              : null,
          assortmentModule_ID:
            typeof baseArticle.HIERNODE7 === "string" &&
              baseArticle.HIERNODE7.length > 0
              ? baseArticle.HIERNODE7
              : null,
          to_Size: optionsArray,
          currency_ID: to_Purchase[0]?.currency_ID || null,
          purchasePrice: to_Purchase[0]?.purchasePrice || null,
          purchasePriceEURNetto: to_Purchase[0]?.purchasePriceEURNetto || null,
          uvpType_ID: baseArticle.ZZUVP_TYP || null,
          uvpPrice: baseArticle.ZZUVP_PREIS || null,
          /* GPOPT-1175: Remove valid range in purchase and sales data
          to_Purchase: to_Purchase,
          to_Sales: to_Sales,*/
          isImported: true,
        };

        const result = await cds.run(
          INSERT.into(Products).entries([productData]),
        );
        return { imported: true, productID: result.ID };
      }

      if (type == "PRICAT") {
        //checl if gtin already exists
        const existingProductByGTIN: any = await cds.run(
          SELECT.one.from(ProductSizes).where({ GTIN: materialNumber }),
        );

        const resultsFromPRICAT_K003 = await cds.run(
          SELECT.distinct.from(PRICAT_K003).where({
            EAN_UPC_BASE: materialNumber,
          }),
        );
        console.log("RESULTS FROM PRICAT", resultsFromPRICAT_K003);

        const resultsFromPRICAT_K001 = await cds.run(
          SELECT.one.from(PricatCatalogs).where({
            ID: resultsFromPRICAT_K003[0].PRINBR,
          }),
        );

        function getValue(charName: String) {
          const item = resultsFromPRICAT_K003.find(
            (obj: PRICAT_K003) => obj.CHARACTERISTIC === charName,
          );
          return item ? item.VALUE : null;
        }

        function getPricing(charName: String) {
          const item = resultsFromPRICAT_K003.find(
            (obj: PRICAT_K003) => obj.COND_TYPE === charName,
          );
          return item ? item : null;
        }

        const productData: Product = {
          supplierProductNumber: resultsFromPRICAT_K003[0].PROD_ID_SENDER,
          supplier_ID: resultsFromPRICAT_K001.LIFNR,
          supplierColor: getValue("+++FARBE+++"),
          // size1_CODE: getValue("+++GROESSE1+++"),
          status_ID: "InProgress",
          seasonType_ID:
            resultsFromPRICAT_K003[0].SEASON?.length > 0
              ? resultsFromPRICAT_K003[0].SEASON
              : null,
          isImported: true,
        };

        const vat = getPricing("MWST");
        const purchasePrice = getPricing("EKPR");
        const salesPrice = getPricing("VKE0");

        /* GPOPT-1175: Remove valid range in purchase and sales data
        const to_purchase = [
          {
            currency_ID: resultsFromPRICAT_K003[0].CURRENCY_ISO,
            purchasePrice: parseFloat(purchasePrice.CONDITION_VALUE),
            validTo: purchasePrice.COND_VALID_TO,
            validFrom: purchasePrice.COND_VALID_FROM,
            vat_ID: vat.CONDITION_VALUE == 19.0 ? "Full" : "Half",
            purchasePriceEURNetto: parseFloat(purchasePrice.CONDITION_VALUE),
          },
        ];

        const to_Sales = [
          {
            currency_ID: resultsFromPRICAT_K003[0].CURRENCY_ISO,
            uvpPrice: parseFloat(salesPrice.CONDITION_VALUE),
            validFrom: salesPrice.COND_VALID_FROM,
            validTo: salesPrice.COND_VALID_TO,
            retailPrice: parseFloat(salesPrice.CONDITION_VALUE),
          },
        ];
        */

        if (existingProductByGTIN) {
          const productSizes = await cds.run(
            UPDATE.entity(ProductSizes)
              .where({
                product_ID: existingProductByGTIN.product_ID,
                GTIN: materialNumber,
              })
              .set({
                size_1_CODE: getValue("+++GROESSE1+++") || null,
                size_2_CODE: getValue("+++GROESSE2+++") || null,
                GTIN: resultsFromPRICAT_K003[0].EAN_UPC_BASE || null,
              }),
          );
          return { imported: true };
        } else {
          productData.to_Size = [
            {
              size_1_CODE: getValue("+++GROESSE1+++") || null,
              size_2_CODE: getValue("+++GROESSE2+++") || null,
              GTIN: resultsFromPRICAT_K003[0].EAN_UPC_BASE || null,
            },
          ];
          productData.currency_ID = resultsFromPRICAT_K003[0].CURRENCY_ISO;
          productData.purchasePrice = parseFloat(purchasePrice.CONDITION_VALUE);
          productData.vat_ID = vat.CONDITION_VALUE == 19.0 ? "Full" : "Half";
          productData.purchasePriceEURNetto = parseFloat(
            purchasePrice.CONDITION_VALUE,
          );
          productData.currency_ID = resultsFromPRICAT_K003[0].CURRENCY_ISO;
          productData.uvpPrice = parseFloat(salesPrice.CONDITION_VALUE);
          productData.retailPrice = parseFloat(salesPrice.CONDITION_VALUE);
          /* GPOPT-1175: Remove valid range in purchase and sales data
          productData.to_Purchase = to_purchase;
          productData.to_Sales = to_Sales;
          */
          const productResult = await cds.run(
            INSERT.into(Products).entries([productData]),
          );
          return { imported: true, productID: productResult.ID };
        }
      }
      req.reject("NOT_SUPPORTED_TYPE");
    });

    this.before("CREATE", "ProductsToWritingAppointments", async (req: any) => {
      const { product_ID, writingAppointment_ID } = req.data;
      const error = await checkSupplyTypeForProduct(
        writingAppointment_ID,
        product_ID,
        "option"
      );
      if (error) {
        req.reject(409, error.code, undefined, error.args);
      }
      const index = await getCurrentIndexForProductInWritingAppointment(
        writingAppointment_ID,
      );
      req.data.index = index;
      Object.assign(req.data, await getPrefilledPlanningProductFields(product_ID, "option"));
    });

    this.before("CREATE", "ArticlesToWritingAppointments", async (req: any) => {
      const { article_ID, writingAppointment_ID } = req.data;
      const error = await checkSupplyTypeForProduct(
        writingAppointment_ID,
        article_ID,
        "article",
      );
      if (error) {
        req.reject(409, error.code, undefined, error.args);
      }
      Object.assign(req.data, await getPrefilledPlanningProductFields(article_ID, "article"));
    });

    this.before(
      "CREATE",
      "ProductSizesToWritingAppointments",
      async (req: any) => {
        const { productSize_ID, writingAppointment_ID } = req.data;
        const error = await checkSupplyTypeForProduct(
          writingAppointment_ID,
          productSize_ID,
          "variant",
        );
        if (error) {
          req.reject(409, error.code, undefined, error.args);
        }
        Object.assign(req.data, await getPrefilledPlanningProductFields(productSize_ID, "variant"));
      },
    );

    this.after("CREATE", "ArticlesToWritingAppointments", async (result: any, req: Request) => {
      const {
        Products,
        ProductSizes,
        ProductsToWritingAppointments,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      const products = await cds.run(
        SELECT.from(Products)
          .where({ article_ID: result.article_ID })
          .columns("*")
      );

      for (const product of products) {
        const PSToWA = [];
        
        // Duplicate check at option level
        const existingProduct = await cds.run(
          SELECT.one
            .from(ProductsToWritingAppointments)
            .where({
              product_ID: product.ID,
              writingAppointment_ID: result.writingAppointment_ID
            })
        );
        if (existingProduct) continue;

        const error = await checkSupplyTypeForProduct(
          result.writingAppointment_ID,
          product.ID,
          "option"
        );
        if (error) {
          req.warn(409, error.code, undefined, error.args);
          continue
        }

        const PToWA = {
          product_ID: product.ID,
          writingAppointment_ID: result.writingAppointment_ID,
          ... await getPrefilledPlanningProductFields(product.ID, "option")
        }

        // Fetch all ProductSizes under this Product
        const productSizes = await cds.run(
          SELECT
            .from(ProductSizes)
            .where({ product_ID: product.ID })
        );

        for (const productSize of productSizes) {
          // Duplicate check at variant level
          const existingProductSizes = await cds.run(
            SELECT.one
              .from(ProductSizesToWritingAppointments)
              .where({
                productSize_ID: productSize.ID,
                writingAppointment_ID: result.writingAppointment_ID
              })
          );
          if (existingProductSizes) continue;

          const error = await checkSupplyTypeForProduct(
            result.writingAppointment_ID,
            productSize.ID,
            "variant"
          );
          if (error) {
            req.warn(409, error.code, undefined, error.args);
            continue
          }

          const PSToWAEntry = {
            productSize_ID: productSize.ID,
            writingAppointment_ID: result.writingAppointment_ID,
            ... await getPrefilledPlanningProductFields(productSize.ID, "variant")
          }
          PSToWA.push(PSToWAEntry);
        }
        await Promise.all([
          cds.run(INSERT.into(ProductsToWritingAppointments).entries(PToWA)),
          cds.run(INSERT.into(ProductSizesToWritingAppointments).entries(PSToWA))
        ]);
      }
    })

    this.after("CREATE", "ProductsToWritingAppointments", async (result: any, req: Request) => {
      const {
        ProductSizes,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");
      const PSToWA = [];

      const productSizes = await cds.run(
        SELECT.from(ProductSizes)
          .where({ product_ID: result.product_ID })
          .columns("*")
      );

      for (const productSize of productSizes) {
        // Duplicate check at variant level
        const existingProductSizes = await cds.run(
          SELECT.one
            .from(ProductSizesToWritingAppointments)
            .where({
              productSize_ID: productSize.ID,
              writingAppointment_ID: result.writingAppointment_ID
            })
        );
        if (existingProductSizes) continue;

        const error = await checkSupplyTypeForProduct(
          result.writingAppointment_ID,
          productSize.ID,
          "variant",
        );
        if (error) {
          req.warn(409, error.code, undefined, error.args);
          continue;
        }

        const PSToWAEntry = {
          productSize_ID: productSize.ID,
          writingAppointment_ID: result.writingAppointment_ID,
          ... await getPrefilledPlanningProductFields(productSize.ID, "variant")
        }
        PSToWA.push(PSToWAEntry);
      }
      await cds.run(
        INSERT.into(ProductSizesToWritingAppointments).entries(PSToWA)
      )
    })

    this.after("UPDATE", "ArticlesToWritingAppointments", async (result: any, req: Request) => {
      const { article_ID, writingAppointment_ID, deliveryDateVZ, deliveryDateShop } = req.data;
      const {
        Products,
        ProductSizes,
        ProductsToWritingAppointments,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      // Only propagate if dates are actually being updated
      if (!deliveryDateVZ && !deliveryDateShop) return

      const products = await cds.run(
        SELECT.from(Products).where({ article_ID: article_ID })
      );
      if (!products.length) return;

      const productIDs = products.map((p: any) => p.ID)
      await cds.run(
        UPDATE.entity(ProductsToWritingAppointments)
          .set({
            deliveryDateVZ, deliveryDateShop,
            index: await getCurrentIndexForProductInWritingAppointment(writingAppointment_ID)
          })
          .where({
            writingAppointment_ID: writingAppointment_ID,
            product_ID: { in: productIDs }
          })
      );

      // Fetch all productSizes in one query
      const productSizes = await cds.run(
        SELECT.from(ProductSizes)
          .where({
            product_ID: { in: productIDs }
          })
      )
      if (!productSizes.length) return;

      const productSizeIDs = productSizes.map((s: any) => s.ID)
      await cds.run(
        UPDATE.entity(ProductSizesToWritingAppointments)
          .set({
            deliveryDateVZ, deliveryDateShop,
            index: await getCurrentIndexForProductSizesInWritingAppointment(writingAppointment_ID)
          })
          .where({
            writingAppointment_ID: writingAppointment_ID,
            productSize_ID: { in: productSizeIDs }
          })
      );
    })

    this.after("UPDATE", "ProductsToWritingAppointments", async (result: any, req: Request) => {
      const { product_ID, writingAppointment_ID, deliveryDateVZ, deliveryDateShop } = req.data;
      const {
        ProductSizes,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      // Only propagate if dates are actually being updated
      if (!deliveryDateVZ && !deliveryDateShop) return;

      // Fetch all productSizes in one query
      const productSizes = await cds.run(
        SELECT.from(ProductSizes).where({ product_ID: product_ID })
      )
      if (!productSizes.length) return;

      const productSizeIDs = productSizes.map((s: any) => s.ID)
      await cds.run(
        UPDATE.entity(ProductSizesToWritingAppointments)
          .set({
            deliveryDateVZ, deliveryDateShop,
            index: await getCurrentIndexForProductSizesInWritingAppointment(writingAppointment_ID)
          })
          .where({
            writingAppointment_ID: writingAppointment_ID,
            productSize_ID: { in: productSizeIDs }
          })
      );
    })

    this.after("DELETE", "ArticlesToWritingAppointments", async (result: any, req: Request) => {
      const { article_ID, writingAppointment_ID } = req.data;
      const {
        Products,
        ProductSizes,
        ProductsToWritingAppointments,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      const products = await cds.run(
        SELECT.from(Products).where({ article_ID: article_ID })
      );
      if (!products.length) return;

      const productIDs = products.map((p: any) => p.ID)
      await cds.run(
        DELETE.from(ProductsToWritingAppointments)
          .where({
            writingAppointment_ID: writingAppointment_ID,
            product_ID: { in: productIDs }
          })
      );
      // Fetch all productSizes in one query
      const productSizes = await cds.run(
        SELECT.from(ProductSizes)
          .where({
            product_ID: { in: productIDs }
          })
      )
      if (!productSizes.length) return;

      const productSizeIDs = productSizes.map((s: any) => s.ID)
      await cds.run(
        DELETE.from(ProductSizesToWritingAppointments)
          .where({
            writingAppointment_ID: writingAppointment_ID,
            productSize_ID: { in: productSizeIDs }
          })
      );
    });

    this.after("DELETE", "ProductsToWritingAppointments", async (result: any, req: Request) => {
      const { product_ID, writingAppointment_ID } = req.data;
      const {
        ProductSizes,
        ProductSizesToWritingAppointments
      } = cds.entities("com.valantic.preorder.product");

      // Fetch all productSizes in one query
      const productSizes = await cds.run(
        SELECT.from(ProductSizes).where({ product_ID: product_ID })
      )
      if (!productSizes.length) return;
      const productSizeIDs = productSizes.map((s: any) => s.ID)
      await cds.run(
        DELETE.from(ProductSizesToWritingAppointments)
          .where({
            writingAppointment_ID: writingAppointment_ID,
            productSize_ID: { in: productSizeIDs }
          })
      );
    });

    this.on("uploadArticles", async (req: Request) => {
      const { additionalProperties, ...rest } = req.data as UploadProduct;
    });

    this.on("CREATE", "UploadArticles", async (req: Request) => {
      const tx = cds.tx(req);
      const { UPDATE, SELECT } = cds.ql;
      const { additionalProperties, ...rest } = req.data as UploadProduct;
      const { Articles } = cds.entities("com.valantic.preorder.product");

      let articleID: string | undefined;

      try {
        // Find size code
        rest.sizeSystem = await findCodeOfElement("com.valantic.preorder.product", "Sizes", rest.sizeSystem);

        // Article level
        const articleSearchData = {
          consumerTopic_ID: additionalProperties?.consumerTopic_ID,
          brand_ID: additionalProperties?.brand_ID,
          supplier_ID: additionalProperties?.supplier_ID,
          supplierProductNumber: rest.supplierProductNumber
        };
        // Search article in BTP
        let articleObj = await this.getArticle(articleSearchData);

        if (articleObj) {
          articleID = articleObj.ID;
        } else {
          // Article creation
          const articleData = await this.matchProductData(additionalProperties as Product, rest);
          articleObj = {
            ...articleData,
            name: rest.supplierProductName || rest.supplierProductNumber,
            status_ID: 'InProgress'
          };
          articleData.to_Size = [];

          await tx.run(INSERT.into(Articles).entries([articleObj]));
        }
      } catch (error: any) {
        console.error("UploadArticles error:", error.message);
        return req.error(400, `Failure in article creation/update: ${error.message}`);
      }
    });

    this.on("uploadProducts", async (req: Request) => {
      const { additionalProperties, ...rest } = req.data as UploadProduct;
    });

    this.on("CREATE", "UploadProducts", async (req: Request) => {
      const tx = cds.tx(req);
      const { UPDATE, SELECT } = cds.ql;
      const { additionalProperties, ...rest } = req.data as UploadProduct;
      const { Products } = cds.entities("com.valantic.preorder.product");

      // let articleID: string | undefined;
      let productID: string | undefined;

      try {
        // Find size code
        if (!rest.GTIN || rest.GTIN === "") {
          rest.sizeRun = rest.sizeSystem;
        }
        rest.sizeSystem = await findCodeOfElement("com.valantic.preorder.product", "Sizes", rest.sizeSystem);

        // Article level
        const articleSearchData = {
          consumerTopic_ID: additionalProperties?.consumerTopic_ID,
          brand_ID: additionalProperties?.brand_ID,
          supplier_ID: additionalProperties?.supplier_ID,
          supplierProductNumber: rest.supplierProductNumber
        };
        // Search article in BTP
        let articleObj = await this.getArticle(articleSearchData);

        // GPOPT-1777: instead  of evaluation color the supplier color is the key for defining an option
        // const { EvaluationColors } = cds.entities("com.valantic.preorder.common.product");
        // const searchColor = rest?.evaluationColor?.toUpperCase();
        // const colorRow = await cds.run(
        //   SELECT.one
        //     .from(EvaluationColors)
        //     .where`upper(ID) = ${searchColor} or upper(name) = ${searchColor}`
        // );
        // let evaluationColorID = colorRow?.ID;

        if (rest?.supplierColor) {
          // Search option in BTP
          const optionSearchData = {
            ...articleSearchData,
            // evaluationColor_ID: evaluationColorID
            supplierColor: rest.supplierColor
          };

          let optionObj = await this.getOption(optionSearchData as Product);

          if (articleObj) {
            let articleID = articleObj.ID;
            let optionData = await this.matchProductData(additionalProperties as Product, rest);
            if (optionObj) {
              productID = optionObj.ID;
              // If option exist add only empty fields from excel data
              const updatePayload = await this.getDynamicMissingFields(optionObj, optionData);
              if (Object.keys(updatePayload).length > 0) {
                delete updatePayload.to_WritingAppointments;
                await cds.run(UPDATE.entity(Products).where({ ID: productID }).set(updatePayload));
              }
            } else {
              // Option creation
              optionData = propagateRuleFromParent(optionData, articleObj);
              optionData.to_Size = [];

              optionObj = {
                article_ID: articleID,
                // evaluationColor_ID: evaluationColorID,
                supplierColor: rest.supplierColor,
                ...optionData,
                status_ID: (rest.existsIn === "SAP") ? "CreatedInSAP" : "InProgress",
                isUploaded: !!rest.image
              };

              await tx.run(INSERT.into(Products).entries([optionObj]));

              if (rest.image) {
                // Upload image to bucket
                let optionCreated = await this.getOption(optionSearchData as Product);

                if (optionCreated) {
                  let mimeType = (rest.image as string).match(/^data:(.+);base64,/)?.[1] || "image/png";
                  await uploadToStorage(s3, bucket, optionCreated.ID as string, rest.image as string, mimeType);
                }
              }
            }
          }
        } else {
          // console.error("Introduced color has no evaluation ID associated");
          // return req.error(400, `Introduced color has no evaluation ID associated`);
          console.error("Empty supplier color");
          return req.error(400, `Mandatory field 'supplier color' is empty.`);
        }
      } catch (error: any) {
        console.error("UploadProducts error:", error.message);
        return req.error(400, `Failure in option creation/update: ${error.message}`);
      }
    });

    this.on("uploadVariants", async (req: Request) => {
      const { additionalProperties, ...rest } = req.data as UploadProduct;
    });

    this.on("CREATE", "UploadVariants", async (req: Request) => {
      const tx = cds.tx(req);
      const { UPDATE, SELECT } = cds.ql;
      const { additionalProperties, ...rest } = req.data as UploadProduct;
      const { ProductSizes } = cds.entities("com.valantic.preorder.product");

      try {
        // Find size code
        rest.sizeSystem = await findCodeOfElement("com.valantic.preorder.product", "Sizes", rest.sizeSystem);

        // Article level
        const articleSearchData = {
          consumerTopic_ID: additionalProperties?.consumerTopic_ID,
          brand_ID: additionalProperties?.brand_ID,
          supplier_ID: additionalProperties?.supplier_ID,
          supplierProductNumber: rest.supplierProductNumber
        };
        // Search article in BTP
        let articleObj = await this.getArticle(articleSearchData);

        // Option Level

        //GPOPT-1777: instead  of evaluation color the supplier color is the key for defining an option
        // Check evaluationColor_ID
        // const { EvaluationColors } = cds.entities("com.valantic.preorder.common.product");
        // const searchColor = rest?.evaluationColor?.toUpperCase();
        // const colorRow = await cds.run(
        //   SELECT.one
        //     .from(EvaluationColors)
        //     .where`upper(ID) = ${searchColor} or upper(name) = ${searchColor}`
        // );
        // let evaluationColorID = colorRow?.ID;

        if (rest?.supplierColor) {
          // Search option in BTP
          const optionSearchData = {
            ...articleSearchData,
            // evaluationColor_ID: evaluationColorID
            supplierColor: rest.supplierColor
          };

          let optionObj = await this.getOption(optionSearchData as Product);

          if (articleObj && optionObj) {
            let articleID = articleObj.ID;
            let productID = optionObj.ID;

            // Variant level (just if GTIN is filled)
            if (productID && rest.GTIN && rest.sizeSystem) {
              const variantSearchData = {
                ...optionSearchData,
                size_1_CODE: rest.sizeSystem
              };

              const existingVariant = await this.getExistingSizes(variantSearchData);

              if (!existingVariant) {
                let variantPayload = {
                  product_ID: productID,
                  article_ID: articleID,
                  size_1_CODE: rest.sizeSystem,
                  GTIN: rest.GTIN,
                  status_ID: 'InProgress',
                  supplier_ID: additionalProperties?.supplier_ID,
                  supplierProductNumber: rest.supplierProductNumber,
                  // evaluationColor_ID: evaluationColorID
                  supplierColor: rest.supplierColor
                };

                variantPayload = propagateRuleFromParent(variantPayload, optionObj);

                // Variant creation
                await tx.run(INSERT.into(ProductSizes).entries([variantPayload]));
              } else {
                let variantObj = await this.matchProductData(additionalProperties as Product, rest);
                const updatePayload = await this.getDynamicMissingFields(existingVariant, variantObj);
                if (Object.keys(updatePayload).length > 0) {
                  // Variant update
                  delete updatePayload.to_WritingAppointments;
                  await cds.run(UPDATE.entity(ProductSizes).where({ ID: existingVariant.ID }).set(updatePayload));
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error("UploadVariants error:", error.message);
        return req.error(400, `Failure in variant creation/update: ${error.message}`);
      }
    });

    this.on("uploadWritingAppointments", async (req: Request) => {
      const { additionalProperties, ...rest } = req.data as UploadProduct;
    });

    this.on("CREATE", "UploadWritingAppointments", async (req: Request) => {
      const tx = cds.tx(req);
      const { SELECT } = cds.ql;
      const { additionalProperties, ...rest } = req.data as UploadProduct;
      const { ArticlesToWritingAppointments, ProductsToWritingAppointments, ProductSizesToWritingAppointments } = cds.entities("com.valantic.preorder.product");

      try {
        // Find size code
        rest.sizeSystem = await findCodeOfElement("com.valantic.preorder.product", "Sizes", rest.sizeSystem);

        // Article level
        const articleSearchData = {
          consumerTopic_ID: additionalProperties?.consumerTopic_ID,
          brand_ID: additionalProperties?.brand_ID,
          supplier_ID: additionalProperties?.supplier_ID,
          supplierProductNumber: rest.supplierProductNumber
        };

        // Search article in BTP
        let articleObj = await this.getArticle(articleSearchData);
        if (articleObj) {
          let articleID = articleObj.ID;

          // Writing Appointments at article level
          if (additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID) {
            const alreadyExistingWritingAppointment = await cds.run(
              SELECT.one.from(ArticlesToWritingAppointments).where({
                article_ID: articleID,
                writingAppointment_ID: additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID,
              })
            );

            if (!alreadyExistingWritingAppointment) {
              const index = await getCurrentIndexForProductInWritingAppointment(additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID);
              await tx.run(INSERT.into(ArticlesToWritingAppointments).entries([{
                article_ID: articleID,
                writingAppointment_ID: additionalProperties.to_WritingAppointments[0].writingAppointment_ID,
                deliveryDateVZ: rest.deliveryDateVZ ? rest.deliveryDateVZ : undefined,
                index: index + (rest?.rowIndex ?? 0)
              }]));
            }
          }

          // Option Level

          // GPOPT-1777: instead  of evaluation color the supplier color is the key for defining an option
          // Check evaluationColor_ID
          // const { EvaluationColors } = cds.entities("com.valantic.preorder.common.product");
          // const searchColor = rest?.evaluationColor?.toUpperCase();
          // const colorRow = await cds.run(
          //   SELECT.one
          //     .from(EvaluationColors)
          //     .where`upper(ID) = ${searchColor} or upper(name) = ${searchColor}`
          // );
          // let evaluationColorID = colorRow?.ID;

          if (rest?.supplierColor) {
            // Search option in BTP
            const optionSearchData = {
              ...articleSearchData,
              // evaluationColor_ID: evaluationColorID
              supplierColor: rest.supplierColor
            };

            let optionObj = await this.getOption(optionSearchData as Product);
            if (optionObj) {
              let productID = optionObj.ID;

              // Writing Appointments at option level
              if (productID && additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID) {
                const alreadyExistingWritingAppointment = await cds.run(
                  SELECT.one.from(ProductsToWritingAppointments).where({
                    product_ID: productID,
                    writingAppointment_ID: additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID,
                  })
                );

                if (!alreadyExistingWritingAppointment) {
                  const index = await getCurrentIndexForProductInWritingAppointment(additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID);
                  await tx.run(INSERT.into(ProductsToWritingAppointments).entries([{
                    product_ID: productID,
                    writingAppointment_ID: additionalProperties.to_WritingAppointments[0].writingAppointment_ID,
                    deliveryDateVZ: rest.deliveryDateVZ ? rest.deliveryDateVZ : undefined,
                    index: index + (rest?.rowIndex ?? 0)
                  }]));
                }
              }

              // Variant level (just if GTIN is filled)
              if (rest.GTIN && rest.sizeSystem) {
                const variantSearchData = {
                  ...optionSearchData,
                  size_1_CODE: rest.sizeSystem
                };

                const existingVariant = await this.getExistingSizes(variantSearchData);
                
                // Writing Appointments at variant level
                if (existingVariant && additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID) {
                  let variantID = existingVariant.ID;

                  const alreadyExistingWritingAppointment = await cds.run(
                    SELECT.one.from(ProductSizesToWritingAppointments).where({
                      productSize_ID: variantID,
                      writingAppointment_ID: additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID,
                    })
                  );

                  if (!alreadyExistingWritingAppointment) {
                    const index = await getCurrentIndexForProductInWritingAppointment(additionalProperties?.to_WritingAppointments?.[0].writingAppointment_ID);
                    await tx.run(INSERT.into(ProductSizesToWritingAppointments).entries([{
                      productSize_ID: variantID,
                      writingAppointment_ID: additionalProperties.to_WritingAppointments[0].writingAppointment_ID,
                      deliveryDateVZ: rest.deliveryDateVZ ? rest.deliveryDateVZ : undefined,
                      index: index + (rest?.rowIndex ?? 0)
                    }]));
                  }
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error("UploadWritingAppointments error:", error.message);
        return req.error(400, `Failure in writing appointment creation/update: ${error.message}`);
      }
    });

    this.on("getImageUrl", "Products", async ({ params: [ID] }) => {
      if (typeof ID != "string") {
        return;
      }
      return await getSignedS3ImageUrl(s3, bucket, ID);
    });

    this.on(
      "changeImage",
      "Products",
      async ({ params: [ID], data: { imageUrl, imageBase64 } }) => {
        const { SELECT, UPDATE } = cds.ql;
        const { Products, ProductSizes } = cds.entities("com.valantic.preorder.product");

        const idString = typeof ID === "string" ? ID : typeof ID === "object" ? (ID.ID as string) : (ID as unknown as string);
        const product = (await cds.run(
          SELECT.one.from(Products).where({ ID: idString }).columns("isUploaded"),
        )) as Product;

        const productSizeIDs = (await cds.run(
          SELECT.from(ProductSizes).where({ product_ID: idString }).columns("ID")
        )).map((ps: any) => ps.ID)

        if (imageBase64) {
          await uploadToStorage(
            s3,
            bucket,
            idString,
            imageBase64 as string,
            imageBase64.match(/^data:(.+);base64,/)?.[1] || "image/png",
          );
          await cds.run(
            UPDATE.entity(Products)
              .where({ ID: idString })
              .set({ imageUrl: null, isUploaded: true }),
          );
          if (productSizeIDs.length > 0) {
            await cds.run(
              UPDATE.entity(ProductSizes)
                .where({ ID: { in: productSizeIDs } })
                .set({ imageUrl: null, isUploaded: true }),
            );
          }
        } else if (imageUrl) {
          if (product?.isUploaded) {
            await deleteS3Element(s3, bucket, idString);
          }
          await cds.run(
            UPDATE.entity(Products)
              .where({ ID: idString })
              .set({ imageUrl: imageUrl, isUploaded: false }),
          );
          if (productSizeIDs.length > 0) {
            await cds.run(
              UPDATE.entity(ProductSizes)
                .where({ ID: { in: productSizeIDs } })
                .set({ imageUrl: imageUrl, isUploaded: false }),
            );
          }
        }
      },
    );

    // this.after(
    //   "READ",
    //   ["Products", "FlatAppointments"],
    //   async (result: any) => {
    //     for (const product of result) {
    //       /** --- Always compute Criticality FIRST --- **/
    //       const status = product.status_ID ?? product.status?.ID;
    //       let criticality = 0;

    //       switch (status) {
    //         case "CreationFailed":
    //         case "MarkedForDeletion":
    //         case "Failed":
    //           criticality = 1; // Red
    //           break;

    //         case "InProgress":
    //         case "RequestedToSAP":
    //         case "ToCheck":
    //           criticality = 2; // Orange
    //           break;

    //         case "NewSupplierProduct":
    //         case "ReleasedForSupplier":
    //         case "CreatedInSAP":
    //           criticality = 3; // Green
    //           break;

    //         default:
    //           criticality = 0; // Neutral
    //       }

    //       product.Criticality = criticality;

    //       product.Criticality = criticality;

    //       if (product.imageUrl && isValidHttpUrl(product.imageUrl)) {
    //         continue;
    //       }
    //       if (product.isUploaded) {
    //         product.imageUrl = await getSignedS3ImageUrl(
    //           s3,
    //           bucket,
    //           product.ID
    //         );
    //       }
    //     }
    //   }
    // );
    this.after(
      "READ",
      [
        "Articles",
        "Products",
        "ProductSizes",
        "FlatArticles",
        "FlatAppointments",
        "FlatProductSizes",
        "ProductsTable",
        "ProductSizesTable"
      ],
      async (result: any[]) => {
        // PASS 1: compute criticality synchronously
        for (const product of result) {
          const status = product.status_ID ?? product.status?.ID;

          switch (status) {
            case "CreationFailed":
            case "MarkedForDeletion":
            case "Failed":
              product.Criticality = 1;
              break;

            case "InProgress":
            case "RequestedToSAP":
            case "ToCheck":
            case "PartiallyCreatedInSAP":
              product.Criticality = 2;
              break;

            case "NewSupplierProduct":
            case "ReleasedForSupplier":
            case "CreatedInSAP":
              product.Criticality = 3;
              break;

            default:
              product.Criticality = 0;
          }
        }

        // PASS 2: async image handling (NO criticality change here)
        await Promise.all(
          result.map(async (product) => {
            if (product.imageUrl && isValidHttpUrl(product.imageUrl)) {
              return;
            }

            if (product.isUploaded && product.GTIN && product.GTIN !== "") {
              //Get images for variant level
              const optionSearchData = {
                consumerTopic_ID: product.consumerTopic_ID,
                brand_ID: product.brand_ID,
                supplier_ID: product.supplier_ID,
                supplierProductNumber: product.supplierProductNumber,
                // evaluationColor_ID: product.evaluationColor_ID
                supplierColor: product.supplierColor
              };
              let optionParent = await this.getOption(optionSearchData as Product);

              if (optionParent) {
                product.imageUrl = await getSignedS3ImageUrl(
                  s3,
                  bucket,
                  optionParent.ID as string,
                );
              }
            } else if (product.isUploaded) {
              //Get images for option level
              product.imageUrl = await getSignedS3ImageUrl(
                s3,
                bucket,
                product.ID,
              );
            }
          }),
        );
      },
    );
    this.on("createSAPProduct", async (req: Request) => {
      const { Articles, Products, ProductSizes } = cds.entities("com.valantic.preorder.product");
      const { product_ID, level } = req.data;
      let validationError: any;
      const validator: any = {
        "1": validateArticle,
        "2": validateProduct,
        "3": validateProductSizes
      }
      const validationFn = validator[level];
      if (validationFn) {
        validationError = await validationFn(product_ID)
      }
      if (validationError) {
        req.reject(409, validationError.code, undefined, validationError.args);
      }
      const { successful, error } = await createProductToSAP(product_ID, level);
      if (!successful) {
        const setParameters = {
          status_ID: "CreationFailed",
          sapHttpStatus: error?.status,
          sapHttpStatusText: getSapMessageFromStatusText(
            error?.statusText,
          ),
          sapStatus: error?.sapStatus,
          sapStatusText: getSapMessages(error?.sapStatusText),
          sapTransactionId: error?.sapTransactionId,
        }
        updateByLevel(product_ID, level, setParameters)
        // setImmediate(async () => {
        //   try {
        //     const db = await cds.connect.to("db");
        //     const tx = db.tx();
        //     await tx.run(
        //       UPDATE.entity(Products)
        //         .where({ ID: product_ID })
        //         .set({
        //           status_ID: "CreationFailed",
        //           sapHttpStatus: error?.status,
        //           sapHttpStatusText: this.getSapMessageFromStatusText(
        //             error?.statusText,
        //           ),
        //           sapStatus: error?.sapStatus,
        //           sapStatusText: this.getSapMessages(error?.sapStatusText),
        //           sapTransactionId: error?.sapTransactionId,
        //         }),
        //     );
        //     await tx.commit();
        //     console.log("Status updated to CreationFailed");
        //   } catch (e) {
        //     console.error("Failed to update status:", e);
        //   }
        // });
        return req.reject(502, "SAP_PRODUCT_CREATION_FAILED");
      } else {
        const setParameters = {
          status_ID: "CreatedInSAP",
          sapHttpStatus: null,
          sapHttpStatusText: null,
          sapStatus: null,
          sapStatusText: null,
          sapTransactionId: null,
        }
        switch (level) {
          case "1":
            updateByLevel(product_ID, level, setParameters);
            break;
          case "2":
            adjustProductParentStatus(
              product_ID,
              Products,
              "article_ID",
              Articles,
              () => updateByLevel(product_ID, level, setParameters)
            );
            break;
          case "3":
            adjustVariantParentStatus(
              product_ID,
              ProductSizes,
              "product_ID",
              Products,
              level,
              setParameters);
            break;
        }
        //   await cds.run(
        //     UPDATE.entity(Products)
        //       .where({
        //         ID: product_ID,
        //       })
        //       .set({
        //         status_ID: "CreatedInSAP",
        //         sapHttpStatus: null,
        //         sapHttpStatusText: null,
        //         sapStatus: null,
        //         sapStatusText: null,
        //         sapTransactionId: null,
        //       }),
        //   );
      }
    });

    this.on("checkExistingGTINInTool", async (req: Request) => {
      const { GTIN } = req.data as { GTIN: string };

      return checkIfGTINExistsInTool(GTIN);
    });

    this.on("checkHigherLevelStatus", async (req: Request) => {
      const { variant_ID } = req.data;
      return await this.checkHigherLevelStatus(variant_ID);
    })

    this.after(
      ["CREATE", "UPDATE"],
      "ProductsToWritingAppointments",
      async (result: any, req: Request) => {
        const { SELECT, UPDATE } = cds.ql;
        const { Products, ProductsToWritingAppointments } = cds.entities(
          "com.valantic.preorder.product",
        );

        const productId = result.product_ID;

        // Check if product already has availableFrom set
        const product = (await cds.run(
          SELECT.one
            .from(Products)
            .where({ ID: productId })
            .columns("availableFrom"),
        )) as Product;

        // Only derive if availableFrom is not set in the product
        if (!product?.availableFrom) {
          // Get all writing appointments for this product
          const appointments = (await cds.run(
            SELECT.from(ProductsToWritingAppointments)
              .where({ product_ID: productId })
              .columns("deliveryDateVZ"),
          )) as any[];
          console.log(appointments);

          // Find the smallest deliveryDateVZ
          const validDates = appointments
            .map((a) => a.deliveryDateVZ)
            .filter((date) => date != null);

          if (validDates.length > 0) {
            const smallestDate = validDates.reduce((min, current) =>
              current < min ? current : min,
            );

            // Update the product's availableFrom
            await cds.run(
              UPDATE.entity(Products)
                .where({ ID: productId })
                .set({ availableFrom: smallestDate }),
            );
          }
        }
      },
    );

    this.after("READ", "OwnershipStatus", (result: any, req: Request) => {
      if (Array.isArray(result)) {
        result.forEach((record) => {
          if (record && (record.ID == "" || record.ID == null)) {
            record.ID = "0";
          }
        });
      }
    });

    this.on("markForDeletion", "Articles", async (req: Request) => {
      const { Articles, Products, ProductSizes } = cds.entities(
        "com.valantic.preorder.product",
      );
      setImmediate(async () => {
        const db = await cds.connect.to("db");
        const tx = db.tx();
        const ID = req.params[0].ID;
        try {
          let optionIds, variantIds;
          // Update Article status
          await tx.run(
            UPDATE.entity(Articles)
              .where({ ID: ID })
              .set({ status_ID: "MarkedForDeletion" }),
          );

          // Fetch all Options under this Article
          const options = await tx.run(
            SELECT.from(Products)
              .where({
                article_ID: ID,
                status_ID: { "!=": "MarkedForDeletion" },
              })
              .columns("ID"),
          );
          if (options && options.length > 0) {
            optionIds = options.map((o: any) => o.ID);
            await tx.run(
              UPDATE.entity(Products)
                .where({ ID: { in: optionIds } })
                .set({ status_ID: "MarkedForDeletion" }),
            );
          }

          // Fetch all variants
          if (optionIds) {
            const variants = await tx.run(
              SELECT.from(ProductSizes)
                .where({
                  product_ID: { in: optionIds },
                  status_ID: { "!=": "MarkedForDeletion" },
                })
                .columns("ID"),
            );
            if (variants && variants.length > 0) {
              variantIds = variants.map((o: any) => o.ID);
              await tx.run(
                UPDATE.entity(ProductSizes)
                  .where({ ID: { in: variantIds } })
                  .set({ status_ID: "MarkedForDeletion" }),
              );
            }
          }
          await tx.commit();
          console.log("Mark for deletion is successfull");
        } catch (error) {
          await tx.rollback();
        }
      })
    });

    this.on("markForDeletion", "Products", async (req: Request) => {
      const { Products, ProductSizes } = cds.entities(
        "com.valantic.preorder.product",
      );
      setImmediate(async () => {
        const db = await cds.connect.to("db");
        const tx = db.tx();
        const ID = req.params[0].ID;
        try {
          let variantIds;
          await tx.run(
            UPDATE.entity(Products)
              .where({ ID: ID })
              .set({ status_ID: "MarkedForDeletion" }),
          );
          const variants = await tx.run(
            SELECT.from(ProductSizes)
              .where({
                product_ID: ID,
                status_ID: { "!=": "MarkedForDeletion" },
              })
              .columns("ID"),
          );
          if (variants && variants.length > 0) {
            variantIds = variants.map((o: any) => o.ID);
            await tx.run(
              UPDATE.entity(ProductSizes)
                .where({ ID: { in: variantIds } })
                .set({ status_ID: "MarkedForDeletion" }),
            );
          }
          await tx.commit();
          console.log("Mark for deletion is successfull");
        } catch (error) {
          await tx.rollback();
        }
      })
    });

    this.on("markForDeletion", "ProductSizes", async (req: Request) => {
      const { ProductSizes } = cds.entities("com.valantic.preorder.product");
      setImmediate(async () => {
        const db = await cds.connect.to("db");
        const tx = db.tx();
        const ID = req.params[0].ID;
        try {
          await tx.run(
            UPDATE.entity(ProductSizes)
              .where({ ID: ID })
              .set({ status_ID: "MarkedForDeletion" }),
          );
          await tx.commit();
          console.log("Mark for deletion is successfull");
        } catch (error) {
          await tx.rollback();
        }
      })
    });

    this.on("checkChildExistence", async (req: Request) => {
      const validationError = await validateAllChild(req.data.ID, req.data.level);
      if (validationError) {
        req.reject(400, validationError.code, undefined, validationError.args);
      }
    })

    this.on("copyProducts", async (req: Request) => {
      const { INSERT } = cds.ql;
      const { Articles, Products } = cds.entities("com.valantic.preorder.product");
      const products = JSON.parse(req.data.products);
      const article: Article = {};
      let first: boolean = true;
      let existingArticle;
      let filteredSizes = [];
      const randomID = randomUUID();
      for (const product of products) {
        const existingProduct = await this.getOption(product as Product);
        if (existingProduct) {
          // req.reject(409, "PRODUCT_ALREADY_EXIST", undefined, [existingProduct.evaluationColor_ID]);
          req.reject(409, "PRODUCT_ALREADY_EXIST", undefined, [existingProduct.supplier]);
        }
        existingArticle = await this.getArticle(product as Product);
        article.ID = product.article_ID = (existingArticle) ? existingArticle.ID : randomID;
        if (first && !existingArticle) {
          mapProperties(article, product);
          first = false;
        }
        filteredSizes = [];
        for (const size of product.to_Size) {
          const details = {
            ...product,
            size_1_CODE: size.size_1_CODE
          }
          const productsizes = await this.getExistingSizes(details as ProductSizes);
          if (productsizes) continue;
          size.ID = randomUUID()
          size.product_ID = product.ID;
          size.article_ID = product.article_ID;
          mapProperties(size, product);
          filteredSizes.push(size);
        }
        product.to_Size = filteredSizes;
      }

      try {
        if (!existingArticle) {
          await cds.run(
            INSERT.into(Articles).entries({ ...article })
          );
        }
        await cds.run(
          INSERT.into(Products).entries(products)
        );
        return true;
      } catch (error) {
        return false;
      }
    })

    return super.init();
  }

  getDynamicMissingFields = async (existing: any, uploaded: any) => {
    const updatePayload: any = {};

    Object.keys(uploaded).forEach(field => {
      const newValue = uploaded[field];
      const fieldExistsInDb = field in existing;
      const currentValue = existing[field];

      const isCurrentEmpty = !fieldExistsInDb || currentValue === null || currentValue === undefined || currentValue === "";
      const hasNewValue = newValue !== null && newValue !== undefined && newValue !== "";

      if (isCurrentEmpty && hasNewValue) {
        updatePayload[field] = newValue;
      }
    });

    delete updatePayload.ID;
    delete updatePayload.createdAt;
    delete updatePayload.createdBy;
    delete updatePayload.modifiedAt;
    delete updatePayload.modifiedBy;

    return updatePayload;
  };

  getAvailableConsumerTopicBrand = async (data: Product) => {
    const { SELECT } = cds.ql;
    if (!data?.consumerTopic_ID || !data?.brand_ID || !data?.supplier_ID) {
      return undefined;
    }

    const consumertopicbrand: ConsumerTopicBrand = await cds.run(
      SELECT.one
        .from(ConsumerTopicBrand)
        .where({
          consumerTopic_ID: data.consumerTopic_ID,
          brand_ID: data.brand_ID,
          supplier_ID: data.supplier_ID,
          isArchived: false,
        })
        .columns((ctb) => {
          ctb("*"); // Select all scalar properties of ConsumerTopicBrands
          ctb.to_WG_SBS((wgsbs) => {
            wgsbs("*"); // Select all properties of the composed entities
          });
          ctb.to_Programs((programs) => {
            programs("*"); // Select all properties of the composed entities
          });
        }),
    );

    return consumertopicbrand;
  };

  getAvailableSupplierProduct = async (
    supplier_ID: string | undefined,
    supplierProductNumber: string | undefined,
    supplierColor: string | undefined,
    size: string | undefined,
  ) => {
    const { SELECT } = cds.ql;
    if (!supplier_ID || !supplierProductNumber) {
      return undefined;
    }

    const filterProperties: any = {
      supplier_ID: supplier_ID,
      supplierProductNumber: supplierProductNumber,
    };
    if (supplierColor) filterProperties.supplierColor = supplierColor;
    const product: Product = await cds.run(
      SELECT.one
        .from(Products)
        .where(filterProperties)
        .columns((p) => {
          p("*");
          p.to_Size((s) => {
            s("*");
          });
        }),
    );
    if (size && product) {
      //TODO fix
      product.to_Size =
        product.to_Size?.filter((el) => el.size_1_CODE === size) ?? [];
    }

    return product;
  };

  getExistingSupplierProductNumber = async (
    consumerTopic_ID: string | undefined,
    brand_ID: string | undefined,
    supplier_ID: string | undefined,
    supplierProductNumber: string | undefined,
  ) => {
    const { SELECT } = cds.ql;
    if (
      !consumerTopic_ID ||
      !brand_ID ||
      !supplier_ID ||
      !supplierProductNumber
    ) {
      return undefined;
    }
    const filterProperties: any = {
      consumerTopic_ID: consumerTopic_ID,
      brand_ID: brand_ID,
      supplier_ID: supplier_ID,
      supplierProductNumber: supplierProductNumber,
    };
    const article: Article = await cds.run(
      SELECT.one.from(Articles).where(filterProperties).columns("*"),
    );
    return article;
  };

  matchProductData = async (
    additionalProperties: Product,
    rest: UploadProduct,
  ) => {
    const availableFrom =
      additionalProperties.availableFrom ??
      rest.availableFrom ??
      rest.deliveryDateVZ;
    (additionalProperties?.to_Size?.length ?? 0) === 0
      ? delete additionalProperties.to_Size
      : undefined;
    /*additionalProperties?.to_Purchase &&
    additionalProperties.to_Purchase.length === 0
      ? delete additionalProperties.to_Purchase
      : undefined;
    (additionalProperties?.to_Sales ?? []).length === 0
      ? delete additionalProperties.to_Sales
      : undefined;*/
    (additionalProperties?.to_WritingAppointments?.length ?? 0) === 0
      ? delete additionalProperties.to_WritingAppointments
      : undefined;

    /* GPOPT-1175: Remove valid range in purchase and sales data
    const to_Purchase = {
      currency_ID:
        additionalProperties?.to_Purchase?.[0]?.currency_ID ??
        additionalProperties?.currency_ID ??
        (await findIDOfElement(
          "com.valantic.preorder.common.helper.logistic",
          "Currencies",
          rest.currency
        )),
      productDiscount1: rest.productDiscount1,
      purchasePriceEURNetto: rest.purchasePriceNet,
      purchasePrice: rest.purchasePrice,
      validFrom: availableFrom,
      validTo: rest.availableUntil,
    };
    const to_Sales = {
      uvpPrice: additionalProperties?.to_Sales?.[0]?.uvpPrice ?? rest.uvpPrice,
      validFrom: availableFrom,
      validTo: rest.availableUntil,
    };
    */

    const searchValueProductGroup = rest.productGroup ? String(rest.productGroup).trim().toUpperCase() : "";
    let productGroup: string | null = null;
    if (searchValueProductGroup && searchValueProductGroup !== "") {
      const productGroupSearch: ProductGroup = await cds.run(
        SELECT.one.from(ProductGroups).where`upper(ID) = ${searchValueProductGroup} or upper(NAME) = ${searchValueProductGroup}`.columns("ID")
      );
      productGroup = productGroupSearch?.ID ?? null;
    }

    const productData: Product = {
      imageUrl: rest.imageUrl,
      supplierProductNumber: rest.supplierProductNumber,
      supplierProductName: rest.supplierProductName,
      supplierColor: rest.supplierColor,
      evaluationColor_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "EvaluationColors",
        rest.evaluationColor,
      ),
      sizeSystem_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "SizeSystems",
        rest.sizeSystem,
      ),
      sizeRun: rest.sizeRun,
      productGroup_ID: productGroup,
      receiptText:
        rest.receiptText ??
        additionalProperties.receiptText ??
        additionalProperties.productText ??
        rest.productText,
      ownershipStatus_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.logistic",
        "OwnershipStatus",
        rest.ownershipStatus,
      ),
      currency_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.logistic",
        "Currencies",
        rest.currency,
      ),
      purchasePrice: rest.purchasePrice,
      purchasePriceEURNetto: rest.purchasePriceNet,
      productDiscount1: rest.productDiscount1,
      uvpPrice: rest.uvpPrice,
      retailPrice: rest.retailPrice,
      transportChain_TC_ID: await findTCIDOfElement(
        "",
        "WRF_PSCD_TCHAINH",
        rest.transportChain,
      ),
      productionPlant_PRODUCTIONPLANT: await findPRODUCTIONPLANTOfElement(
        "",
        "PRODUCTION_PLANT",
        rest.productionPlant,
      ),
      availableFrom: availableFrom,
      availableUntil: rest.availableUntil,
      endOfLifeCycle: rest.endOfLifeCycle,
      houseGroup_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.logistic",
        "HouseGroups",
        rest.houseGroup,
      ),
      supplyType_SUPPLY_TYPE: await findSUPPLYTYPEOfElement(
        "",
        "ZSTTA_SUP_TYPE",
        rest.supplyType,
      ),
      seasonType_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.classification",
        "SeasonTypes",
        rest.seasonType,
      ),
      seasonYear: rest.seasonYear,
      presentationType_CODE: await findCodeOfElement(
        "",
        "WRF_CHARVAL",
        rest.presentationType,
      ),
      // GTIN: rest.GTIN ?? null,
      onlineSalesFrom: rest.isOnline ? availableFrom : null,
      material1_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "Materials",
        rest.material1,
      ),
      portion1: rest.portion1,
      material2_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "Materials",
        rest.material2,
      ),
      portion2: rest.portion2,
      material3_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "Materials",
        rest.material3,
      ),
      portion3: rest.portion3,
      material4_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "Materials",
        rest.material4,
      ),
      portion4: rest.portion4,
      material5_ID: await findIDOfElement(
        "com.valantic.preorder.common.product",
        "Materials",
        rest.material5,
      ),
      portion5: rest.portion5,
      sustainabilitySealOfApproval_GSNR: await findGSNROfElement(
        "",
        "ZSTTA_NH_GS_T",
        rest.sustainabilitySealOfApproval,
      ),
      sustainabilityCertifier: rest.sustainabilityCertifier,
      sustainabilityCertificateNumber: rest.sustainabilityCertificateNumber,
      sustainabilityMaterial: rest.sustainabilityMaterial,
      sustainabilityPortion: rest.sustainabilityPortion,
      washing_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.method",
        "WashingMethods",
        rest.washing,
      ),
      bleaching_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.method",
        "BleachingMethods",
        rest.bleaching,
      ),
      drying_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.method",
        "DryingMethods",
        rest.drying,
      ),
      ironing_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.method",
        "IroningMethods",
        rest.ironing,
      ),
      cleaning_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.method",
        "CleaningMethods",
        rest.cleaning,
      ),
      washingInstructions: rest.washingInstructions,
      comment: rest.comment,
      comment2: rest.comment2,
      productText: rest.productText,
      /* GPOPT-1175: Remove valid range in purchase and sales data
      to_Purchase: [to_Purchase],
      to_Sales: [to_Sales],
      */
      //TODO
      to_Size: rest.sizeSystem
        ? [
          {
            size_1_CODE: rest.sizeSystem,
            // size_2_CODE: rest.sizeSystem,
            GTIN: rest.GTIN,
          },
        ]
        : [],
      shippingPort_ID: await findIDOfElement(
        "com.valantic.preorder.common.helper.logistic",
        "ShippingPorts",
        rest.shippingPort,
      ),
      storageLocation_LGORT: await findLGORTOfElement(
        "",
        "T001L",
        rest.storageLocation,
      ),
      countryOfProduction: rest.countryOfProduction,
      ...additionalProperties,
    };
    return productData;
  };

  getConsumerTopicBrand = async (data: any) => {
    const { SELECT } = cds.ql;
    if (!data?.consumerTopic_ID || !data?.brand_ID || !data?.supplier_ID) {
      return undefined;
    }

    const consumertopicbrand: ConsumerTopicBrand = await cds.run(
      SELECT.one
        .from(ConsumerTopicBrand)
        .where({
          consumerTopic_ID: data.consumerTopic_ID,
          brand_ID: data.brand_ID,
          supplier_ID: data.supplier_ID,
          isArchived: false,
        })
        .columns((ctb) => {
          ctb("*"); // Select all scalar properties of ConsumerTopicBrands
          ctb.to_WG_SBS((wgsbs) => {
            wgsbs("*"); // Select all properties of the composed entities
          });
          ctb.to_Programs((programs) => {
            programs("*"); // Select all properties of the composed entities
          });
        }),
    );

    return consumertopicbrand;
  };

  getArticle = async (data: any) => {
    const { SELECT } = cds.ql;
    if (
      !data.consumerTopic_ID ||
      !data.brand_ID ||
      !data.supplier_ID ||
      !data.supplierProductNumber
    ) {
      return undefined;
    }

    const article: Article = await cds.run(
      SELECT.one
        .from(Article)
        .where({
          consumerTopic_ID: data.consumerTopic_ID,
          brand_ID: data.brand_ID,
          supplier_ID: data.supplier_ID,
          supplierProductNumber: data.supplierProductNumber,
          isArchived: false,
        })
        .columns((article) => {
          article("*");
          article.to_Option((options) => {
            options("*");
          });
        }),
    );

    return article;
  };

  getOption = async (data: any) => {
    const { SELECT } = cds.ql;
    if (
      !data.consumerTopic_ID ||
      !data.brand_ID ||
      !data.supplier_ID ||
      !data.supplierProductNumber ||
      // !data.evaluationColor_ID
      !data.supplierColor
    ) {
      return undefined;
    }

    const option: Product = await cds.run(
      SELECT.one
        .from(Product)
        .where({
          consumerTopic_ID: data.consumerTopic_ID,
          brand_ID: data.brand_ID,
          supplier_ID: data.supplier_ID,
          supplierProductNumber: data.supplierProductNumber,
          // evaluationColor_ID: data.evaluationColor_ID,
          supplierColor: data.supplierColor,
          isArchived: false,
        })
        .columns((option) => {
          option("*");
          option.to_WritingAppointments((wa) => {
            wa("*");
          });
          option.to_Size((sizes) => {
            sizes("*");
          });
        }),
    );

    return option;
  };

  getExistingSizes = async (data: any) => {
    const { ProductSizes } = cds.entities("com.valantic.preorder.product");
    const { SELECT } = cds.ql;
    if (
      !data.consumerTopic_ID ||
      !data.brand_ID ||
      !data.supplier_ID ||
      !data.supplierProductNumber ||
      // !data.evaluationColor_ID ||
      !data.supplierColor ||
      !data.size_1_CODE
    ) {
      return undefined;
    }
    const productSizes: ProductSiz = await cds.run(
      SELECT.one
        .from(ProductSizes)
        .where({
          consumerTopic_ID: data.consumerTopic_ID,
          brand_ID: data.brand_ID,
          supplier_ID: data.supplier_ID,
          supplierProductNumber: data.supplierProductNumber,
          // evaluationColor_ID: data.evaluationColor_ID,
          supplierColor: data.supplierColor,
          size_1_CODE: data.size_1_CODE,
        })
        .columns("*"),
    );
    return productSizes;
  };

  getParentStatus = async (
    entityName: entity,
    ID: string,
  ): Promise<string> => {
    const { SELECT } = cds.ql;
    const result = await cds.run(
      SELECT.one.from(entityName)
        .where({ ID: ID })
        .columns("status_ID")
    )
    return result?.status_ID;
  }

  checkHigherLevelStatus = async (ID: string) => {
    const { SELECT } = cds.ql;
    const { Products, ProductSizes } = cds.entities("com.valantic.preorder.product");
    const productSize = await cds.run(
      SELECT.one.from(ProductSizes)
        .where({ ID: ID })
        .columns("product_ID")
    );
    const productStatus = await this.getParentStatus(Products, productSize?.product_ID);
    const siblingStatus = await cds.run(
      SELECT.from(ProductSizes)
        .where({ product_ID: productSize?.product_ID })
        .columns("ID", "status_ID")
    );
    const filtered = siblingStatus?.filter((item: any) => item.ID !== ID);
    const res = filtered?.length > 0 &&
      filtered.every((item: any) => item.status_ID === "CreatedInSAP");

    if (productStatus === "PartiallyCreatedInSAP" && res) {
      return true
    } else {
      return false
    }
  }

  getSupplierTC = async (supplier_ID: string) => {
    const { SELECT } = cds.ql;
    if (!supplier_ID) {
      return {};
    }
    const supplierData = await cds.run(
      SELECT.one
        .from(Suppliers)
        .where({ ID: supplier_ID })
        .columns("COUNTRY", "TRANSPORT_CHAIN")
    );
    return {
      countryOfProduction: supplierData?.COUNTRY,
      transportChain_TC_ID: supplierData?.TRANSPORT_CHAIN,
    };
  }

}
module.exports = ProductMasterDataService;