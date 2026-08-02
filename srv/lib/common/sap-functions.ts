import {
  SAPOrderItem,
  OrderTypeDetermination,
  StorageLocationDetermination,
} from "#cds-models/com/valantic/preorder/writingAppointments";
import { OrdersECC } from "#cds-models/index";
import cds from "@sap/cds";
import { getWritingAppointmentBudget } from "./db-functions";
import { Product } from "#cds-models/com/valantic/preorder/product";
import { DeepProductSet, ProductSet } from "#cds-models/API_PREORDER";
import { getSizeDetails } from "./sap-existance-check";

interface OrderPayload {
  DeepID: string;
  to_Orders: OrdersECC[];
}

const MAX_HOUSE_GROUPS = 14;

/**
 * Fetches house group data and returns a map of house group to house count
 */
export async function getHouseGroupData(
  planning_ID: string,
): Promise<Map<number, { houseCount: number; plannedPurchaseLimit: number }>> {
  const houseGroups = await getWritingAppointmentBudget(planning_ID);

  return new Map(
    houseGroups.map((h: any) => [
      h.houseGroup,
      {
        houseCount: h.houseCount || 0,
        plannedPurchaseLimit: h.plannedPurchaseLimit || 0,
      },
    ]),
  );
}

/**
 * Calculates quantity for a specific house group
 */
export function calculateHouseGroupQuantity(
  product: any,
  hgIndex: number,
  houseCount: number | undefined,
): number {
  const productQuantity = product[`houseGroup${hgIndex}`] || 0;
  return productQuantity * (houseCount || 0);
}

/**
 * Calculates total order quantity for a product across all house groups
 */
function calculateOrderQuantity(
  product: any,
  houseCountMap: Map<
    number,
    { houseCount: number; plannedPurchaseLimit: number }
  >,
): number {
  let totalQuantity = 0;

  for (let hgIndex = 1; hgIndex <= MAX_HOUSE_GROUPS; hgIndex++) {
    const houseCount = houseCountMap.get(hgIndex)?.houseCount || 0;
    const productQuantity = product[`houseGroup${hgIndex}`] || 0;

    console.log(`House Group ${hgIndex}: ${houseCount}, ${productQuantity}`);

    totalQuantity += productQuantity * houseCount;
  }

  return totalQuantity;
}

/**
 * Builds the order payload for SAP
 */
function buildOrderPayload(
  orderItems: SAPOrderItem[],
  supplier_ID: string,
  consumerTopic_ID: string,
  planning_ID: string,
  productionPlant: string,
  ownershipRelationship: string,
  automaticAllocation: string,
  orderText: string,
  supplyType?: string,
): OrderPayload {
  const baseOrderId = "123e4567-e89b-12d3-a456-426614174003";

  return {
    DeepID: "123e4567-e89b-12d3-a456-426614174000",
    to_Orders: [
      {
        DeepOrderID: "123e4567-e89b-12d3-a456-426614174000",
        ID: baseOrderId,
        orderNumber: "",
        //In Klärung
        splitNumber: "",
        // SAP
        plant: "",
        salesOrganization: "",
        distributionChannel: "",
        division: "",
        supplier: supplier_ID,
        kt: consumerTopic_ID,
        //KT-Marke
        ownershipRelationship: ownershipRelationship ?? "",
        // Lieferantenstammdatenblatt -> Lieferant -> Produktionstätte
        productionPlant: productionPlant || "",
        // Empty
        orderApprovalReason: "",
        // Empty
        orderTextInfo: orderText || "",
        // Auftrags-ID
        externalOrderNumber: planning_ID,
        // Empty
        externalOrderPosition: "",
        dpcumentType: "",

        to_AdditionalData: {
          OrderID: baseOrderId,
          ID: "123e4567-e89b-12d3-a456-426614174005",
          processIndicator: automaticAllocation,
          aktnr: "",
          itemCategory: "",
          incotermsPart1: "",
          incotermsPart2: "",
          documentType: "",
        },
        to_Positions: orderItems.map((item) => ({
          OrderID: baseOrderId,
          ID: "123e4567-e89b-12d3-a456-426614174004",
          orderNumber: "",
          plant: "",
          // Produkt or KT-Marke
          ownershipRelationship:
            item.ownershipStatus_ID || ownershipRelationship || "",
          // Empty
          orderTextInfo: item.purchaseOrderText || "",
          //Liefertermin to LieferterminVZ auf Artikelebene
          ltVz: item.ltVz?.replace(/-/g, "") || "",
          // NEW auf Artikelebene
          ltBranch: item.ltBranch?.replace(/-/g, "") || "",
          // 1) Product Master Data 2) CT,Brand,Supplier master data sheet supplyType.storageLocation,
          storageLocation: item.storageLocation_LGORT || "",
          supplyType: item.supplyType_SUPPLY_TYPE || supplyType || "",
          shopID: item.shop == "VZ" ? "" : item.shop || "",
          //TODO Allocation if finalized
          allocationNumber: "",
          allocationItem: "",
          // Auftrags-App -> TODO: Ausprägung SAP
          splitRelevance: item.splitRelevance || "",
          sapArticleNumber: item.sapArticleNumber,
          orderQuantity: item.orderQuantity?.toString() || "0.00",
          transportChains: item.transportChain_TC_ID || "",
          productionSite: item.productionPlant_PRODUCTIONPLANT || "",
          bsart: item.documentType_BSART || "",
          pstyp: item.itemCategory_PSTYP || "",
          incoTerms: item.incoTerm_ID || "",
          productionCountry: item.countryOfProduction || "",
          // TODO add action number after table is replicated
          aktnr: item.actionNumber_AKTNR || "",
        })),
      },
    ],
  };
}

/**
 * Creates an order in SAP for the given planning ID
 */
