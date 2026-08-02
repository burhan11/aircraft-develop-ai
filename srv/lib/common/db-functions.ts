import cds from "@sap/cds";
import {
  calculateHouseGroupQuantity,
  getHouseGroupData,
} from "./sap-functions";
import { validateSizeDistribution } from "./planning-validation";
import { Planning } from "#cds-models/PlanningService";
import {
  Products,
  ProductSizes,
  Articles,
} from "#cds-models/com/valantic/preorder/product";
import { SupplierConsumerTopicBrands } from "#cds-models/ConsumerTopicBrandService";
import { getChangedPlanningFields, mapChangedPlanningFields } from "./prefill-helper";

enum UpdateLevel {
  Article = "1",
  Product = "2",
  Variant = "3",
}

interface IUpdateChain {
  entity: any;
  whereCondition: Record<any, any>;
}

export const getCurrentIndexForProductInWritingAppointment = async (
  writingAppointment_ID: string,
) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );

  const result = (
    await cds.run(
      SELECT.from(ProductsToWritingAppointments)
        .where({
          writingAppointment_ID: writingAppointment_ID,
        })
        .columns("count(*) as count", "max(index) as maxIndex"),
    )
  )?.[0];

  return Math.max(result?.count, (result?.maxIndex ?? -1) + 1);
};

export const getCurrentIndexForArticlesInWritingAppointment = async (
  writingAppointment_ID: string,
) => {
  const { SELECT } = cds.ql;
  const { ArticlesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );

  const result = (
    await cds.run(
      SELECT.from(ArticlesToWritingAppointments)
        .where({
          writingAppointment_ID: writingAppointment_ID,
        })
        .columns("count(*) as count", "max(index) as maxIndex"),
    )
  )?.[0];

  return Math.max(result?.count ?? 0, (result?.maxIndex ?? -1) + 1);
};

export const getCurrentIndexForProductSizesInWritingAppointment = async (
  writingAppointment_ID: string,
) => {
  const { SELECT } = cds.ql;
  const { ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );

  const result = (
    await cds.run(
      SELECT.from(ProductSizesToWritingAppointments)
        .where({
          writingAppointment_ID: writingAppointment_ID,
        })
        .columns("count(*) as count", "max(index) as maxIndex"),
    )
  )?.[0];

  return Math.max(result?.count ?? 0, (result?.maxIndex ?? -1) + 1);
};

export const addProductsToPlanning = async (
  product_ID: string,
  planning_ID: string,
  index: number,
) => {
  if (!product_ID || !planning_ID) return;
  const { INSERT } = cds.ql;
  const { ProductsToWritingAppointments,
    ProductSizes,
    ProductSizesToWritingAppointments
   } = cds.entities(
    "com.valantic.preorder.product",
  );
  const result = await cds.run(
    INSERT.into(ProductsToWritingAppointments).entries([
      {
        writingAppointment_ID: planning_ID,
        product_ID: product_ID,
        index: index,
        ...(await getPrefilledPlanningProductFields(product_ID, "option")),
      },
    ]),
  );
  if (!result) return;
  
  const productSizes = await cds.run(
    SELECT.from(ProductSizes).where({ 
      product_ID: product_ID, 
      status_ID: { "!=": "MarkedForDeletion" } 
    }),
  )

  const PsToWA = new Map();
  const ind = await getCurrentIndexForProductSizesInWritingAppointment(planning_ID);
  for (let i = 0; i < productSizes.length; i++) {
    const ps = productSizes[i];
    const checkDuplicatePsToWA = await cds.run(
      SELECT.one.from(ProductSizesToWritingAppointments)
        .where({
          writingAppointment_ID: planning_ID,
          productSize_ID: ps.ID,
        })
    );
    if (checkDuplicatePsToWA) continue;
    const uniqueID = `${planning_ID}-${ps.ID}`;
    if (!PsToWA.has(uniqueID)) {
      PsToWA.set(uniqueID, {
        writingAppointment_ID: planning_ID,
        productSize_ID: ps.ID,
        index: ind + i,
        ...(await getPrefilledPlanningProductFields(ps.ID, "variant")),
      });
    }
  }
  const psToWAEntries = Array.from(PsToWA.values());
  await cds.run(INSERT.into(ProductSizesToWritingAppointments).entries(psToWAEntries));
};

export const getCurrentSalesComposition = async (
  productID?: string,
  productSizeID?: string
) => {
  const { SELECT } = cds.ql;
  const { Products, ProductSizes } = cds.entities("com.valantic.preorder.product");
  const today = new Date().toISOString().slice(0, 10);

  // Query the product and expand the to_Sales composition, filter by date
  let result;
  if (productID) {
    result = await SELECT.one.from(Products).where({
      ID: productID,
    });
  } else {
      result = await SELECT.one.from(ProductSizes).where({
        ID: productSizeID,
    });
  }
  /* GPOPT-1175: Remove valid range in purchase and sales data
  .columns((p) => {
      p("ID", "imageUrl"); // Select all scalar properties of Products
      p.to_Sales((sales: any) => {
        sales("*"); // Select all properties of the composed entities
      });
      p.to_Purchase((purchase: any) => {
        purchase("*"); // Select all properties of the composed entities
      });
    });
  // Filter the to_Sales array for valid date range
  const sales = (result?.to_Sales || []).find(
    (s: any) => s.validFrom <= today && s.validTo >= today
  );
  const purchase = (result?.to_Purchase || []).find(
    (s: any) => s.validFrom <= today && s.validTo >= today
  );
  */

  const sales = {
    retailPrice: result?.retailPrice,
    currentPrice: result?.currentPrice,
    uvpType: result?.uvpType,
    uvpPrice: result?.uvpPrice,
  };
  const purchase = {
    currency_ID: result?.currency_ID,
    vat: result?.vat_ID,
    purchasePrice: result?.purchasePrice,
    purchaseFactor: result?.purchaseFactor,
    purchasePriceUSD: result?.purchasePriceUSD,
    purchasePriceEURNetto: result?.purchasePriceEURNetto,
    productDiscount1: result?.productDiscount1,
    productDiscount2: result?.productDiscount2,
    productDiscount3: result?.productDiscount3,
  };
  return { sales: sales, purchase: purchase };
};

