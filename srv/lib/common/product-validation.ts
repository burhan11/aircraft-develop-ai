import cds from "@sap/cds";
import { getArticleDetails, getProductSizesDetails, getOptionDetails } from "./sap-existance-check";

interface IValidationError {
  code: string;
  args: any[];
}

const isEmpty = (value: any, field?: string) => 
  value === null ||
  value === undefined ||
  (field !== "ownershipStatus_ID" && typeof value === "string" && value.trim() === "");

const findMissingFields = (
  entity: Record<string, any>,
  mandatoryFields: string[],
  errorPrefix: string,
  identifier: any
): IValidationError | undefined => {
  const missing = mandatoryFields.find((field) => isEmpty(entity[field], field));
  if (!missing) return undefined
  return {
    code: `${errorPrefix}_MISSING_FIELD_${missing}`,
    args: [identifier]
  }
}

const mandatoryArticleFields = [
  "consumerTopic_ID",
  "supplier_ID",
  "brand_ID",
  "module_CODE",
  "assortmentModule_ID",
  "productGroup_ID",
  "targetGroup_ID",
  "houseGroup_ID",
  "supplierProductNumber",
  "productText",
  "sizeSystem_ID",
  "supplyType_SUPPLY_TYPE",
  "seasonType_ID",
  "seasonYear",
  "presentationType_CODE",
  "availableFrom",
  "availableUntil",
  "endOfLifeCycle",
  "productType_ID",
  "ownershipStatus_ID",
  "gridBox_ID",
  "omnichannel_CODE",
  "shippingInstruction_ID",
  "loadingGroup_ID",
  "baseUnitOfMeasure_ID",
  // "purchasePriceEURNetto",
  // "purchasePrice",
  // "purchasePriceUSD",
  "currency_ID",
  "vat_ID",
  "retailPrice"
]

const mandatoryProductFields = [
  //product master data file
  "consumerTopic_ID",
  "supplier_ID",
  "brand_ID",
  "module_CODE",
  "assortmentModule_ID",
  "houseGroup_ID",
  "supplierProductNumber",
  "productText",
  "supplierColor",
  "evaluationColor_ID",
  "supplyType_SUPPLY_TYPE",
  "seasonType_ID",
  "seasonYear",
  "productType_ID",
  "ownershipStatus_ID",
  "shippingInstruction_ID",

  "omnichannel_CODE",

  //later needed
  // "topicComponent_ID",
  "sizeSystem_ID",
  "presentationType_CODE",
  //UI
  "availableFrom",
  "availableUntil",
  "endOfLifeCycle",
  "gridBox_ID",
  "targetGroup_ID",

  //SAP mandatory
  "productGroup_ID",
  "baseUnitOfMeasure_ID",
  //Sales Fields
  "retailPrice"
];
// const mandatoryProductToSalesFields = ["retailPrice"];
// const mandatoryProductToPurchaseFields = [
//   "purchasePriceEURNetto",
//   "purchasePrice",
//   "purchasePriceUSD",
//   "currency_ID",
//   "vat_ID",
// ];
const mandatoryCurrencyDollarFields = [
  "purchasePrice",
  "purchaseFactor",
  "purchasePriceUSD",
  "purchasePriceEURNetto",
]
const mandatoryCurrencyEuroFields = [
  "purchasePrice",
  "purchasePriceEURNetto",
]
const mandatoryProductToSizeFields = [
  // "size_1_CODE", 
  // "GTIN"
  "consumerTopic_ID",
  "supplier_ID",
  "brand_ID",
  "module_CODE",
  "targetGroup_ID",
  "houseGroup_ID",
  "size_1_CODE",
  "GTIN",
  "supplyType_SUPPLY_TYPE",
  "presentationType_CODE",
  "availableFrom",
  "availableUntil",
  "endOfLifeCycle",
  // "purchasePrice",
  // "purchasePriceUSD",
  // "purchasePriceEURNetto",
  "retailPrice",
  "ownershipStatus_ID",
  "omnichannel_CODE",
];

const fincCurrencyMissingFields = (
  entity: Record<string,any>,
  errorPrefix: string,
  Identfier: any
): IValidationError | undefined => {
  let missingField: any;
  switch (entity.currency_ID) {
    case "USD":
      missingField = findMissingFields(entity, mandatoryCurrencyDollarFields, errorPrefix, Identfier);
      break;
    case "EUR":
      missingField = findMissingFields(entity, mandatoryCurrencyEuroFields, errorPrefix, Identfier);
      break;
  }
  return missingField;
}