export const createOrderInSAP = async (
  planning_ID: string,
): Promise<{
  positions: Array<{
    sapArticleNumber: string | null;
    shop: string | null;
    orderNumber: string;
    allocationNumber: string | null;
  }> | null;
  error: {
    status: number | null;
    statusText: string | null;
    sapStatus: string | null;
    sapStatusText: string | null;
    sapTransactionId: string | null;
  } | null;
}> => {
  const { SAPOrderItems, WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const { SupplierConsumerTopicBrands } = cds.entities(
    "com.valantic.preorder.consumertopicbrand",
  );
  const sapOrderItems = await cds.run(
    SELECT.from(SAPOrderItems).where({ writingAppointment_ID: planning_ID }),
  );
  const writingAppointment = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID }),
  );

  const supplierConsumerTopicBrand = await cds.run(
    SELECT.one.from(SupplierConsumerTopicBrands).where({
      consumerTopic_ID: writingAppointment?.consumerTopic_ID,
      brand_ID: writingAppointment?.brand_ID,
      supplier_ID: writingAppointment?.supplier_ID,
    }),
  );

  // Build payload
  const payload = buildOrderPayload(
    sapOrderItems,
    writingAppointment.supplier_ID,
    writingAppointment.consumerTopic_ID,
    writingAppointment.ID,
    supplierConsumerTopicBrand?.productionPlant_PRODUCTIONPLANT || "",
    supplierConsumerTopicBrand?.ownershipStatus_ID,
    writingAppointment.allocationMode_ID === "AutomaticAllocation" ||
      writingAppointment.allocationMode_ID === "PlanningWithSimulation"
      ? ""
      : "X",
    writingAppointment.orderReleaseText || "",
    supplierConsumerTopicBrand?.supplyType_SUPPLY_TYPE || "",
  );

  try {
    /*console.log(
      "PAYLOAD",
      payload,
      payload.to_Orders[0].to_Positions,
      payload.to_Orders[0].to_AdditionalData,
    );*/

    const preorder = await cds.connect.to("API_PREORDER");
    const result = await preorder.run(
      INSERT.into("DeepOrderSet").entries([payload]),
    );
    console.log("RESULT", result, "POSITIONS", result?.to_Orders?.[0]?.to_Positions);
    /*const result = {
      to_Orders: [
        {
          orderNumber: "4502952781",
          to_Positions: sapOrderItems.map((el: any) => ({
            sapArticleNumber: el.sapArticleNumber,
            shop: el.shop,
            orderNumber: "4502952781",
          })),
        },
      ],
    };*/

    const resultPositions = result?.to_Orders?.[0]?.to_Positions ?? [];
    const positions: Array<{
      sapArticleNumber: string | null;
      shop: string | null;
      orderNumber: string;
      allocationNumber: string | null;
    }> = resultPositions.map((el: any) => ({
      sapArticleNumber: el.sapArticleNumber ?? null,
      shop: el.shopID === ""? "VZ" : el.shopID ?? null,
      orderNumber: el.orderNumber,
      allocationNumber: el.allocationNumber ?? null,
    }));
    console.log("RETURN", positions);

    return { positions, error: null };
  } catch (e: any) {
    const error = {
      status: e?.reason?.response?.status,
      statusText:
        "{ code: " +
        e?.reason?.code +
        ", message: " +
        e?.reason?.message +
        " }",
      sapStatus: e?.reason?.response?.body?.error?.code,
      sapStatusText: e?.reason?.response?.body?.error?.innererror?.errordetails,
      sapTransactionId:
        e?.reason?.response?.body?.error?.innererror?.transactionid,
    };
    return { positions: null, error: error };
  }
};

