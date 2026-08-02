import { ConsumerTopicBrand, Article } from "#cds-models/Product";
import cds from "@sap/cds";

const planningPropagateFields = new Set([
  "supplyType_SUPPLY_TYPE",
  "incoTerm_ID",
  "actionNumber_AKTNR",
  "deliveryDateVZ",
  "deliveryDateShop",
  "productionPlant_PRODUCTIONPLANT",
  "transportChain_TC_ID",
  "countryOfProduction",
]);

export const addRuleDataToArticles = (
  requestData: any,
  rule: ConsumerTopicBrand,
) => {
  requestData.supplyType_SUPPLY_TYPE =
    requestData.supplyType_SUPPLY_TYPE ?? rule.supplyType_SUPPLY_TYPE;
  requestData.topicComponent_ID =
    requestData.topicComponent_ID ?? rule.topicComponent_ID;
  requestData.targetGroup_ID =
    requestData.targetGroup_ID ?? rule.targetGroup_ID;
  requestData.vat_ID = requestData.vat_ID ?? rule.vat_ID;
  requestData.pricatCatalog_ID =
    requestData.pricatCatalog_ID ?? rule.pricatCatalog_ID;
  requestData.productType_ID =
    requestData.articleType_ID ?? rule.productType_ID;
  requestData.ownershipStatus_ID =
    requestData.ownershipStatus_ID ?? rule.ownershipStatus_ID;
  requestData.gridBox_ID = requestData.gridBox_ID ?? rule.gridBox_ID;
  requestData.shippingInstruction_ID =
    requestData.shippingInstruction_ID ?? rule.shippingInstruction_ID;
  requestData.priceLevel_ID = requestData.priceLevel_ID ?? rule.priceLevel_ID;
  requestData.productionPlant_PRODUCTIONPLANT =
    requestData.productionPlant_PRODUCTIONPLANT ??
    rule.productionPlant_PRODUCTIONPLANT;
  requestData.ownershipStatus_ID =
    requestData.ownershipStatus_ID ?? rule.ownershipStatus_ID;
  requestData.loadingGroup_ID =
    requestData.loadingGroup_ID ?? rule.loadingGroup_ID;
  requestData.merchandiseSecurityMethod_ID =
    requestData.merchandiseSecurityMethod_ID ??
    rule.merchandiseSecurityMethod_ID;
  requestData.priceLabelMethod_ID =
    requestData.priceLabelMethod_ID ?? rule.priceLabelMethod_ID;
  requestData.hangerMethod_ID =
    requestData.hangerMethod_ID ?? rule.hangerMethod_ID;
  requestData.productionPlant_PRODUCTIONPLANT =
    requestData.productionPlant_PRODUCTIONPLANT ?? rule.productionPlant_PRODUCTIONPLANT;

  if (requestData.assortmentModule_ID) {
    requestData.productGroup_ID = rule.to_WG_SBS?.find(
      (module) =>
        module.assortmentModule_ID === requestData.assortmentModule_ID,
    )?.ID;
  }
  return requestData;
};

export const propagateRuleFromParent = (requestData: any, rule: any) => {
  // Fields to never copy across levels
  const excludedFields = new Set([
    "ID",
    "name",
    "description",
    "status",
    "status_ID",
    "article",
    "article_ID",
    "product",
    "product_ID",
    "to_Options",
    "to_WritingAppointments",
    "to_Size",
    "sapHttpStatus",
    "sapHttpStatusText",
    "sapStatus",
    "sapStatusText",
    "sapTransactionId",
    "createdAt",
    "createdBy",
    "modifiedAt",
    "modifiedBy",
  ]);

  for (const key of Object.keys(rule)) {
    if (excludedFields.has(key)) continue;
    if (
      typeof rule[key] === "object" &&
      !Array.isArray(rule[key]) &&
      rule[key] !== null
    )
      continue;
    if (Array.isArray(rule[key])) continue;
    if (
      requestData[key] === undefined ||
      requestData[key] === null ||
      requestData[key] === ""
    ) {
      requestData[key] = rule[key];
    }
  }
  return requestData;
};

export const getChangedFields = (oldValue: any, newValue: any) => {
  const excludedFields = new Set([
    "ID",
    "name",
    "description",
    "status",
    "status_ID",
    "article",
    "article_ID",
    "product",
    "product_ID",
    "to_Options",
    "to_WritingAppointments",
    "to_Size",
    "sapHttpStatus",
    "sapHttpStatusText",
    "sapStatus",
    "sapStatusText",
    "sapTransactionId",
    "createdAt",
    "createdBy",
    "modifiedAt",
    "modifiedBy",
  ]);

  let changedFields = new Map();
  for (const key of Object.keys(newValue)) {
    if (excludedFields.has(key)) continue;
    if (
      typeof newValue[key] === "object" &&
      !Array.isArray(newValue[key]) &&
      newValue[key] !== null
    )
      continue;
    if (Array.isArray(newValue[key])) continue;
    if (newValue[key] !== oldValue[key]) {
      changedFields.set(key, {
        oldValue: oldValue[key],
        newValue: newValue[key],
      });
    }
  }
  return changedFields;
};

export const mapNewValue = (childData: any, changedFields: any) => {
  const updatedChild: any = {};
  for (const [key, { oldValue, newValue }] of changedFields) {
    const childValue = childData[key];
    // If child value similar to old Article value -> change (to new article value)
    if (
      childValue === oldValue ||
      childValue === undefined ||
      childValue === null
    ) {
      updatedChild[key] = newValue;
    }
  }
  return updatedChild;
};