async function checkMandatoryProperties(
  product_ID: string
): Promise<IValidationError | undefined> {
  const { SELECT } = cds.ql;
  const { Products } = cds.entities("com.valantic.preorder.product");
  // const product = await cds.run(
  //   SELECT.one
  //     .from(Products)
  //     .where({ ID: product_ID })
  //     .columns((p) => {
  //       p("*"); // Select all scalar properties of Products
  //       /* GPOPT-1175: Remove valid range in purchase and sales data
  //       p.to_Sales((sales: any) => {
  //         sales("*"); // Select all properties of the composed entities
  //       });
  //       p.to_Purchase((purchase: any) => {
  //         purchase("*"); // Select all properties of the composed entities
  //       });
  //       */
  //       p.to_Size((sizes: any) => {
  //         sizes("*"); // Select all properties of the composed entities
  //       });
  //     })
  // );
  const product = await getOptionDetails(product_ID);

  const optionIdentifier: string | undefined =
        product.evaluationColor_ID ?? product.ID;

  const productError = findMissingFields(
    product,
    mandatoryProductFields,
    'PRODUCT',
    optionIdentifier
  );
  if (productError) return productError;

  const currencyError = fincCurrencyMissingFields(product, 'PRODUCT', optionIdentifier);
  if (currencyError) return currencyError;

  for (const proudctSizes of product.to_Size || []) {
    // Shared identifier for Variant level errors
    const variantIdentifier: string | undefined =
        proudctSizes.size_1_CODE ?? proudctSizes.ID;

    const sizesError = findMissingFields(
      proudctSizes,
      mandatoryProductToSizeFields,
      'VARIANT',
      variantIdentifier
    );
    if (sizesError) return sizesError;

    const currencyError = fincCurrencyMissingFields(proudctSizes, 'VARIANT', variantIdentifier);
    if (currencyError) return currencyError;
  }

  return;

  // for (const field of mandatoryProductFields) {
  //   if (
  //     product[field] === null ||
  //     product[field] === undefined ||
  //     (typeof product[field] === "string" && product[field].trim() === "")
  //   ) {
  //     return {
  //       code: `PRODUCT_MISSING_FIELD_${field}`,
  //       args: [product.supplierProductNumber ?? product.ID],
  //     };
  //   }
  // }
  /* GPOPT-1175: Remove valid range in purchase and sales data
  const latestPurchase = product.to_Purchase?.sort((a: any, b: any) => {
    const dateA = a.validFrom ? new Date(a.validFrom).getTime() : 0;
    const dateB = b.validFrom ? new Date(b.validFrom).getTime() : 0;
    return dateB - dateA;
  })?.[0];

  // Get the latest sales data based on validFrom date
  const latestSales = product.to_Sales?.sort((a: any, b: any) => {
    const dateA = a.validFrom ? new Date(a.validFrom).getTime() : 0;
    const dateB = b.validFrom ? new Date(b.validFrom).getTime() : 0;
    return dateB - dateA;
  })?.[0];

  if (!latestPurchase) {
    return {
      code: `PRODUCT_MISSING_FIELD_to_Purchase`,
      args: [product.supplierProductNumber ?? product.ID],
    };
  } else {
    for (const field of mandatoryProductToPurchaseFields) {
      if (
        latestPurchase[field] === null ||
        latestPurchase[field] === undefined ||
        (typeof latestPurchase[field] === "string" &&
          latestPurchase[field].trim() === "")
      ) {
        console.log(
          "Missing field in purchase:",
          field,
          latestPurchase[field],
          latestPurchase
        );
        return {
          code: `PRODUCT_MISSING_FIELD_to_Purchase_${field}`,
          args: [product.supplierProductNumber ?? product.ID],
        };
      }
    }
  }
    */

  // for (const field of mandatoryProductToPurchaseFields) {
  //   if (
  //     product[field] === null ||
  //     product[field] === undefined ||
  //     (typeof product[field] === "string" && product[field].trim() === "")
  //   ) {
  //     console.log("Missing field in purchase:", field, product[field], product);
  //     return {
  //       code: `PRODUCT_MISSING_FIELD_to_Purchase_${field}`,
  //       args: [product.supplierProductNumber ?? product.ID],
  //     };
  //   }
  // }
  /* GPOPT-1175: Remove valid range in purchase and sales data
  if (!latestSales) {
    return {
      code: `PRODUCT_MISSING_FIELD_to_Sales`,
      args: [product.supplierProductNumber ?? product.ID],
    };
  } else {
    for (const field of mandatoryProductToSalesFields) {
      if (
        latestSales[field] === null ||
        latestSales[field] === undefined ||
        (typeof latestSales[field] === "string" &&
          latestSales[field].trim() === "")
      ) {
        return {
          code: `PRODUCT_MISSING_FIELD_to_Sales_${field}`,
          args: [product.supplierProductNumber ?? product.ID],
        };
      }
    }
  }
    */
  // for (const field of mandatoryProductToSalesFields) {
  //   if (
  //     product[field] === null ||
  //     product[field] === undefined ||
  //     (typeof product[field] === "string" && product[field].trim() === "")
  //   ) {
  //     return {
  //       code: `PRODUCT_MISSING_FIELD_to_Sales_${field}`,
  //       args: [product.supplierProductNumber ?? product.ID],
  //     };
  //   }
  // }

  // for (const sizeEntry of product.to_Size || []) {
  //   for (const field of mandatoryProductToSizeFields) {
  //     if (
  //       sizeEntry[field] === null ||
  //       sizeEntry[field] === undefined ||
  //       (typeof sizeEntry[field] === "string" && sizeEntry[field].trim() === "")
  //     ) {
  //       return {
  //         code: `PRODUCT_MISSING_FIELD_to_Size_${field}`,
  //         args: [product.supplierProductNumber ?? product.ID],
  //       };
  //     }
  //   }
  // }
}