export const getBudgetHG = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const allocationMode =
    (
      await cds.run(
        SELECT.one
          .from(WritingAppointments)
          .columns("allocationMode_ID as allocationMode")
          .where({ ID: planning_ID }),
      )
    )?.allocationMode;
  const totalQuantityPlanning = allocationMode != null && allocationMode === "AutomaticAllocation";
  console.log(totalQuantityPlanning);
  let planningProducts;
  if (!totalQuantityPlanning) {
    planningProducts = await cds.run(
      SELECT.from(ProductSizesToWritingAppointments).columns(
        "productSize_ID",
        "houseGroup1",
        "houseGroup2",
        "houseGroup3",
        "houseGroup4",
        "houseGroup5",
        "houseGroup6",
        "houseGroup7",
        "houseGroup8",
        "houseGroup9",
        "houseGroup10",
        "houseGroup11",
        "houseGroup12",
        "houseGroup13",
        "houseGroup14",
        "houseGroup15",
      ).where`writingAppointment_ID = ${planning_ID}
          AND isValidSizeCurve = true
          AND (
            houseGroup1 > 0 OR
            houseGroup2 > 0 OR
            houseGroup3 > 0 OR
            houseGroup4 > 0 OR
            houseGroup5 > 0 OR
            houseGroup6 > 0 OR
            houseGroup7 > 0 OR
            houseGroup8 > 0 OR
            houseGroup9 > 0 OR
            houseGroup10 > 0 OR
            houseGroup11 > 0 OR
            houseGroup12 > 0 OR
            houseGroup13 > 0 OR
            houseGroup14 > 0 OR
            houseGroup15 > 0
          )`,
    );
  } else {
    // planningProducts = await getPlanningProducts(planning_ID);
    planningProducts = await cds.run(
      SELECT.from(ProductSizesToWritingAppointments)
        .where({ writingAppointment_ID: planning_ID,
          isValidSizeCurve: true,
         })
        .columns((pP: any) => {
          pP("*");
          pP.productSize((ps: any) => {
            ps("*");
          });
          pP.differingHouseGroups((dHG: any) => {
            dHG("houseGroup_ID");
          });
        }),
    );
  }

  const productsWithPrices = [];
  for (const planningProduct of planningProducts) {
    const { purchase } = await getCurrentSalesComposition(
      undefined,
      planningProduct.productSize_ID
    );
    const discountFactor = (100 - (purchase?.productDiscount1 ?? 0)) / 100;
    productsWithPrices.push({
      ...planningProduct,
      purchasePrice: (purchase?.purchasePriceEURNetto ?? 0) * discountFactor,
    });
  }

  const houseGroupData = await getHouseGroupData(planning_ID);
  const bugdetTotalAmount = await getBudgetTotalAmount(planning_ID);
  if (!totalQuantityPlanning) {
    if (houseGroupData.size === 0) {
      return "NO_HOUSE_GROUP_DATA_FOUND";
    }
  }

  const houseGroupBudgets = [];
  let overallPlannedLimit = 0;
  let overallCosts = 0;
  let overallProductCount = 0;
  let overallHouseCount = 0;
  let costs = 0;
  let productCountPerColor = 0;
  let hgProductCount = 0;

  if (!totalQuantityPlanning) {
    for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
      const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
      const plannedPurchaseLimit =
        houseGroupData.get(hgIndex)?.plannedPurchaseLimit || 0;

      costs = 0;
      productCountPerColor = 0;
      hgProductCount = 0;

      for (const product of productsWithPrices) {
        const hgQuantity = product[`houseGroup${hgIndex}`] || 0;
        const purchasePrice = product.purchasePrice || 0;

        if (hgQuantity > 0) {
          const totalQuantity = calculateHouseGroupQuantity(
            product,
            hgIndex,
            houseGroupData.get(hgIndex)?.houseCount,
          );

          costs += totalQuantity * purchasePrice;
          productCountPerColor++;
          hgProductCount += totalQuantity;
        }
      }

      const remainingBudget = plannedPurchaseLimit - costs;
      const remainingBudgetRatio =
        plannedPurchaseLimit > 0
          ? (remainingBudget / plannedPurchaseLimit) * 100
          : 0;

      houseGroupBudgets.push({
        houseGroup: hgIndex,
        houseCount,
        plannedPurchaseLimit,
        overallCosts: Math.round(100 * costs) / 100,
        remainingBudget: Math.round(100 * remainingBudget) / 100,
        remainingBudgetRatio: Math.round(100 * remainingBudgetRatio) / 100,
        productCountPerColor,
        overallProductCount: hgProductCount,
      });

      overallPlannedLimit += plannedPurchaseLimit;
      overallCosts += costs;
      overallProductCount += hgProductCount;
      overallHouseCount += houseCount;
    }
  } else {
    costs = 0;
    productCountPerColor = 0;
    hgProductCount = 0;

    const plannedPurchaseLimit = bugdetTotalAmount;

    for (const product of productsWithPrices) {
      const purchasePrice = product.purchasePrice || 0;
      costs += product.totalAmount * purchasePrice;
      productCountPerColor++;
      hgProductCount += product.totalAmount ?? 0;
    }

    const remainingBudget = plannedPurchaseLimit - costs;
    const remainingBudgetRatio =
      plannedPurchaseLimit > 0
        ? (remainingBudget / plannedPurchaseLimit) * 100
        : 0;

    const houseCount = 0;
    houseGroupBudgets.push({
      houseGroup: 0,
      houseCount: 0,
      plannedPurchaseLimit: plannedPurchaseLimit,
      overallCosts: Math.round(100 * costs) / 100,
      remainingBudget: Math.round(100 * remainingBudget) / 100,
      remainingBudgetRatio: Math.round(100 * remainingBudgetRatio) / 100,
      productCountPerColor,
      overallProductCount: hgProductCount,
    });

    overallPlannedLimit += plannedPurchaseLimit;
    overallCosts += costs;
    overallProductCount += hgProductCount;
    overallHouseCount += houseCount;
  }

  const overallRemainingBudget = overallPlannedLimit - overallCosts;
  const overallRemainingBudgetRatio =
    overallPlannedLimit > 0
      ? (overallRemainingBudget / overallPlannedLimit) * 100
      : 0;

  const overallBudget = {
    houseCount: overallHouseCount,
    plannedPurchaseLimit: overallPlannedLimit,
    overallCosts: Math.round(100 * overallCosts) / 100,
    remainingBudget: Math.round(100 * overallRemainingBudget) / 100,
    remainingBudgetRatio: Math.round(100 * overallRemainingBudgetRatio) / 100,
    productCountPerColor: planningProducts.length,
    overallProductCount,
  };

  // Transpose the data
  const transposedRows = [
    {
      label: "HOUSECOUNT",
      ...Object.fromEntries(
        houseGroupBudgets.map((hg) => [
          `hg${hg.houseGroup}`,
          hg.houseCount.toString(),
        ]),
      ),
      overall: overallBudget.houseCount.toString(),
    },
    {
      label: "BUDGET",
      ...Object.fromEntries(
        houseGroupBudgets.map((hg) => [
          `hg${hg.houseGroup}`,
          `${hg.plannedPurchaseLimit}`,
        ]),
      ),
      overall: `${overallBudget.plannedPurchaseLimit}`,
    },
    {
      label: "COSTS",
      ...Object.fromEntries(
        houseGroupBudgets.map((hg) => [
          `hg${hg.houseGroup}`,
          `${hg.overallCosts}`,
        ]),
      ),
      overall: `${overallBudget.overallCosts}`,
    },
    {
      label: "REMAININGBUDGET",
      ...Object.fromEntries(
        houseGroupBudgets.flatMap((hg) => [
          [`hg${hg.houseGroup}`, `${hg.remainingBudget}`],
          [
            `hg${hg.houseGroup}State`,
            hg.remainingBudget < 0 ? "Error" : "None",
          ],
        ]),
      ),
      overall: `${overallBudget.remainingBudget}`,
      overallState: overallBudget.remainingBudget < 0 ? "Error" : "None",
    },
    // {
    //   label: "REMAININGBUDGETRATIO",
    //   ...Object.fromEntries(
    //     houseGroupBudgets.flatMap((hg) => [
    //       [`hg${hg.houseGroup}`, `${hg.remainingBudgetRatio}`],
    //       [
    //         `hg${hg.houseGroup}State`,
    //         hg.remainingBudgetRatio < 0 ? "Error" : "None",
    //       ],
    //     ])
    //   ),
    //   overall: `${overallBudget.remainingBudgetRatio}%`,
    //   overallState: overallBudget.remainingBudgetRatio < 0 ? "Error" : "None",
    // },
    {
      label: "PRODUCTCOLORS",
      ...Object.fromEntries(
        houseGroupBudgets.map((hg) => [
          `hg${hg.houseGroup}`,
          hg.productCountPerColor.toString(),
        ]),
      ),
      overall: overallBudget.productCountPerColor.toString(),
    },
    {
      label: "OVERALLPRODUCTS",
      ...Object.fromEntries(
        houseGroupBudgets.map((hg) => [
          `hg${hg.houseGroup}`,
          hg.overallProductCount.toString(),
        ]),
      ),
      overall: overallBudget.overallProductCount.toString(),
    },
  ];

  return {
    houseGroupBudgets,
    overallBudget,
    transposedRows,
  };
};