export const createSAPOrderDraft = async (
  planning_ID: string,
): Promise<void> => {
  console.log("DRAFTING");
  const { SELECT } = cds.ql;
  const { ProductSizes, ProductsToWritingAppointments, Products } =
    cds.entities("com.valantic.preorder.product");
  const { SAPOrderItems, WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const { TB_SAC_BUDGET, TB_SAC_HGR, TB_SAC_SIZE_PLAN } = cds.entities("");

  const writingAppointmentData = await cds.run(
    SELECT.one
      .from(WritingAppointments)
      .where({ ID: planning_ID })
      .columns("allocationMode_ID as allocationMode"),
  );
  const automaticAllocation: boolean =
    writingAppointmentData?.allocationMode === "AutomaticAllocation" ||
    writingAppointmentData?.allocationMode === "PlanningWithSimulation";

  // 1. Get all ProductsToWritingAppointments for this planning (includes houseGroup amounts per product)
  const planningProducts = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pP: any) => {
        pP("*");
        pP.product((p: any) => {
          p("*");
        });
        pP.differingHouseGroups((dHG: any) => {
          dHG("houseGroup_ID");
        });
      }),
  );

  // 2. Determine the house group raster from TB_SAC_BUDGET and build shop map
  const houseGroupRasterResult = await cds.run(
    SELECT.one
      .from(TB_SAC_BUDGET)
      .where({
        WRAP: planning_ID,
        HGR: { "!=": "#" },
      })
      .columns("HGR as houseGroupRaster"),
  );
  const houseGroupRaster = houseGroupRasterResult?.houseGroupRaster;

  // Build a map: house group index (integer) -> distinct shop IDs (FILIALE) from TB_SAC_HGR
  const shopsByHouseGroup = new Map<number, Set<string>>();
  if (houseGroupRaster) {
    const shopsResult = await cds.run(
      SELECT.from(TB_SAC_HGR)
        .where({
          HAUSGRUPPENRASTER: houseGroupRaster,
          HAUSGRUPPE: { "!=": "#" },
        })
        .columns(
          "cast(HAUSGRUPPE as Integer) as houseGroup",
          "FILIALE as shop",
        ),
    );
    for (const row of shopsResult || []) {
      const hg: number = row.houseGroup;
      if (!shopsByHouseGroup.has(hg)) shopsByHouseGroup.set(hg, new Set());
      shopsByHouseGroup.get(hg)!.add(row.shop);
    }
  }

  // Use a map keyed by (sapArticleNumber::shop) to accumulate quantities and avoid duplicates
  const orderItemsMap = new Map<string, SAPOrderItem>();

  // 3. Iterate over products and distribute quantities by size (TB_SAC_SIZE_PLAN) and shop
  for (const planningProduct of planningProducts) {
    const productDetails = planningProduct.product;
    if (!productDetails) continue;

    const differingHouseGroups = (
      planningProduct.differingHouseGroups || []
    ).map((dHG: any) => parseInt(dHG.houseGroup_ID));

    const product = await cds.run(
      SELECT.one
        .from(Products)
        .where({ ID: planningProduct.product_ID })
        .columns((sCTP) => {
          sCTP("*");
          sCTP.supplyType((supplyType: any) => {
            supplyType("*");
          });
        }),
    );
    const orderType = await cds.run(
      SELECT.one.from(OrderTypeDetermination).where({
        supplyType_SUPPLY_TYPE: planningProduct?.supplyType_SUPPLY_TYPE,
        ownershipStatus_ID: product?.ownershipStatus_ID,
        isAction: planningProduct?.actionNumber_AKTNR != null,
      }),
    );
    const storageLocation = (
      await cds.run(
        SELECT.one.from(StorageLocationDetermination).where({
          supplyType_SUPPLY_TYPE: planningProduct?.supplyType_SUPPLY_TYPE,
          isAction: planningProduct?.actionNumber_AKTNR != null,
        }),
      )
    )?.storageLocation_LGORT;

    const commonFields = {
      writingAppointment_ID: planning_ID,
      product_ID: planningProduct.product_ID,
      ltVz: planningProduct.deliveryDateVZ || null,
      ltBranch: planningProduct.deliveryDateShop || null,
      storageLocation_LGORT: storageLocation || null,
      ownershipStatus_ID: product?.ownershipStatus_ID || null,
      supplyType_SUPPLY_TYPE: planningProduct?.supplyType?.SUPPLY_TYPE || null,
      incoTerm_ID: planningProduct.incoTerm_ID || null,
      productionPlant_PRODUCTIONPLANT:
        planningProduct.productionPlant_PRODUCTIONPLANT || null,
      transportChain_TC_ID: planningProduct.transportChain_TC_ID || null,
      purchaseOrderText: planningProduct.purchaseOrderText || null,
      countryOfProduction: planningProduct.countryOfProduction || null,
      itemCategory_PSTYP: orderType?.itemCategory_PSTYP || null,
      documentType_BSART: orderType?.documentType_BSART || null,
      actionNumber_AKTNR: planningProduct.actionNumber_AKTNR || null,
    };

    const supplyType = product?.supplyType?.SUPPLY_TYPE;
    const skipShopLevel = automaticAllocation;

    if (shopsByHouseGroup.size > 0) {
      for (let hgIndex = 1; hgIndex <= MAX_HOUSE_GROUPS; hgIndex++) {
        const hgAmount: number = planningProduct[`houseGroup${hgIndex}`] || 0;
        if (hgAmount <= 0) continue;

        const shops = shopsByHouseGroup.get(hgIndex);
        if (!shops || shops.size === 0) continue;

        // Use differingSizeKey for this house group if configured, otherwise fall back to sizeKey
        const sizeKey =
          planningProduct.differingSizeKey &&
          differingHouseGroups.includes(hgIndex)
            ? planningProduct.differingSizeKey
            : planningProduct.sizeKey;
        if (!sizeKey) continue;

        // Find the best matching lot size: MAX(LOTSIZE) <= hgAmount
        const lotSizeResult = await SELECT.one.from(TB_SAC_SIZE_PLAN)
          .where`KT = ${productDetails.consumerTopic_ID} AND BRAND = ${productDetails.brand_ID} AND SIZE_KEY = ${sizeKey} AND cast(LOTSIZE as Integer) <= ${hgAmount}`.columns(
          "MAX(LOTSIZE) as LOTSIZE",
        );

        if (!lotSizeResult?.LOTSIZE) continue;

        const sizeDistributions = await cds.run(
          SELECT.from(TB_SAC_SIZE_PLAN).where({
            KT: productDetails.consumerTopic_ID,
            BRAND: productDetails.brand_ID,
            SIZE_KEY: sizeKey,
            LOTSIZE: lotSizeResult.LOTSIZE,
          }),
        );

        if (!sizeDistributions || sizeDistributions.length === 0) continue;

        // Calculate per-size quantities; assign remainder to the last entry
        let remainingAmount = hgAmount;
        const sizeQuantities: { sizeDist: any; sizeQuantity: number }[] = [];
        for (let i = 0; i < sizeDistributions.length; i++) {
          const sizeDist = sizeDistributions[i];
          const percentage = (sizeDist.AMOUNT || 0) / 100;
          const sizeQuantity =
            i === sizeDistributions.length - 1
              ? remainingAmount
              : Math.round(hgAmount * percentage);
          remainingAmount -= sizeQuantity;
          sizeQuantities.push({ sizeDist, sizeQuantity });
        }

        // Create one order item per (size, shop)
        for (const { sizeDist, sizeQuantity } of sizeQuantities) {
          if (sizeQuantity <= 0) continue;

          const sizeCode: string = sizeDist.SIZE;
          const [size_1, size_2] = sizeCode.includes("-")
            ? sizeCode.split("-")
            : [sizeCode, null];

          const productSizeQuery: any = {
            product_ID: planningProduct.product_ID,
            size_1_CODE: size_1,
          };
          if (size_2) productSizeQuery.size_2_CODE = size_2;

          const productSize = await cds.run(
            SELECT.one.from(ProductSizes).where(productSizeQuery),
          );
          const sapArticleNumber = productSize?.sapNumber || null;

          if (skipShopLevel) {
            const mapKey = `${sapArticleNumber ?? "null"}`;
            if (orderItemsMap.has(mapKey)) {
              orderItemsMap.get(mapKey)!.orderQuantity =
                (orderItemsMap.get(mapKey)!.orderQuantity || 0) + sizeQuantity;
            } else {
              orderItemsMap.set(mapKey, {
                ...commonFields,
                sapArticleNumber,
                shop: "VZ",
                orderQuantity: sizeQuantity,
              });
            }
          } else {
            for (const shop of shops) {
              const mapKey = `${sapArticleNumber ?? "null"}::${shop}`;
              if (orderItemsMap.has(mapKey)) {
                orderItemsMap.get(mapKey)!.orderQuantity =
                  (orderItemsMap.get(mapKey)!.orderQuantity || 0) +
                  sizeQuantity;
              } else {
                orderItemsMap.set(mapKey, {
                  ...commonFields,
                  sapArticleNumber,
                  shop,
                  orderQuantity: sizeQuantity,
                });
              }
            }
          }
        }
      }
    } else {
      // Fallback: no raster / shop data available – use total amount with default shop
      const mapKey = `${planningProduct.product_ID}::VZ`;
      if (orderItemsMap.has(mapKey)) {
        orderItemsMap.get(mapKey)!.orderQuantity =
          (orderItemsMap.get(mapKey)!.orderQuantity || 0) +
          (planningProduct.totalAmount || 0);
      } else {
        /* GPOPT-1766: Temporal adjustment, needs Yannic review */
        const parentSapNumber = productDetails?.sapNumber || productDetails?.sapArticleNumber;
        const finalSapNumber = parentSapNumber || "";
        /* GPOPT-1766 */

        orderItemsMap.set(mapKey, {
          ...commonFields,
          sapArticleNumber: finalSapNumber,
          shop: "VZ",
          orderQuantity: planningProduct.totalAmount || 0,
        });
      }
    }
  }

  const orderItems = [...orderItemsMap.values()];

  await cds.run(
    DELETE.from(SAPOrderItems).where({ writingAppointment_ID: planning_ID }),
  );
  console.log("orderItems", orderItems);
  await cds.run(INSERT.into(SAPOrderItems).entries(orderItems));
};