async function checkArticleMandatoryProperties(
  article_ID: string
): Promise<IValidationError | undefined> {
  
  const article = await getArticleDetails(article_ID);

  // Shared identifier for Article level errors
  const articleIdentifier: string | undefined =
      article.supplierProductNumber ?? article.ID

  const articleError = findMissingFields(
    article,
    mandatoryArticleFields,
    'ARTICLE',
    articleIdentifier
  );
  if (articleError) return articleError;

  const currencyError = fincCurrencyMissingFields(article, 'ARTICLE', articleIdentifier);
  if (currencyError) return currencyError;

  for (const option of article.to_Option || []) {
    // Shared identifier for Option level errors
    const optionIdentifier: string | undefined =
        option.evaluationColor_ID ?? option.ID;

    const optionError = findMissingFields(
      option,
      mandatoryProductFields,
      'PRODUCT',
      optionIdentifier
    );
    if (optionError) return optionError;

    const currencyError = fincCurrencyMissingFields(option, 'PRODUCT', optionIdentifier);
    if (currencyError) return currencyError;

    for (const proudctSizes of option.to_Size || []) {
      // Shared identifier for Variant level errors
      const variantIdentifier: string | undefined =
          proudctSizes.size_1_CODE ?? proudctSizes.ID;

      const sizesError = findMissingFields(
        proudctSizes,
        mandatoryProductToSizeFields,
        'VARIANT',
        variantIdentifier
      );
      if (sizesError) return sizesError;

      const currencyError = fincCurrencyMissingFields(proudctSizes, 'VARIANT', variantIdentifier);
      if (currencyError) return currencyError;
    }
  }
  return;
}

async function checkVariantMandatoryProperties(
  productSize_ID: string
): Promise<IValidationError | undefined> {

  const proudctSizes = await getProductSizesDetails(productSize_ID)

  if (!proudctSizes) {
    return {
      code: 'VARIANT_NOT_FOUND',
      args: [productSize_ID],
    };
  }

  // Shared identifier for Article level errors
  const variantIdentifier: string | undefined =
      proudctSizes.size_1_CODE ?? proudctSizes.ID

  const variantError = findMissingFields(
    proudctSizes,
    mandatoryProductToSizeFields,
    'VARIANT',
    variantIdentifier
  );
  if (variantError) return variantError;

  const currencyError = fincCurrencyMissingFields(proudctSizes, 'VARIANT', variantIdentifier);
  if (currencyError) return currencyError;

  return;
}

export async function validateProduct(
  product_ID: string
): Promise<IValidationError | undefined> {
  const mandatory_ERROR = await checkMandatoryProperties(product_ID);
  if (mandatory_ERROR) {
    // return {
    //   code: mandatory_ERROR.code,
    //   args: mandatory_ERROR.args,
    // };
    return mandatory_ERROR;
  }
  return;
}

export async function validateArticle(
  article_ID: string,
): Promise<IValidationError | undefined> {
  const mandatoryError = await checkArticleMandatoryProperties(article_ID);
  if (mandatoryError) return mandatoryError;
  return;
}

export async function validateProductSizes(
  productSize_ID: string,
): Promise<IValidationError | undefined> {
  const mandatoryError = await checkVariantMandatoryProperties(productSize_ID);
  if (mandatoryError) return mandatoryError;
  return;
}