const getPlanningProducts = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );
  return await cds.run(
    SELECT.from(ProductsToWritingAppointments).columns(
      "product_ID",
      "houseGroup1",
      "houseGroup2",
      "houseGroup3",
      "houseGroup4",
      "houseGroup5",
      "houseGroup6",
      "houseGroup7",
      "houseGroup8",
      "houseGroup9",
      "houseGroup10",
      "houseGroup11",
      "houseGroup12",
      "houseGroup13",
      "houseGroup14",
      "houseGroup15",
    ).where`writingAppointment_ID = ${planning_ID}
        AND (
          houseGroup1 > 0 OR
          houseGroup2 > 0 OR
          houseGroup3 > 0 OR
          houseGroup4 > 0 OR
          houseGroup5 > 0 OR
          houseGroup6 > 0 OR
          houseGroup7 > 0 OR
          houseGroup8 > 0 OR
          houseGroup9 > 0 OR
          houseGroup10 > 0 OR
          houseGroup11 > 0 OR
          houseGroup12 > 0 OR
          houseGroup13 > 0 OR
          houseGroup14 > 0 OR
          houseGroup15 > 0
        )`.columns((pP: any) => {
      pP("*");
      pP.product((p: any) => {
        p("*");
      });
      pP.differingHouseGroups((dHG: any) => {
        dHG("houseGroup_ID");
      });
    }),
  );
};

export const updateSizeDistribution = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { TB_SAC_SIZE_PLAN } = cds.entities("");
  const { PlanningProductsToPlanningSizes } = cds.entities(
    "com.valantic.preorder.planning",
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );
  const planning = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID }),
  );
  if (planning.status_ID !== "InProgress") {
    return;
  }
  const totQuantPlanning = planning.allocationMode_ID === "AutomaticAllocation";

  const validationError = await validateSizeDistribution(planning_ID);
  if (validationError) {
    await cds.run(
      DELETE.from(PlanningProductsToPlanningSizes).where({
        writingAppointment_ID: planning_ID,
      }),
    );
    return;
  }
  let planningProducts;
  if (!totQuantPlanning) {
    planningProducts = await getPlanningProducts(planning_ID);
  } else {
    planningProducts = await cds.run(
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
  }

  const houseGroupData = await getHouseGroupData(planning_ID);
  if (!totQuantPlanning) {
    if (houseGroupData.size === 0) {
      return "NO_HOUSE_GROUP_DATA_FOUND";
    }
  }
  const sizeDistributionArray = [];

  for (const planningProduct of planningProducts) {
    const differingHouseGroups = planningProduct.differingHouseGroups.map(
      (dHG: any) => parseInt(dHG.houseGroup_ID),
    );
    const productDetails = planningProduct.product;
    const sizeItemsMap = new Map();
    if (!productDetails) return "PRODUCT_DETAILS_NOT_FOUND";
    if (!totQuantPlanning) {
      for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
        const sizeKey =
          planningProduct.differingSizeKey &&
          differingHouseGroups.includes(hgIndex)
            ? planningProduct.differingSizeKey
            : planningProduct.sizeKey;
        const currentHGAmount = planningProduct[`houseGroup${hgIndex}`] || 0;
        const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
        if (currentHGAmount <= 0) continue;
        const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
          .where`KT = ${productDetails.consumerTopic_ID} AND
          BRAND = ${productDetails.brand_ID} AND
          SIZE_KEY = ${sizeKey} AND
          cast(LOTSIZE as Integer) <= ${currentHGAmount}`.columns(
          "MAX(LOTSIZE) as LOTSIZE",
        );
        console.log("LOT", hgIndex, lotSize?.LOTSIZE);
        if (!lotSize?.LOTSIZE) return "NO_LOT_SIZE_FOUND";
        const sizeDistributions = await cds.run(
          SELECT.from(TB_SAC_SIZE_PLAN).where({
            KT: productDetails.consumerTopic_ID,
            BRAND: productDetails.brand_ID,
            SIZE_KEY: sizeKey,
            LOTSIZE: lotSize?.LOTSIZE || 0,
          }),
        );

        // Calculate quantities with remainder distribution
        let remainingAmount = currentHGAmount * houseCount;
        const sizeQuantities = [];

        for (let i = 0; i < sizeDistributions.length; i++) {
          const sizeDist = sizeDistributions[i];
          const percentage = (sizeDist.AMOUNT || 0) / 100;

          // For the last item, assign all remaining quantity
          const sizeQuantity =
            i === sizeDistributions.length - 1
              ? remainingAmount
              : Math.round(currentHGAmount * houseCount * percentage);

          remainingAmount -= sizeQuantity;
          sizeQuantities.push({ sizeDist, sizeQuantity });
        }
        console.log(sizeQuantities);
        for (const { sizeDist, sizeQuantity } of sizeQuantities) {
          const sizeKey = sizeDist.SIZE;

          if (!sizeItemsMap.has(sizeKey)) {
            const [size_1, size_2] = sizeKey.includes("-")
              ? sizeKey.split("-")
              : [sizeKey, null];
            sizeItemsMap.set(sizeKey, {
              writingAppointment_ID: planning_ID,
              product_ID: planningProduct.product_ID,
              combinedSize: sizeKey,
              size_1_CODE: size_1,
              size_2_CODE: size_2,
              houseGroup1: 0,
              houseGroup2: 0,
              houseGroup3: 0,
              houseGroup4: 0,
              houseGroup5: 0,
              houseGroup6: 0,
              houseGroup7: 0,
              houseGroup8: 0,
              houseGroup9: 0,
              houseGroup10: 0,
              houseGroup11: 0,
              houseGroup12: 0,
              houseGroup13: 0,
              houseGroup14: 0,
              houseGroup15: 0,
            });
          }

          const sizeItem = sizeItemsMap.get(sizeKey);
          sizeItem[`houseGroup${hgIndex}`] = sizeQuantity;
        }
      }
    } else {
      const sizeKey = planningProduct.differingSizeKey
        ? planningProduct.differingSizeKey
        : planningProduct.sizeKey;
      const currentAmount = planningProduct.totalAmount || 0;
      if (currentAmount <= 0) continue;
      const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
        .where`KT = ${productDetails.consumerTopic_ID} AND
          BRAND = ${productDetails.brand_ID} AND
          SIZE_KEY = ${sizeKey} AND
          cast(LOTSIZE as Integer) <= ${currentAmount}`.columns(
        "MAX(LOTSIZE) as LOTSIZE",
      );
      console.log("LOT", lotSize?.LOTSIZE);
      if (!lotSize?.LOTSIZE) return "NO_LOT_SIZE_FOUND";
      const sizeDistributions = await cds.run(
        SELECT.from(TB_SAC_SIZE_PLAN).where({
          KT: productDetails.consumerTopic_ID,
          BRAND: productDetails.brand_ID,
          SIZE_KEY: sizeKey,
          LOTSIZE: lotSize?.LOTSIZE || 0,
        }),
      );

      // Calculate quantities with remainder distribution
      let remainingAmount = currentAmount;
      const sizeQuantities = [];

      for (let i = 0; i < sizeDistributions.length; i++) {
        const sizeDist = sizeDistributions[i];
        const percentage = (sizeDist.AMOUNT || 0) / 100;

        // For the last item, assign all remaining quantity
        const sizeQuantity =
          i === sizeDistributions.length - 1
            ? remainingAmount
            : Math.round(currentAmount * percentage);

        remainingAmount -= sizeQuantity;
        sizeQuantities.push({ sizeDist, sizeQuantity });
      }
      console.log(sizeQuantities);
      for (const { sizeDist, sizeQuantity } of sizeQuantities) {
        const sizeKey = sizeDist.SIZE;

        if (!sizeItemsMap.has(sizeKey)) {
          const [size_1, size_2] = sizeKey.includes("-")
            ? sizeKey.split("-")
            : [sizeKey, null];
          sizeItemsMap.set(sizeKey, {
            writingAppointment_ID: planning_ID,
            product_ID: planningProduct.product_ID,
            combinedSize: sizeKey,
            size_1_CODE: size_1,
            size_2_CODE: size_2,
            totalAmount: planningProduct.totalAmount,
          });
        }

        const sizeItem = sizeItemsMap.get(sizeKey);
        sizeItem[`totalAmount`] = sizeQuantity;
      }
    }
    const sizeItems = Array.from(sizeItemsMap.values());
    if (!totQuantPlanning) {
      for (const sizeItem of sizeItems) {
        sizeItem.totalAmount =
          sizeItem.houseGroup1 +
          sizeItem.houseGroup2 +
          sizeItem.houseGroup3 +
          sizeItem.houseGroup4 +
          sizeItem.houseGroup5 +
          sizeItem.houseGroup6 +
          sizeItem.houseGroup7 +
          sizeItem.houseGroup8 +
          sizeItem.houseGroup9 +
          sizeItem.houseGroup10 +
          sizeItem.houseGroup11 +
          sizeItem.houseGroup12 +
          sizeItem.houseGroup13 +
          sizeItem.houseGroup14 +
          sizeItem.houseGroup15;
      }
    } // else {
    //   for (const sizeItem of sizeItems) {
    //     sizeItem.totalAmount = sizeItem.totalAmount
    //   }
    // }

    sizeDistributionArray.push(...sizeItems);
  }
  await cds.run(
    DELETE.from(PlanningProductsToPlanningSizes).where({
      writingAppointment_ID: planning_ID,
    }),
  );
  await cds.run(
    INSERT.into(PlanningProductsToPlanningSizes).entries(sizeDistributionArray),
  );
  return sizeDistributionArray;
};