export const createSAPOrderDraftV2 = async (
  planning_ID: string,
): Promise<void> => {
  console.log("DRAFTING V2");
  const { SELECT } = cds.ql;
  const { ProductSizes, ProductSizesToWritingAppointments } =
    cds.entities("com.valantic.preorder.product");
  const { SAPOrderItems, WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const { TB_SAC_BUDGET, TB_SAC_HGR } = cds.entities("");

  const writingAppointmentData = await cds.run(
    SELECT.one
      .from(WritingAppointments)
      .where({ ID: planning_ID })
      .columns("allocationMode_ID as allocationMode", "consumerTopic_ID"),
  );
  const automaticAllocation: boolean =
    writingAppointmentData?.allocationMode === "AutomaticAllocation" ||
    writingAppointmentData?.allocationMode === "PlanningWithSimulation";
  const consumerTopicLastThree = (writingAppointmentData?.consumerTopic_ID || "").slice(-3);

  // 1. Get all ProductsToWritingAppointments for this planning (includes houseGroup amounts per product)
  const planningVariants = await cds.run(
    SELECT.from(ProductSizesToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pP: any) => {
        pP("*");
        pP.productSize((p: any) => {
          p("*");
        });
        pP.differingHouseGroups((dHG: any) => {
          dHG("houseGroup_ID");
        });
      }),
  );

  // 2. Determine the house group raster from TB_SAC_BUDGET and build shop map
  const houseGroupRasterResult = await cds.run(
    SELECT.one
      .from(TB_SAC_BUDGET)
      .where({
        WRAP: planning_ID,
        HGR: { "!=": "#" },
      })
      .columns("HGR as houseGroupRaster"),
  );
  const houseGroupRaster = houseGroupRasterResult?.houseGroupRaster;

  // Build a map: house group index (integer) -> distinct shop IDs (FILIALE) from TB_SAC_HGR
  const shopsByHouseGroup = new Map<number, Set<string>>();
  if (houseGroupRaster) {
    const shopsResult = await cds.run(
      SELECT.from(TB_SAC_HGR)
        .where({
          HAUSGRUPPENRASTER: houseGroupRaster,
          HAUSGRUPPE: { "!=": "#" },
        })
        .columns(
          "cast(HAUSGRUPPE as Integer) as houseGroup",
          "FILIALE as shop",
        ),
    );
    for (const row of shopsResult || []) {
      const hg: number = row.houseGroup;
      if (!shopsByHouseGroup.has(hg)) shopsByHouseGroup.set(hg, new Set());
      shopsByHouseGroup.get(hg)!.add(row.shop);
    }
  }

  const orderItems :Array<SAPOrderItem> = [];
  // 3. Iterate over products and distribute quantities by shop
  console.log("planningVariants", planningVariants);
  for (const planningVariant of planningVariants) {
    const variantDetails = planningVariant.productSize;
    if (!variantDetails) continue;

    const product = await cds.run(
      SELECT.one
        .from(ProductSizes)
        .where({ ID: planningVariant.productSize_ID })
        .columns((sCTP) => {
          sCTP("*");
          sCTP.supplyType((supplyType: any) => {
            supplyType("*");
          });
        }),
    );
    const orderType = await cds.run(
      SELECT.one.from(OrderTypeDetermination).where({
        supplyType_SUPPLY_TYPE: planningVariant?.supplyType_SUPPLY_TYPE,
        ownershipStatus_ID: product?.ownershipStatus_ID,
        isAction: planningVariant?.actionNumber_AKTNR != null,
      }),
    );
    const storageLocation = (
      await cds.run(
        SELECT.one.from(StorageLocationDetermination).where({
          supplyType_SUPPLY_TYPE: planningVariant?.supplyType_SUPPLY_TYPE,
          isAction: planningVariant?.actionNumber_AKTNR != null,
        }),
      )
    )?.storageLocation_LGORT;

    const splitRelevance = planningVariant.supplyType_SUPPLY_TYPE === "CD1_M" ? "2" : planningVariant.supplyType_SUPPLY_TYPE === "CD2_M" ? "3" : null;

    const commonFields = {
      writingAppointment_ID: planning_ID,
      product_ID: product?.product_ID || null,
      productSize_ID: planningVariant.productSize_ID,
      ltVz: planningVariant.deliveryDateVZ || null,
      ltBranch: planningVariant.deliveryDateShop || null,
      storageLocation_LGORT: storageLocation || null,
      ownershipStatus_ID: product?.ownershipStatus_ID || null,
      supplyType_SUPPLY_TYPE: planningVariant?.supplyType_SUPPLY_TYPE || null,
      incoTerm_ID: planningVariant.incoTerm_ID || null,
      productionPlant_PRODUCTIONPLANT:
        planningVariant.productionPlant_PRODUCTIONPLANT || null,
      transportChain_TC_ID: planningVariant.transportChain_TC_ID || null,
      purchaseOrderText: planningVariant.purchaseOrderText || null,
      countryOfProduction: planningVariant.countryOfProduction || null,
      itemCategory_PSTYP: orderType?.itemCategory_PSTYP || null,
      documentType_BSART: orderType?.documentType_BSART || null,
      actionNumber_AKTNR: planningVariant.actionNumber_AKTNR || null,
      splitRelevance: splitRelevance,
    };

    const skipShopLevel = automaticAllocation;
    if (shopsByHouseGroup.size > 0) {
      for (let hgIndex = 1; hgIndex <= MAX_HOUSE_GROUPS; hgIndex++) {
        const hgAmount: number = planningVariant[`houseGroup${hgIndex}`] || 0;
        if (hgAmount <= 0) continue;

        const shops = shopsByHouseGroup.get(hgIndex);
        if (!shops || shops.size === 0) continue;

        // Use differingSizeKey for this house group if configured, otherwise fall back to sizeKey
          const sapArticleNumber = variantDetails?.sapNumber?.trim() || null;

        if (skipShopLevel) {
            orderItems.push({
              ...commonFields,
              sapArticleNumber,
              shop: "VZ",
              orderQuantity: hgAmount,
            });
          } else {
          for (const shop of shops) {
              const modifiedShop = shop.length >= 3
                ? shop.slice(0, -3) + consumerTopicLastThree
                : shop;
              orderItems.push({
                  ...commonFields,
                  sapArticleNumber,
                  shop: modifiedShop,
                  orderQuantity: hgAmount,
                })
            }
        }
      }
    } else {
      // Fallback: no raster / shop data available – use total amount with default shop

        orderItems.push( {
          ...commonFields,
          sapArticleNumber: variantDetails?.sapNumber?.trim() || null,
          shop: "VZ",
          orderQuantity: planningVariant.totalAmount || 0,
        });
    }
  }

  await cds.run(
    DELETE.from(SAPOrderItems).where({ writingAppointment_ID: planning_ID }),
  );
  await cds.run(INSERT.into(SAPOrderItems).entries(orderItems));
}