export const calculateNetPrice = (requestData: any, tableData: any) => {
  const currencyID =
    requestData?.currency_ID !== undefined
      ? requestData.currency_ID
      : tableData.currency_ID;
  const vatID =
    requestData?.vat_ID !== undefined ? requestData.vat_ID : tableData.vat_ID;
  const purchasePrice =
    requestData?.purchasePrice !== undefined
      ? requestData.purchasePrice
      : tableData.purchasePrice;
  const purchaseFactor =
    requestData?.purchaseFactor !== undefined
      ? requestData.purchaseFactor
      : tableData.purchaseFactor;
  if (currencyID && vatID) {
    const vatValue = vatID === "Full" ? 1.19 : 1.07;
    if (currencyID === "USD") {
      if (purchasePrice && purchaseFactor) {
        const cValue =
          Math.round(((purchaseFactor * purchasePrice) / vatValue) * 100) / 100;
        requestData.purchasePriceEURNetto = cValue;
      } else {
        requestData.purchasePriceEURNetto = null;
      }
    } else if (currencyID === "EUR") {
      if (purchasePrice) {
        const cValue = Math.round((purchasePrice / vatValue) * 100) / 100;
        requestData.purchasePriceEURNetto = cValue;
      } else {
        requestData.purchasePriceEURNetto = null;
      }
    }
  }
  return requestData;
};

export const mapProperties = (target: any, source: any) => {
  const aExclude = new Set([
    "ID",
    "name",
    "description",
    "article",
    "article_ID",
    "product",
    "product_ID",
    "to_Size",
    "sapHttpStatus",
    "sapHttpStatusText",
    "sapStatus",
    "sapStatusText",
    "sapTransactionId",
    "createdAt",
    "createdBy",
    "modifiedAt",
    "modifiedBy",
  ]);
  for (const key of Object.keys(source)) {
    if (aExclude.has(key)) continue;
    if (
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      source[key] !== null
    )
      continue;
    if (Array.isArray(source[key])) continue;
    target[key] = source[key];
  }
  return target;
};

export const getChangedPlanningFields = (requestData: any, oldOptionValue: any) => {
  const changedFields = new Map();
  for (const key of Object.keys(requestData)) {
    if (!planningPropagateFields.has(key)) continue;
    if (requestData[key] !== oldOptionValue[key]) {
      changedFields.set(key, {
        oldValue: oldOptionValue[key],
        newValue: requestData[key],
      });
    }
  }
  return changedFields;
};

export const mapChangedPlanningFields = (childData: any, changedFields: any) => {
  const updatedChild: any = {};
  for (const [key, {oldValue, newValue}] of changedFields) {
    const childValue = childData[key];
    if (childValue === oldValue || childValue === undefined || childValue === null) {
      updatedChild[key] = newValue;
    }
  }
  return updatedChild;
};

export const findIDOfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  const { SELECT } = cds.ql;
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const searchValue =
    value !== undefined && value !== null ? String(value).toUpperCase() : "";
  const result = await cds.run(
    SELECT.one.from(entity)
      .where`upper(ID) = ${searchValue} or upper(name) = ${searchValue}`.columns(
      "ID",
    )
  );

  return (result?.ID as string) ?? null;
};

export const findPRODUCTIONPLANTOfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const { SELECT } = cds.ql;
  const result = await cds.run(
    SELECT.one.from(entity).where(`PRODUCTIONPLANT = '${value}'`).columns("PRODUCTIONPLANT"),
  );
  return (result?.PRODUCTIONPLANT as string) ?? null;
};

export const findCodeOfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const { SELECT } = cds.ql;
  const searchValue =
    value !== undefined && value !== null ? String(value).toUpperCase() : "";
  const result = await cds.run(
    SELECT.one.from(entity)
      .where`upper(CODE) = ${searchValue} or upper(DESCRIPTION) = ${searchValue}`.columns(
      "CODE",
    ),
  );
  return (result?.CODE as string) ?? null;
};

export const findLGORTOfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const { SELECT } = cds.ql;
  const result = await cds.run(
    SELECT.one
      .from(entity)
      .where(`LGORT = '${value}' or LGOBE = '${value}'`)
      .columns("LGORT"),
  );
  return (result?.LGORT as string) ?? null;
};

export const findGSNROfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const { SELECT } = cds.ql;
  const result = await cds.run(
    SELECT.one.from(entity).where(`GSNR = '${value}'`).columns("GSNR"),
  );
  return (result?.GSNR as string) ?? null;
};

export const findSUPPLYTYPEOfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const { SELECT } = cds.ql;
  const result = await cds.run(
    SELECT.one
      .from(entity)
      .where(`SUPPLY_TYPE = '${value}'`)
      .columns("SUPPLY_TYPE"),
  );
  return (result?.SUPPLY_TYPE as string) ?? null;
};

export const findTCIDOfElement = async (
  namespace: string,
  entity: string,
  value: any,
) => {
  if (namespace.length > 0) {
    entity = `${namespace}.${entity}`;
  } else {
    entity = `${entity}`;
  }

  const { SELECT } = cds.ql;
  const searchValue =
    value !== undefined && value !== null ? String(value).toUpperCase() : "";
  const result = await cds.run(
    SELECT.one.from(entity)
      .where`upper(TC_ID) = ${searchValue} or upper(TC_NAME) = ${searchValue}`.columns(
      "TC_ID",
    ),
  );
  return (result?.TC_ID as string) ?? null;
};