export const updateProductSizesDistribution = async (
  planning_ID: string, 
  product_ID?: string
) => {  
  const { TB_SAC_SIZE_PLAN } = cds.entities("");
  const { 
    ProductsToWritingAppointments, 
    ProductSizesToWritingAppointments, 
    ProductSizes 
  } = cds.entities("com.valantic.preorder.product");
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const wa = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID }),
  );
  if (wa.status_ID !== "InProgress") {
    return;
  }
  const totQuantPlanning = wa.allocationMode_ID === "AutomaticAllocation";

  const planningProducts = (product_ID)
    ? await cds.run(
        SELECT.from(ProductsToWritingAppointments)
          .where({ writingAppointment_ID: planning_ID,
            product_ID: product_ID
          })
          .columns((pTW: any) => {
            pTW("*");
            pTW.product((p: any) => {
              p("*");
            });
            pTW.differingHouseGroups((dHG: any) => {
              dHG("houseGroup_ID");
            });
          })
      )
    : await cds.run(
        SELECT.from(ProductsToWritingAppointments)
          .where({ writingAppointment_ID: planning_ID })
          .columns((pTW: any) => {
            pTW("*");
            pTW.product((p: any) => {
              p("*");
            });
            pTW.differingHouseGroups((dHG: any) => {
              dHG("houseGroup_ID");
            });
          })
      );

  const productSizes = await cds.run(
    SELECT.from(ProductSizes)
    .where({ 
      product_ID: { in: planningProducts.map((pp: any) => pp.product_ID) },
      status_ID: { "!=": "MarkedForDeletion" } 
    })
  );
  const planningProductSizes = await cds.run(
    SELECT.from(ProductSizesToWritingAppointments)
    .where({ 
      writingAppointment_ID: planning_ID,
      productSize_ID: { in: productSizes.map((ps: any) => ps.ID) }
    })
    .columns((psTW: any) => {
      psTW("*");
      psTW.productSize((ps: any) => {
        ps("*");
      });
    })
  );

  const psbyId = productSizes.reduce((map: any, ps: any) => {
    if (!map[ps.product_ID]) map[ps.product_ID] = []; 
    map[ps.product_ID].push(ps);
    return map;
  }, {} );

  const pPsbyId = planningProductSizes.reduce((map: any, pPs: any) => {
    map[pPs.productSize_ID] = pPs;
    return map;
  }, {} );

  const houseGroupData = await getHouseGroupData(planning_ID);
  if (!totQuantPlanning) {
    if (houseGroupData.size === 0) return "NO_HOUSE_GROUP_DATA_FOUND";
  }

  const productSizesRowsToUpdate: any[] = []
  for (const planningProduct of planningProducts) {
    if (!planningProduct.sizeKey) continue;
    const productDetails = planningProduct.product;
    const differingHouseGroups = planningProduct.differingHouseGroups.map(
      (dHG: any) => parseInt(dHG.houseGroup_ID),
    );
    const sizeItemsMap = new Map();
    if (!productDetails) return "PRODUCT_DETAILS_NOT_FOUND";
    if (!totQuantPlanning) {
      for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
        const sizeKey =
          planningProduct.differingSizeKey &&
          differingHouseGroups.includes(hgIndex)
            ? planningProduct.differingSizeKey
            : planningProduct.sizeKey;
        const currentHGAmount = planningProduct[`houseGroup${hgIndex}`] || 0;
        const houseCount = houseGroupData.get(hgIndex)?.houseCount || 0;
        if (currentHGAmount <= 0) continue;
        const lotSize = await cds.run(
          SELECT.one.from(TB_SAC_SIZE_PLAN)
            .where `KT = ${productDetails.consumerTopic_ID} AND
              BRAND = ${productDetails.brand_ID} AND
              SIZE_KEY = ${sizeKey} AND
              cast(LOTSIZE as Integer) <= ${currentHGAmount}`
            .columns("MAX(LOTSIZE) as LOTSIZE")
        );
        if (!lotSize?.LOTSIZE) return "NO_LOT_SIZE_FOUND";
        const sizeDistributions = await cds.run(
          SELECT.from(TB_SAC_SIZE_PLAN).where({
            KT: productDetails.consumerTopic_ID,
            BRAND: productDetails.brand_ID,
            SIZE_KEY: sizeKey,
            LOTSIZE: lotSize?.LOTSIZE || 0,
          })
        );

        let remainingAmount = currentHGAmount;
        if (remainingAmount <= 0) continue;
        for (let i = 0; i < sizeDistributions.length; i++) {
          const sizeDist = sizeDistributions[i];
          const sizeKey = sizeDist.SIZE;
          const [size_1, size_2] = sizeKey.includes("-")
            ? sizeKey.split("-")
            : [sizeKey, null];

          const matchingProductSize = productSizes.find((ps: any) => 
            ps.product_ID === planningProduct.product_ID &&
            ps.size_1_CODE === size_1 &&
            (ps.size_1_CODE ? ps.size_2_CODE === size_2 : true)
          ); 
          if (!matchingProductSize) continue;

          const existingPsTW = pPsbyId[matchingProductSize.ID];
          if (!existingPsTW) continue;

          const percentage = (sizeDist.AMOUNT || 0) / 100;
          const sizeQuantity = 
            i === sizeDistributions.length - 1
              ? remainingAmount
              : Math.round(currentHGAmount * percentage);
          remainingAmount -= sizeQuantity;

          if (!sizeItemsMap.has(sizeKey)) {
            sizeItemsMap.set(sizeKey, {
              writingAppointment_ID: planning_ID,
              productSize_ID: existingPsTW.productSize_ID,
              sizeKey: planningProduct.sizeKey,
              houseGroup1: null,
              houseGroup2: null,
              houseGroup3: null,
              houseGroup4: null,
              houseGroup5: null,
              houseGroup6: null,
              houseGroup7: null,
              houseGroup8: null,
              houseGroup9: null,
              houseGroup10: null,
              houseGroup11: null,
              houseGroup12: null,
              houseGroup13: null,
              houseGroup14: null,
              houseGroup15: null,
              isValidSizeCurve: true,
            })
          }
          const sizeItem = sizeItemsMap.get(sizeKey);
          sizeItem[`houseGroup${hgIndex}`] = sizeQuantity;
        }
      }
    } else {
      const sizeKey = planningProduct.sizeKey;
      const currentAmount = planningProduct.totalAmount || 0;
      if (currentAmount <= 0) continue;
      const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
        .where`KT = ${productDetails.consumerTopic_ID} AND
          BRAND = ${productDetails.brand_ID} AND
          SIZE_KEY = ${sizeKey} AND
          cast(LOTSIZE as Integer) <= ${currentAmount}`.columns(
          "MAX(LOTSIZE) as LOTSIZE",
      );
      console.log("LOT", lotSize?.LOTSIZE);
      if (!lotSize?.LOTSIZE) return "NO_LOT_SIZE_FOUND";
      const sizeDistributions = await cds.run(
        SELECT.from(TB_SAC_SIZE_PLAN).where({
          KT: productDetails.consumerTopic_ID,
          BRAND: productDetails.brand_ID,
          SIZE_KEY: sizeKey,
          LOTSIZE: lotSize?.LOTSIZE || 0,
        }),
      );

      // Calculate quantities with remainder distribution
      let remainingAmount = currentAmount;
      if (remainingAmount <= 0) continue;
      for (let i = 0; i < sizeDistributions.length; i++) {
        const sizeDist = sizeDistributions[i];
        const sizeKey = sizeDist.SIZE;
        const [size_1, size_2] = sizeKey.includes("-")
          ? sizeKey.split("-")
          : [sizeKey, null];

        const matchingProductSize = productSizes.find((ps: any) => 
          ps.product_ID === planningProduct.product_ID &&
          ps.size_1_CODE === size_1 &&
          (ps.size_1_CODE ? ps.size_2_CODE === size_2 : true)
        ); 
        if (!matchingProductSize) continue;

        const existingPsTW = pPsbyId[matchingProductSize.ID];
        if (!existingPsTW) continue;

        const percentage = (sizeDist.AMOUNT || 0) / 100;
        const sizeQuantity = 
          i === sizeDistributions.length - 1
            ? remainingAmount
            : Math.round(currentAmount * percentage);
        remainingAmount -= sizeQuantity;

        if (!sizeItemsMap.has(sizeKey)) {
          sizeItemsMap.set(sizeKey, {
            writingAppointment_ID: planning_ID,
            productSize_ID: existingPsTW.productSize_ID,
            sizeKey: planningProduct.sizeKey,
            totalAmount: null,
            totalPurchaseAmount: null,
            isValidSizeCurve: true,
          });
        }
        const sizeItem = sizeItemsMap.get(sizeKey);
        sizeItem[`totalAmount`] = sizeQuantity;
      }
    }

    const sizeItems = Array.from(sizeItemsMap.values());
    for (const sizeItem of sizeItems) {
      const { purchase } = await getCurrentSalesComposition(
        undefined,
        sizeItem.productSize_ID,
      );
      if (!totQuantPlanning) {
        productSizesRowsToUpdate.push({
          ...sizeItem,
          totalAmount: sizeItem.houseGroup1 
            + sizeItem.houseGroup2 
            + sizeItem.houseGroup3 
            + sizeItem.houseGroup4 
            + sizeItem.houseGroup5 
            + sizeItem.houseGroup6 
            + sizeItem.houseGroup7 
            + sizeItem.houseGroup8 
            + sizeItem.houseGroup9 
            + sizeItem.houseGroup10 
            + sizeItem.houseGroup11 
            + sizeItem.houseGroup12
            + sizeItem.houseGroup13 
            + sizeItem.houseGroup14 
            + sizeItem.houseGroup15,
          totalPurchaseAmount: null,
        });
      } else {
        productSizesRowsToUpdate.push(sizeItem);
      }
      const ps = productSizesRowsToUpdate.find((ps: any) => 
        ps.productSize_ID === sizeItem.productSize_ID);
      if (ps) {
        const index = productSizesRowsToUpdate.indexOf(ps);
        productSizesRowsToUpdate[index].totalPurchaseAmount = productSizesRowsToUpdate[index].totalAmount
            * ((purchase?.purchasePriceEURNetto ?? 0) *
              (1 - (purchase?.productDiscount1 ?? 0) / 100))
      }
    }
  }
  for (const rowsUpdate of productSizesRowsToUpdate) {
    await cds.run(
      UPDATE.entity(ProductSizesToWritingAppointments)
        .set(rowsUpdate)
        .where({ 
          writingAppointment_ID: planning_ID,
          productSize_ID: rowsUpdate.productSize_ID 
        })
    );
  }
}