export const createSAPProduct = async (
  product_ID: string,
): Promise<{ successful: boolean; error: any }> => {
  const { UPDATE, INSERT } = cds.ql;
  const { Products, ProductSizes } = cds.entities(
    "com.valantic.preorder.product",
  );

  const product: Product = await cds.run(
    SELECT.one
      .from(Products)
      .where({ ID: product_ID })
      .columns((p) => {
        p("*"); // Select all scalar properties of Products
        /* GPOPT-1175: Remove valid range in purchase and sales data
        p.to_Sales((sales: any) => {
          sales("*"); // Select all properties of the composed entities
        });
        p.to_Purchase((purchase: any) => {
          purchase("*");
          purchase.vat((vat: any) => {
            vat("*");
          }); // Select all properties of the composed entities
        });
        */
        p.to_Size((sizes: any) => {
          sizes("*"); // Select all properties of the composed entities
        });
      }),
  );

  if (!product) {
    console.error("ERROR: The product with ID ${product_ID} was not found in the local database.");
    return {
      successful: false,
      error: {
        status: 404,
        statusText: "{ code: 404, message: Product Not Found in Local DB }",
        sapStatus: "LOCAL_DB_ERROR",
        sapStatusText: "The product with ID ${product_ID} does not exist or could not be retrieved for transmission to SAP.",
        sapTransactionId: null,
      },
    };
  }

  const payload: DeepProductSet = createProductPayload(product);

  try {
    console.log("PAYLOAD", payload, payload.to_Products);

    const preorder = await cds.connect.to("API_PREORDER");
    const result = await preorder.run(
      INSERT.into("DeepProductSet").entries([payload]),
    );
    console.log("PRODUCT CREATION", result, result.to_Products);
    /*const result = {
      to_Products: [{ GTIN: "4012345678904", sapNumber: "1234" }],
    };*/
    for (const createdProduct of result.to_Products) {
      console.log("CREATED PRODUCT", createdProduct);
      await cds.run(
        UPDATE.entity(ProductSizes)
          .where({ ID: createdProduct.ID })
          .set({ sapNumber: createdProduct.sapNumber.trim() }),
      );
    }

    return {
      successful: true,
      error: null,
    };
  } catch (e: any) {
    const error = {
      status: e?.reason?.statusCode,
      statusText:
        "{ code: " +
        e?.reason?.code +
        ", message: " +
        e?.reason?.message +
        " }",
      sapStatus: e?.reason?.response?.body?.error?.code,
      sapStatusText: e?.reason?.response?.body?.error?.innererror?.errordetails,
      sapTransactionId:
        e?.reason?.response?.body?.error?.innererror?.transactionid,
    };
    return { successful: false, error: error };
  }
};