export const validateProductSizesDistribution = async (
  planning_ID: string, 
): Promise<{ code: string; args: any[] } | undefined> => { 
  const validationError = await validateSizeDistribution(planning_ID, true);
  if (validationError) {
    return validationError;
  }
}

export const updateProductsDistribution = async (
  request: any
) => {
  const { ProductSizes, 
    ProductsToWritingAppointments,
  } = cds.entities(
    "com.valantic.preorder.product",
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const productID = (await cds.run(
    SELECT.one
      .from(ProductSizes)
      .where({ ID: request.productSize_ID })
      .columns("product_ID")
  ))?.product_ID;

  const pToWA = await cds.run(
    SELECT.one
      .from(ProductsToWritingAppointments)
      .where({ 
        writingAppointment_ID: request.writingAppointment_ID, 
        product_ID: productID 
      })
  );
  const { purchase } = await getCurrentSalesComposition(productID);
  const currentPlanning = await cds.run(
    SELECT.one
      .from(WritingAppointments)
      .where({ ID: request.writingAppointment_ID }),
  );
  const totQuantPlanning = currentPlanning.allocationMode_ID === "AutomaticAllocation";
  const houseGroupData = await getHouseGroupData(
    request.writingAppointment_ID,
  );
  const queryData: Record<string, any> = {};
  const totalHGAmount: Record<string, any> = {};
  if (!totQuantPlanning) {
    for (let i = 1; i <= 15; i++) {
      const houseCount = houseGroupData.get(i)?.houseCount || 0;
      if (request[`houseGroup${i}`] > 0) {
        queryData[`houseGroup${i}`] = 
          (pToWA ? pToWA[`houseGroup${i}`] || 0 : 0)
          + request[`houseGroup${i}`] - request.oldPlanningProductSize?.[`houseGroup${i}`];
        totalHGAmount[`houseGroup${i}`] = queryData[`houseGroup${i}`] * houseCount;
      } else {
        totalHGAmount[`houseGroup${i}`] = pToWA[`houseGroup${i}`] * houseCount;
      }
    }
    queryData.totalAmount = Object.keys(pToWA).reduce((total, key) => {
      if (key.startsWith("houseGroup")) {
        total += totalHGAmount[key];
      }
      return total
    }, 0 );
  } else {
    queryData.totalAmount = (pToWA?.totalAmount || 0) 
      + request.totalAmount - (request.oldPlanningProductSize?.totalAmount || 0);
  }
  queryData.totalPurchaseAmount = queryData.totalAmount *
    ((purchase?.purchasePriceEURNetto ?? 0) *
      (1 - (purchase?.productDiscount1 ?? 0) / 100));

  try {
    await cds.run(
      UPDATE.entity(ProductsToWritingAppointments)
        .set(queryData)
        .where({ 
          writingAppointment_ID: request.writingAppointment_ID,
          product_ID: productID
        })
    );
  } catch (error) {
    console.log("Error updating product distribution:", error);
  }
}  

export const checkSizeKeyAndManuallyEdited = async (
  request: any
): Promise<boolean> => {
  const { 
    ProductSizes,
    ProductSizesToWritingAppointments,
    ProductsToWritingAppointments 
  } = cds.entities(
    "com.valantic.preorder.product",
  );

  const hgChange = Object.keys(request).filter((key) => 
    key.startsWith("houseGroup") || key.startsWith("totalAmount"));
  if (hgChange.length > 0) {
    const pToWA = await cds.run(
      SELECT.one
        .from(ProductsToWritingAppointments)
        .where({ 
          writingAppointment_ID: request.writingAppointment_ID,
          product_ID: request.product_ID,
          sizeKey: null
        }),
    );

    if (pToWA) {
      const psIds = (await cds.run(
        SELECT.from(ProductSizes)
        .where({ product_ID: request.product_ID, }),
      ))?.map((ps: any) => ps.ID) ?? [];

      const psToWA = await cds.run(
        SELECT.one
          .from(ProductSizesToWritingAppointments)
          .where({ 
            writingAppointment_ID: request.writingAppointment_ID,
            productSize_ID: { in: psIds },
            isManuallyEdited: true
          }),
      );
      if (psToWA) return true;
    }
  }
  return false;
}

export const updateManuallyEditedFlag = async (
  request: any
) => {
  const { SELECT, UPDATE } = cds.ql;
  const { ProductSizes, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );

  const psIds = (await cds.run(
    SELECT.from(ProductSizes)
    .where({ product_ID: request.product_ID, }),
  ))?.map((ps: any) => ps.ID) ?? [];

  const result = await cds.run(
    UPDATE.entity(ProductSizesToWritingAppointments)
      .set({ isManuallyEdited: false })
      .where({ 
        writingAppointment_ID: request.writingAppointment_ID,
        productSize_ID: { in: psIds }
      })
  )
}

export const updatePsToWAWithChangedPlanningFields = async (
  requestData: any
) => {
  const { ProductSizes, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );
  const changedFields = getChangedPlanningFields(
    requestData,
    requestData.oldPlanningProduct,
  );
  if (changedFields.size === 0) return;

  const psIds = (await cds.run(
    SELECT.from(ProductSizes)
    .where({ product_ID: requestData.product_ID, }),
  ))?.map((ps: any) => ps.ID) ?? [];

  const psToWA = (await cds.run(
    SELECT.from(ProductSizesToWritingAppointments).where({
      writingAppointment_ID: requestData.writingAppointment_ID,
      productSize_ID: { in: psIds },
    })
  ));

  for (const ps of psToWA) {
    const updatedFields = mapChangedPlanningFields(ps, changedFields);
    if (Object.keys(updatedFields).length === 0) continue;
    await cds.run(
      UPDATE.entity(ProductSizesToWritingAppointments)
        .where({ 
          writingAppointment_ID: requestData.writingAppointment_ID,
          productSize_ID: ps.productSize_ID
        })
        .set(updatedFields)
    );
  }
}

export const getBudgetTotalAmount = async (planningID: string) => {
  const { SELECT } = cds.ql;
  const { TB_SAC_BUDGET } = cds.entities("");

  const budgetTotalAmount = await cds.run(
    SELECT.from(TB_SAC_BUDGET)
      .where({
        WRAP: planningID,
        ACCOUNT: { in: ["5100", "5200", "5300", "5400"] },
        HG: { "=": "#" },
      })
      .columns("HG as houseGroup", "SUM(AMOUNT) as totalAmount")
      .groupBy("HG"),
  );

  if (budgetTotalAmount.length > 0) {
    return budgetTotalAmount[0].totalAmount;
  } else {
    return 0;
  }
};

export const deleteProductSizesForPlanningProduct = async (
  planning_ID: string,
  product_ID: string
) => {
  const { DELETE } = cds.ql;
  const { ProductSizesToWritingAppointments, ProductSizes } = cds.entities(
    "com.valantic.preorder.product",
  );
  const productSizes = await cds.run(
    SELECT.from(ProductSizes).where({ product_ID: product_ID }),
  );
  await cds.run(
    DELETE.from(ProductSizesToWritingAppointments).where({
      writingAppointment_ID: planning_ID,
      productSize_ID: { in: productSizes.map((ps: any) => ps.ID) },
    }),
  );
}

export const getWritingAppointmentBudget = async (planningID: string) => {
  const { SELECT } = cds.ql;
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );
  const { TB_SAC_BUDGET, TB_SAC_HGR } = cds.entities("");

  const planning = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planningID }),
  );

  // Get house group raster from TB_SAC_BUDGET
  const houseGroupRasterResult = await cds.run(
    SELECT.one
      .from(TB_SAC_BUDGET)
      .where({
        WRAP: planningID,
        HGR: { "!=": "#" },
      })
      .columns("HGR as houseGroupRaster"),
  );
  console.log("houseGroupRasterResult", houseGroupRasterResult);

  const houseGroupRaster = houseGroupRasterResult?.houseGroupRaster;
  if (!houseGroupRaster) {
    return [];
  }

  // Get house counts from TB_SAC_HGR
  const houseCountsResult = await cds.run(
    SELECT.from(TB_SAC_HGR)
      .where({
        /*GPOPT-1377 Remove brand filter which causes not found errors in case of changing brands in writing appointments
        MARKE: planning.brand_ID,
        */
        HAUSGRUPPENRASTER: houseGroupRaster,
        HAUSGRUPPE: { "!=": "#" },
      })
      .columns(
        "cast(HAUSGRUPPE as Integer) as houseGroup",
        "count(distinct FILIALE) as houseCount",
      )
      .groupBy("HAUSGRUPPE"),
  );
  if (!houseCountsResult || houseCountsResult.length === 0) {
    return [];
  }
  const houseCountsMap = new Map(
    houseCountsResult.map((item: any) => [item.houseGroup, item.houseCount]),
  );

  // Get budget data
  const budgetResult = await cds.run(
    SELECT.from(TB_SAC_BUDGET)
      .where({
        WRAP: planningID,
        ACCOUNT: { in: ["5100", "5200", "5300", "5400"] },
        HG: { "!=": "#" },
        HGR: { "!=": "#" },
      })
      .columns(
        "cast(HG as Integer) as houseGroup",
        "sum(AMOUNT) as plannedPurchaseLimit",
      )
      .groupBy("HG"),
  );
  if (!budgetResult || budgetResult.length === 0) {
    return [];
  }

  // Combine the results
  const result = budgetResult.map((item: any) => ({
    houseGroup: item.houseGroup,
    houseCount: houseCountsMap.get(item.houseGroup) || 0,
    plannedPurchaseLimit: item.plannedPurchaseLimit,
  }));

  return result;
};

export const updatePlanningProductStatusToCheck = async (
  planning_ID: string,
) => {
  const { UPDATE } = cds.ql;
  const { ProductsToWritingAppointments, Products } = cds.entities(
    "com.valantic.preorder.product",
  );

  const products = await cds.run(
    SELECT.from(ProductsToWritingAppointments).where({
      writingAppointment_ID: planning_ID,
    }),
  );

  await cds.run(
    UPDATE.entity(Products)
      .set({
        status_ID: "ToCheck",
      })
      .where({
        ID: { in: products.map((p: any) => p.product_ID) },
        status: "InProgress",
      }),
  );
};

const filterFailedStatus = ["InProgress", "ToCheck", "CreationFailed"];
const filterSuccessStatus = [
  "InProgress",
  "ToCheck",
  "CreationFailed",
  "PartiallyCreatedInSAP",
];

const fromArticle = (ID: string): IUpdateChain[] => {
  const { Articles, Products, ProductSizes } = cds.entities(
    "com.valantic.preorder.product",
  );
  return [
    {
      entity: Articles,
      whereCondition: { ID: ID, status_ID: { in: filterFailedStatus } },
    },
    {
      entity: Products,
      whereCondition: { article_ID: ID, status_ID: { in: filterFailedStatus } },
    },
    {
      entity: ProductSizes,
      whereCondition: { article_ID: ID, status_ID: { in: filterFailedStatus } },
    },
  ];
};