const createProductPayload = (product: Product): DeepProductSet => {
  console.log(product);
  const productsToCreate: ProductSet[] = [];

  // Get the latest purchase and sales data
  /* GPOPT-1175: Remove valid range in purchase and sales data
  const latestPurchase = product.to_Purchase?.sort((a, b) => {
    const dateA = a.validFrom ? new Date(a.validFrom).getTime() : 0;
    const dateB = b.validFrom ? new Date(b.validFrom).getTime() : 0;
    return dateB - dateA;
  })?.[0];

  // Get the latest sales data based on validFrom date
  const latestSales = product.to_Sales?.sort((a, b) => {
    const dateA = a.validFrom ? new Date(a.validFrom).getTime() : 0;
    const dateB = b.validFrom ? new Date(b.validFrom).getTime() : 0;
    return dateB - dateA;
  })?.[0];
  */

  // Create a product entry for each size combination
  for (const size of product.to_Size || []) {
    productsToCreate.push({
      ID: size.ID,
      name: product.name || "",
      status: product.status_ID || "",
      supplier: product.supplier_ID || "",
      consumerTopic: product.consumerTopic_ID || "",
      brand: product.brand_ID || "",
      topicComponent: product.topicComponent_ID || "",
      assortmentModule: product.assortmentModule_ID || "",
      productGroup: product.productGroup_ID || "",
      targetGroup: product.targetGroup_ID || "",
      module: product.module_CODE || "",
      supplierProductNumber: product.supplierProductNumber || "",
      supplierProductNumberVariant: size.supplierProductNumberVariant || "",
      productText: product.productText || "",
      supplierProductName: product.supplierProductName || "",
      receiptText: product.receiptText || "",
      supplierColor: product.supplierColor || "",
      evaluationColor: product.evaluationColor_ID || "",
      sizeSystem: product.sizeSystem_ID || "",
      size1: size.size_1_CODE || "",
      size2: size.size_2_CODE || "",
      sizeRun: product.sizeRun || "",
      GTIN: size.GTIN || "",
      supplyType: product.supplyType_SUPPLY_TYPE || "",
      seasonType: product.seasonType_ID || "",
      seasonYear: product.seasonYear || "",
      presentationType: product.presentationType_CODE || "",
      sapNumber: "",
      lotNumber: "",
      pricatCatalog: product.pricatCatalog_ID || "",
      productType: product.productType_ID || "",
      ownershipStatus: product.ownershipStatus_ID || "",
      gridBox: product.gridBox_ID || "",
      omnichannel: product.omnichannel_CODE || "",
      shippingInstruction: product.shippingInstruction_ID || "",
      shippingPort: product.shippingPort_ID || "",
      productionPlant: product.productionPlant_PRODUCTIONPLANT || "",
      // differingIncoTerm: product.differingIncoTerm_ID || "",
      mainLabel: product.mainLabel_ID || "",
      subLabel: product.subLabel_ID || "",
      sizeLabel: product.sizeLabel_ID || "",
      sizeCode: product.sizeCode_ID || "",
      hangTag: product.hangTag_ID || "",
      stringWithSeal: product.stringWithSeal_ID || "",
      priceSticker: product.priceSticker_ID || "",
      careLabel: product.careLabel_ID || "",
      addHangTag: product.addHangTag_ID || "",
      houseGroup: product.houseGroup_ID || "",
      // costOfGoodsCalculation: product.costOfGoodsCalculation || "",
      //lotOrDisplayCreation: product.lotCreation,
      // priceLevel: product.priceLevel_ID || "",
      onlineSalesFrom: product.onlineSalesFrom || "",
      series: product.series_ID || "",
      license: product.license_CODE || "",
      program: product.program_ID || "",
      occasion: product.occasion_CODE || "",
      property: product.property_CODE || "",
      quality: product.quality_CODE || "",
      pattern: product.pattern_ID || "",
      specialProduct: product.specialProduct_ID || "",
      surfaceWashing: product.surfaceWashing_CODE || "",
      mainForm: product.mainForm_CODE || "",
      stockingThickness: product.stockingThickness_CODE || "",
      basicDataText: product.basicDataText || "",
      purchaseOrderText: product.purchaseOrderText || "",
      vkhm1: product.hangerMethod_ID || "",
      vkhm2: product.merchandiseSecurityMethod_ID || "",
      vkhm3: product.priceLabelMethod_ID || "",
      attachmentMethod1: "",
      attachmentMethod2: "",
      attachmentMethod3: "",
      /* GPOPT-1195 */
      dispositionFeature: "",
      loadingGroup: product.loadingGroup_ID || "",
      sustainabilitySealOfApproval:
        product.sustainabilitySealOfApproval_GSNR || "",
      sustainabilityCertifier: product.sustainabilityCertifier || "",
      sustainabilityMaterial: product.sustainabilityMaterial || "",
      sustainabilityPortion: product.sustainabilityPortion?.toString() || "",
      washing: product.washing_ID || "",
      bleaching: product.bleaching_ID || "",
      ironing: product.ironing_ID || "",
      cleaning: product.cleaning_ID || "",
      drying: product.drying_ID || "",
      availableFrom: product.availableFrom || "",
      availableUntil: product.availableUntil || "",
      endOfLifeCycle: product.endOfLifeCycle || "",
      differentUnitOfMeasureAvailable:
        product.differentUnitOfMeasureAvailable?.toString() || "",
      differentUnitOfMeasure1: product.differentUnitOfMeasure1 || "",
      differentUnitOfMeasureOut1: product.differentUnitOfMeasureOut1 || "",
      differentUnitOfMeasure2: product.differentUnitOfMeasure2 || "",
      differentUnitOfMeasureOut2: product.differentUnitOfMeasureOut2 || "",
      differentUnitOfMeasure3: product.differentUnitOfMeasure3 || "",
      differentUnitOfMeasureOut3: product.differentUnitOfMeasureOut3 || "",
      differentUnitOfMeasure4: product.differentUnitOfMeasure4 || "",
      differentUnitOfMeasureOut4: product.differentUnitOfMeasureOut4 || "",
      onlineOrderStep: product.onlineOrderStep || "",
      minimumOrderQuantity: product.minimumOrderQuantity || 0,
      maximumOrderQuantity: product.maximumOrderQuantity || 0,
      comment: product.comment || "",
      /* GPOPT-1324
      supplierProductGroup: product.supplierProductGroup || "",
      */
      transportChain: product.transportChain_TC_ID || "",
      imageUrl: product.imageUrl || "",
      ParentID: "123e4567-e89b-12d3-a456-426614174000",
      baseUnitOfMeasure: product.baseUnitOfMeasure_ID || "",
      orderUnit: product.baseUnitOfMeasure_ID || "",
      orderUnitConversionUnit: product.baseUnitOfMeasure_ID || "",
      orderUnitConversionRatio: "1",
      storageUnit: product.storageUnit_ID || "",
      storageUnitConversionUnit: product.baseUnitOfMeasure_ID || "",
      storageUnitConversionRatio:
        product.storageUnitConversionRatio?.toString() || "",
      salesUnit: product.baseUnitOfMeasure_ID || "",
      salesUnitConversionUnit: product.baseUnitOfMeasure_ID || "",
      salesUnitConversionRatio: "1",
      To_Purchase: [
        {
          ProductID: size.ID,
          ID: "75467f74-adae-4638-b44d-aafa150c6bc9",
          vat: product?.vat?.toString() || "",
          currency: product.currency_ID || "",
          purchasePriceEURNetto: product.purchasePriceEURNetto || 0,
        },
      ],
      To_Sales: [
        {
          ProductID: size.ID,
          ID: "35aa44f6-a053-4d2d-b507-ceabd258a670",
          uvpPrice: product.uvpPrice || 0,
          currentPrice: product.currentPrice || 0,
          uvpType: product.uvpType_ID || "",
        },
      ],
      /* GPOPT-1175: Remove valid range in purchase and sales data
      To_Purchase: latestPurchase
        ? [
            {
              ProductID: size.ID,
              ID: latestPurchase.ID,
              vat: latestPurchase?.vat?.vat?.toString() || "",
              currency: latestPurchase.currency_ID || "",
              purchasePriceEURNetto: latestPurchase.purchasePriceEURNetto || 0,
            },
          ]
        : [],
      To_Sales: latestSales
        ? [
            {
              ProductID: size.ID,
              ID: latestSales.ID,
              uvpPrice: latestSales.uvpPrice || 0,
              currentPrice: latestSales.currentPrice || 0,
              uvpType: latestSales.uvpType_ID || "",
            },
          ]
        : [],
        */
    });
  }
  console.log("PRODUCTS TO CREATE", productsToCreate);
  return {
    DeepID: "123e4567-e89b-12d3-a456-426614174000",
    to_Products: productsToCreate,
  };
};

export const createProductToSAP = async (
  product_ID: string,
  level: string,
): Promise<{ successful: boolean; error: any }> => {
  const { UPDATE, INSERT } = cds.ql;
  const { ProductSizes, Articles, Products } = cds.entities("com.valantic.preorder.product");

  const productSizes = await getSizeDetails(product_ID, level);

  const payload: DeepProductSet = createODATAPayload(productSizes);

  try {
    console.log("PAYLOAD", payload, payload.to_Products);

    const preorder = await cds.connect.to("API_PREORDER");
    const result = await preorder.run(
      INSERT.into("DeepProductSet").entries([payload]),
    );
    console.log("PRODUCT CREATION", result, result.to_Products);

    for (const createdProduct of result.to_Products) {
      console.log("CREATED PRODUCT", createdProduct);      
      const parentId = await cds.run(
        SELECT.one.from(ProductSizes)
          .where({ ID: createdProduct.ID })
          .columns("article_ID", "product_ID")
      );
      await Promise.all([
        cds.run(
          UPDATE.entity(Articles)
            .where({ ID: parentId?.article_ID })
            .set({ sapNumber: createdProduct.sapArticleNumber.trim() }),
        ),
        cds.run(
          UPDATE.entity(Products)
            .where({ ID: parentId?.product_ID })
            .set({ sapNumber: createdProduct.sapArticleNumber.trim() }),
        ),
        cds.run(
          UPDATE.entity(ProductSizes)
            .where({ ID: createdProduct.ID })
            .set({ sapNumber: createdProduct.sapNumber.trim() }),
        ),
      ]);
    }

    return {
      successful: true,
      error: null,
    };
  } catch (e: any) {
    const error = {
      status: e?.reason?.statusCode,
      statusText:
        "{ code: " +
        e?.reason?.code +
        ", message: " +
        e?.reason?.message +
        " }",
      sapStatus: e?.reason?.response?.body?.error?.code,
      sapStatusText: e?.reason?.response?.body?.error?.innererror?.errordetails,
      sapTransactionId:
        e?.reason?.response?.body?.error?.innererror?.transactionid,
    };
    return { successful: false, error: error };
  }
};