const fromProduct = (ID: string): IUpdateChain[] => {
  const { Products, ProductSizes } = cds.entities(
    "com.valantic.preorder.product",
  );
  return [
    {
      entity: Products,
      whereCondition: { ID: ID, status_ID: { in: filterFailedStatus } },
    },
    {
      entity: ProductSizes,
      whereCondition: { product_ID: ID, status_ID: { in: filterFailedStatus } },
    },
  ];
};

const fromProductSize = (ID: string): IUpdateChain[] => {
  const { ProductSizes } = cds.entities("com.valantic.preorder.product");
  return [
    {
      entity: ProductSizes,
      whereCondition: { ID: ID, status_ID: { in: filterFailedStatus } },
    },
  ];
};

const levelUpdateMap: any = {
  [UpdateLevel.Article]: fromArticle,
  [UpdateLevel.Product]: fromProduct,
  [UpdateLevel.Variant]: fromProductSize,
};

export const updateByLevel = async (
  ID: string,
  level: string,
  setParameters: Record<string, any>,
) => {
  setImmediate(async () => {
    const db = await cds.connect.to("db");
    const tx = db.tx();
    try {
      const sLevel = level as UpdateLevel;
      const getChain = levelUpdateMap[sLevel];
      const aChain = getChain(ID);
      for (const { entity, whereCondition } of aChain) {
        await updateEntity(tx, entity, whereCondition, setParameters);
      }
      await tx.commit();
      console.log("Status updated to CreationFailed");
    } catch (error) {
      await tx.rollback();
      console.error("Failed to update status:", error);
    }
  });
};

const updateEntity = async (
  tx: any,
  entityName: any,
  whereCondition: any,
  setParameters: any,
): Promise<void> => {
  const { UPDATE } = cds.ql;
  try {
    const result = await tx.run(
      UPDATE.entity(entityName).where(whereCondition).set(setParameters),
    );
    console.log("Row affected:", result);
  } catch (error) {
    console.log(error);
  }
};