const createODATAPayload = (productSizes: any): DeepProductSet => {
  console.log(productSizes);
  const productsToCreate: ProductSet[] = [];

  // Create a product entry for each size combination
  for (const size of productSizes || []) {
    productsToCreate.push({
      ID: size.ID,
      name: size.name || "",
      status: size.status_ID || "",
      supplier: size.supplier_ID || "",
      consumerTopic: size.consumerTopic_ID || "",
      brand: size.brand_ID || "",
      topicComponent: size.topicComponent_ID || "",
      assortmentModule: size.assortmentModule_ID || "",
      productGroup: size.productGroup_ID || "",
      targetGroup: size.targetGroup_ID || "",
      module: size.module_CODE || "",
      supplierProductNumber: size.supplierProductNumber || "",
      supplierProductNumberVariant: size.supplierProductNumberVariant || "",
      productText: size.productText || "",
      supplierProductName: size.supplierProductName || "",
      receiptText: size.receiptText || "",
      supplierColor: size.supplierColor || "",
      evaluationColor: size.evaluationColor_ID || "",
      sizeSystem: size.sizeSystem_ID || "",
      size1: size.size_1_CODE || "",
      size2: size.size_2_CODE || "",
      sizeRun: size.sizeRun || "",
      GTIN: size.GTIN || "",
      supplyType: size.supplyType_SUPPLY_TYPE || "",
      seasonType: size.seasonType_ID || "",
      seasonYear: size.seasonYear || "",
      presentationType: size.presentationType_CODE || "",
      sapNumber: "",
      lotNumber: "",
      pricatCatalog: size.pricatCatalog_ID || "",
      productType: "02", //size.productType_ID || "", // GPOPT-1646 - Pass Collective article to ECC
      ownershipStatus: size.ownershipStatus_ID || "",
      gridBox: size.gridBox_ID || "",
      omnichannel: size.omnichannel_CODE || "",
      shippingInstruction: size.shippingInstruction_ID || "",
      shippingPort: size.shippingPort_ID || "",
      productionPlant: size.productionPlant_PRODUCTIONPLANT || "",
      // differingIncoTerm: size.differingIncoTerm_ID || "",
      mainLabel: size.mainLabel_ID || "",
      subLabel: size.subLabel_ID || "",
      sizeLabel: size.sizeLabel_ID || "",
      sizeCode: size.sizeCode_ID || "",
      hangTag: size.hangTag_ID || "",
      stringWithSeal: size.stringWithSeal_ID || "",
      priceSticker: size.priceSticker_ID || "",
      careLabel: size.careLabel_ID || "",
      addHangTag: size.addHangTag_ID || "",
      houseGroup: size.houseGroup_ID || "",
      // costOfGoodsCalculation: size.costOfGoodsCalculation || "",
      //lotOrDisplayCreation: size.lotCreation,
      // priceLevel: size.priceLevel_ID || "",
      onlineSalesFrom: size.onlineSalesFrom || "",
      series: size.series_ID || "",
      license: size.license_CODE || "",
      program: size.program_ID || "",
      occasion: size.occasion_CODE || "",
      property: size.property_CODE || "",
      quality: size.quality_CODE || "",
      pattern: size.pattern_ID || "",
      specialProduct: size.specialProduct_ID || "",
      surfaceWashing: size.surfaceWashing_CODE || "",
      mainForm: size.mainForm_CODE || "",
      stockingThickness: size.stockingThickness_CODE || "",
      basicDataText: size.basicDataText || "",
      purchaseOrderText: size.purchaseOrderText || "",
      vkhm1: "",
      vkhm2: size.merchandiseSecurityMethod_ID || "",
      vkhm3: size.priceLabelMethod_ID || "",
      // TODO: Extend API_PREORDER with vkhm4 for hangerMethod
      // vkhm4: size.hangerMethod_ID || "",
      attachmentMethod1: "",
      attachmentMethod2: "",
      attachmentMethod3: "",
      dispositionFeature: "",
      loadingGroup: size.loadingGroup_ID || "",
      sustainabilitySealOfApproval:
        size.sustainabilitySealOfApproval_GSNR || "",
      sustainabilityCertifier: size.sustainabilityCertifier || "",
      sustainabilityMaterial: size.sustainabilityMaterial || "",
      sustainabilityPortion: size.sustainabilityPortion?.toString() || "",
      sustainabilityCertificateNumber:
        size.sustainabilityCertificateNumber || "",
      washing: size.washing_ID || "",
      bleaching: size.bleaching_ID || "",
      ironing: size.ironing_ID || "",
      cleaning: size.cleaning_ID || "",
      drying: size.drying_ID || "",
      availableFrom: size.availableFrom || "",
      availableUntil: size.availableUntil || "",
      endOfLifeCycle: size.endOfLifeCycle || "",
      differentUnitOfMeasureAvailable:
        size.differentUnitOfMeasureAvailable?.toString() || "",
      differentUnitOfMeasure1: size.differentUnitOfMeasure1 || "",
      differentUnitOfMeasureOut1: size.differentUnitOfMeasureOut1 || "",
      differentUnitOfMeasure2: size.differentUnitOfMeasure2 || "",
      differentUnitOfMeasureOut2: size.differentUnitOfMeasureOut2 || "",
      differentUnitOfMeasure3: size.differentUnitOfMeasure3 || "",
      differentUnitOfMeasureOut3: size.differentUnitOfMeasureOut3 || "",
      differentUnitOfMeasure4: size.differentUnitOfMeasure4 || "",
      differentUnitOfMeasureOut4: size.differentUnitOfMeasureOut4 || "",
      onlineOrderStep: size.onlineOrderStep || "",
      minimumOrderQuantity: size.minimumOrderQuantity || 0,
      maximumOrderQuantity: size.maximumOrderQuantity || 0,
      comment: size.comment || "",
      imageUrl: size.imageUrl || "",
      ParentID: "123e4567-e89b-12d3-a456-426614174000",
      baseUnitOfMeasure: size.baseUnitOfMeasure_ID || "",
      orderUnit: size.baseUnitOfMeasure_ID || "",
      orderUnitConversionUnit: size.baseUnitOfMeasure_ID || "",
      orderUnitConversionRatio: "1",
      storageUnit: size.storageUnit_ID || "",
      storageUnitConversionUnit: size.baseUnitOfMeasure_ID || "",
      storageUnitConversionRatio:
        size.storageUnitConversionRatio?.toString() || "",
      salesUnit: size.baseUnitOfMeasure_ID || "",
      salesUnitConversionUnit: size.baseUnitOfMeasure_ID || "",
      salesUnitConversionRatio: "1",
      specialOffer:
        size.specialOffer === true || size.specialOffer === "true" ? "X" : "",
      transportChain: size.transportChain_TC_ID || "",
      depotform: size.ownershipStatus_ID || "",
      material1: size.material1_ID || "",
      portion1: size.portion1 || 0,
      material2: size.material2_ID || "",
      portion2: size.portion2 || 0,
      material3: size.material3_ID || "",
      portion3: size.portion3 || 0,
      material4: size.material4_ID || "",
      portion4: size.portion4 || 0,
      material5: size.material5_ID || "",
      portion5: size.portion5 || 0,
      To_Purchase: [
        {
          ProductID: size.ID,
          ID: "75467f74-adae-4638-b44d-aafa150c6bc9",
          vat: size?.vat_ID === 1 ? "19" : size?.vat_ID === 2 ? "7" : "",
          currency: size.currency_ID || "",
          purchasePriceEURNetto: size.purchasePriceEURNetto || 0,
        },
      ],
      To_Sales: [
        {
          ProductID: size.ID,
          ID: "35aa44f6-a053-4d2d-b507-ceabd258a670",
          uvpPrice: size.uvpPrice || 0,
          retailPrice: size.retailPrice || 0,
          currentPrice: size.currentPrice || 0,
          uvpType: size.uvpType_ID || "",
        },
      ],
    });
  }
  return {
    DeepID: "123e4567-e89b-12d3-a456-426614174000",
    to_Products: productsToCreate,
  };
};