export const adjustProductParentStatus = async (
  currentID: string,
  currentEntity: any,
  parentKey: string,
  parentEntity: any,
  onComplete?: () => Promise<void>,
) => {
  setImmediate(async () => {
    const db = await cds.connect.to("db");
    const tx = db.tx();
    try {
      const childDetail = await tx.run(
        SELECT.one
          .from(currentEntity)
          .where({ ID: currentID })
          .columns("ID", parentKey, "status_ID"),
      );
      const siblingStatus = await checkSiblingStatus(
        tx,
        currentEntity,
        parentKey,
        childDetail[parentKey],
        currentID,
      );
      let newStatus: string;
      !siblingStatus
        ? (newStatus = "PartiallyCreatedInSAP")
        : (newStatus = "CreatedInSAP");

      await updateEntity(
        tx,
        parentEntity,
        { ID: childDetail[parentKey], status_ID: { in: filterSuccessStatus } },
        { status_ID: newStatus },
      );
      await tx.commit();

      onComplete?.();
    } catch (error) {
      await tx.rollback();
    }
  });
};

export const adjustVariantParentStatus = async (
  currentID: string,
  currentEntity: any,
  parentKey: string,
  parentEntity: any,
  level: string,
  setParameters: Record<string, any>,
) => {
  setImmediate(async () => {
    const { Articles, Products } = cds.entities(
      "com.valantic.preorder.product",
    );
    const db = await cds.connect.to("db");
    const tx = db.tx();
    try {
      const childDetail = await tx.run(
        SELECT.one
          .from(currentEntity)
          .where({ ID: currentID })
          .columns("ID", parentKey, "status_ID"),
      );
      const siblingStatus = await checkSiblingStatus(
        tx,
        currentEntity,
        parentKey,
        childDetail[parentKey],
        currentID,
      );
      let newStatus: string;
      !siblingStatus
        ? (newStatus = "PartiallyCreatedInSAP")
        : (newStatus = "CreatedInSAP");

      await updateEntity(
        tx,
        parentEntity,
        { ID: childDetail[parentKey], status_ID: { in: filterSuccessStatus } },
        { status_ID: newStatus },
      );
      await tx.commit();

      adjustProductParentStatus(
        childDetail[parentKey],
        Products,
        "article_ID",
        Articles,
        () => updateByLevel(currentID, level, setParameters),
      );
    } catch (error) {
      await tx.rollback();
    }
  });
};

const checkSiblingStatus = async (
  tx: any,
  currentEntity: any,
  parentKey: any,
  parentValue: any,
  excludedId: string,
): Promise<boolean> => {
  const result = await tx.run(
    SELECT.from(currentEntity)
      .where({ [parentKey]: parentValue })
      .columns("ID", "status_ID"),
  );
  return result
    .filter((item: any) => item.ID !== excludedId)
    .every((item: any) => item.status_ID === "CreatedInSAP");
};

export const checkSupplyTypeForProduct = async (
  planning_ID: string,
  product_ID: string,
  level: "article" | "option" | "variant",
) => {
  const { SELECT } = cds.ql;
  const { Products, Articles, ProductSizes } = cds.entities(
    "com.valantic.preorder.product",
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );

  const writingAppointment = await cds.run(
    SELECT.one
      .from(WritingAppointments)
      .where({ ID: planning_ID })
      .columns("allocationMode_ID", "name"),
  );
  const product =
    level === "article"
      ? await cds.run(
          SELECT.one
            .from(Articles)
            .where({ ID: product_ID })
            .columns("supplyType_SUPPLY_TYPE", "supplierProductNumber", "ID"),
        )
      : level === "option"
        ? await cds.run(
            SELECT.one
              .from(Products)
              .where({ ID: product_ID })
              .columns("supplyType_SUPPLY_TYPE", "supplierProductNumber", "ID"),
          )
        : level === "variant"
          ? await cds.run(
              SELECT.one
                .from(ProductSizes)
                .where({ ID: product_ID })
                .columns(
                  "supplyType_SUPPLY_TYPE",
                  "supplierProductNumberVariant as supplierProductNumber",
                  "ID",
                ),
            )
          : null;

  const allocationMode = writingAppointment?.allocationMode_ID;
  const supplyType = product?.supplyType_SUPPLY_TYPE;
  if (supplyType == "WH_A") {
    return {
      code: `${level.toUpperCase()}_SUPPLY_TYPE_WH_A_NOT_ALLOWED_ERROR`,
      args: [
        product?.supplierProductNumber ?? product_ID,
        writingAppointment?.name ?? planning_ID,
      ],
    };
  }

  if (
    (allocationMode === "AutomaticAllocation" ||
      allocationMode === "PlanningWithSimulation") &&
    supplyType === "CD1_M"
  ) {
    return {
      code: `${level.toUpperCase()}_SUPPLY_TYPE_CD1_M_NOT_ALLOWED_ERROR`,
      args: [
        product?.supplierProductNumber ?? product_ID,
        writingAppointment?.name ?? planning_ID,
      ],
    };
  }

  if (allocationMode === "ManualAllocation" && supplyType === "WH_M") {
    return {
      code: `${level.toUpperCase()}_SUPPLY_TYPE_WH_M_NOT_ALLOWED_ERROR`,
      args: [
        product?.supplierProductNumber ?? product_ID,
        writingAppointment?.name ?? planning_ID,
      ],
    };
  }
};

export const getPrefilledPlanningProductFields = async (
  ID: string,
  level: "article" | "option" | "variant",
) => {
  const { SELECT } = cds.ql;
  const productFields = [
    "supplyType_SUPPLY_TYPE",
    "purchaseOrderText",
    "consumerTopic_ID",
    "supplier_ID",
    "brand_ID",
    "productionPlant_PRODUCTIONPLANT",
  ];
  // const supplierConsumerTopicBrandFields = ["productionPlant_PRODUCTIONPLANT"];
  const product =
    level === "article"
      ? await cds.run(
          SELECT.one.from(Articles).where({ ID: ID }).columns(productFields),
        )
      : level === "option"
        ? await cds.run(
            SELECT.one.from(Products).where({ ID: ID }).columns(productFields),
          )
        : level === "variant"
          ? await cds.run(
              SELECT.one
                .from(ProductSizes)
                .where({ ID: ID })
                .columns(productFields),
            )
          : null;
  // const supplierConsumerTopicBrandData = await cds.run(
  //   SELECT.one
  //     .from(SupplierConsumerTopicBrands)
  //     .where({
  //       consumerTopic_ID: product?.consumerTopic_ID,
  //       supplier_ID: product?.supplier_ID,
  //       brand_ID: product?.brand_ID,
  //     })
  //     .columns(supplierConsumerTopicBrandFields),
  // );

  const supplierData = product?.supplier_ID
    ? await cds.run(
        SELECT.one
          .from("LFA1")
          .where({ ID: product.supplier_ID })
          .columns(["TRANSPORT_CHAIN", "INCO1", "COUNTRY"]),
      )
    : null;
  
  console.log("supplierData", supplierData);

  return {
    incoTerm_ID: supplierData?.INCO1,
    transportChain_TC_ID: supplierData?.TRANSPORT_CHAIN,
    countryOfProduction: supplierData?.COUNTRY,
    productionPlant_PRODUCTIONPLANT:
      // supplierConsumerTopicBrandData?.productionPlant_PRODUCTIONPLANT,
      product?.productionPlant_PRODUCTIONPLANT,
    supplyType_SUPPLY_TYPE: product?.supplyType_SUPPLY_TYPE,
    purchaseOrderText: product?.purchaseOrderText,
  };
};
