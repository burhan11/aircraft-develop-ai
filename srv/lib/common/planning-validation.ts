import cds from "@sap/cds";
import { getBudgetHG, getCurrentSalesComposition } from "./db-functions";

const checkSAPProductNumber = async (writingAppointment_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments, ProductSizes } = cds.entities(
    "com.valantic.preorder.product"
  );

  const productIDs = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({
        writingAppointment_ID: writingAppointment_ID,
      })
      .columns("product_ID")
  );
  const result = await cds.run(
    SELECT.one(ProductSizes)
      .where({
        product_ID: { in: productIDs.map((p: any) => p.product_ID) },
        sapNumber: null,
      })
      .columns("product.supplierProductNumber")
  );

  return result?.product_supplierProductNumber ?? result?.product_ID;
};

const checkProductStatus = async (writingAppointment_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );

  const result = (
    await cds.run(
      SELECT.from(ProductsToWritingAppointments)
        .where({
          writingAppointment_ID: writingAppointment_ID,
        })
        .columns(["product.supplierProductNumber", "product.status_ID"])
    )
  ).find((el: any) => el.product_status_ID !== "CreatedInSAP");

  return result?.product_supplierProductNumber ?? result?.product_ID;
};

const checkMinimumOrderQuantities = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );

  const result = await cds.run(
    SELECT.one.from(ProductsToWritingAppointments)
      .where`writingAppointment_ID = ${planning_ID}
      AND (
        totalAmount < 1 OR
        totalAmount = null
      )`.columns(["product_ID", "totalAmount", "product.supplierProductNumber"])
  );
  return result?.product_supplierProductNumber ?? result?.product_ID;
};

const checkPrices = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );

  const result = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );
  for (const product of result) {
    const { sales, purchase } = await getCurrentSalesComposition(
      product.product_ID
    );
    if (!purchase?.purchasePriceEURNetto) {
      return {
        errorProduct: product?.product?.product_supplierProductNumber ?? product.product_ID,
        errorProdutSize: undefined
      };
    }
  }

  const resultPs = await cds.run(
    SELECT.from(ProductSizesToWritingAppointments)
      .where({ 
        writingAppointment_ID: planning_ID,
        isValidSizeCurve: true
       })
      .columns((psTW: any) => {
        psTW("*");
        psTW.productSize((ps: any) => {
          ps("*");
        });
      })
  );
  for (const productSize of resultPs) {
    const { sales, purchase } = await getCurrentSalesComposition(
      undefined,
      productSize.productSize_ID
    );
    if (!purchase?.purchasePriceEURNetto) {
      return {
        errorProduct: undefined,
        errorProdutSize: productSize?.productSize?.productSize_size_1_CODE ?? productSize.productSize_ID
      };
    }
  }
};

const checkSizeKeyAvailable = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const pP = await cds.run(
    SELECT.one
      .from(ProductsToWritingAppointments)
      .where({ sizeKey: null, writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );
  if (pP) {
    return { errorProduct: pP.product.supplierProductNumber ?? pP.product_ID };
  }
};

const checkSizesAvailable = async (planning_ID: string, variantLevel: boolean = false) => {
  const { SELECT } = cds.ql;
  const { TB_SAC_SIZE_PLAN } = cds.entities("");
  const { ProductsToWritingAppointments, ProductSizes, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments"
  );

  const productsToWritingAppointments = await cds.run(
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

  const writingAppointment = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID })
  );
  const allocationMode = writingAppointment?.allocationMode_ID === "AutomaticAllocation";
  for (const productToWritingAppointment of productsToWritingAppointments) {
    const productDetails = productToWritingAppointment.product;
    const differingHouseGroups = productToWritingAppointment.differingHouseGroups.map(
      (dHG: any) => parseInt(dHG.houseGroup_ID)
    );
    const productSizes = await cds.run(
      SELECT.from(ProductSizes)
        .where({
          product_ID: productToWritingAppointment.product_ID,
        })
        .columns(["ID", "size_1_CODE", "size_2_CODE"])
    );
    if (!allocationMode) {
      for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
        const currentHGAmount =
          productToWritingAppointment[`houseGroup${hgIndex}`] || 0;
        const sizeKey = productToWritingAppointment.differingSizeKey && differingHouseGroups.includes(hgIndex)
          ? productToWritingAppointment.differingSizeKey
          : productToWritingAppointment.sizeKey;
        if (currentHGAmount <= 0) continue;
        const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
          .where`KT = ${productDetails.consumerTopic_ID} AND
          BRAND = ${productDetails.brand_ID} AND
          SIZE_KEY = ${sizeKey} AND
          cast(LOTSIZE as Integer) <= ${currentHGAmount}`.columns(
          "MAX(LOTSIZE) as LOTSIZE"
        );
        const sizeDistributions = await cds.run(
          SELECT.from(TB_SAC_SIZE_PLAN)
            .where({
              KT: productDetails.consumerTopic_ID,
              BRAND: productDetails.brand_ID,
              SIZE_KEY: sizeKey,
              LOTSIZE: lotSize?.LOTSIZE || 0,
            })
            .columns(["SIZE", "AMOUNT"])
        );
        for (const sizeDist of sizeDistributions) {
          if (sizeDist.AMOUNT <= 0) continue;
          const productSizeAvailable = productSizes.find((ps: any) =>
            ps.size_1_CODE && ps.size_2_CODE
              ? ps.size_1_CODE + "-" + ps.size_2_CODE === sizeDist.SIZE
              : ps.size_1_CODE === sizeDist.SIZE
          );
          if (!productSizeAvailable) {
            return {
              errorProduct:
                productToWritingAppointment.product.supplierProductNumber ??
                productToWritingAppointment.product_ID,
              errorSize: sizeDist.SIZE,
              errorProductSize: undefined,
            };
          } else if (productSizeAvailable && variantLevel) {
            const psToWA = await cds.run(
              SELECT.from(ProductSizesToWritingAppointments)
                .where({ writingAppointment_ID: planning_ID,
                  productSize_ID: productSizeAvailable.ID })
            );
            if (psToWA.length === 0 ) {
              return {
                errorProduct: 
                  productToWritingAppointment.product.supplierProductNumber ??
                  productToWritingAppointment.product_ID,
                errorSize: sizeDist.SIZE,
                errorProductSize: productSizeAvailable.size_1_CODE  ?? productSizeAvailable.ID,
              };
            }
          }
        }
      }
    } else {
      const currentHGAmount = productToWritingAppointment.totalAmount || 0;
      const sizeKey = productToWritingAppointment.sizeKey;
      if (currentHGAmount <= 0) continue;
      const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
        .where`KT = ${productDetails.consumerTopic_ID} AND
        BRAND = ${productDetails.brand_ID} AND
        SIZE_KEY = ${sizeKey} AND
        cast(LOTSIZE as Integer) <= ${currentHGAmount}`.columns(
        "MAX(LOTSIZE) as LOTSIZE"
      );
      const sizeDistributions = await cds.run(
        SELECT.from(TB_SAC_SIZE_PLAN)
          .where({
            KT: productDetails.consumerTopic_ID,
            BRAND: productDetails.brand_ID,
            SIZE_KEY: sizeKey,
            LOTSIZE: lotSize?.LOTSIZE || 0,
          })
          .columns(["SIZE"])
      );
      for (const sizeDist of sizeDistributions) {
        const productSizeAvailable = productSizes.find((ps: any) =>
          ps.size_1_CODE && ps.size_2_CODE
            ? ps.size_1_CODE + "-" + ps.size_2_CODE === sizeDist.SIZE
            : ps.size_1_CODE === sizeDist.SIZE
        );
        if (!productSizeAvailable) {
          return {
            errorProduct:
              productToWritingAppointment.product.supplierProductNumber ??
              productToWritingAppointment.product_ID,
            errorSize: sizeDist.SIZE,
            errorProductSize: undefined,
          };
        } else if (productSizeAvailable && variantLevel) {
          const psToWA = await cds.run(
            SELECT.from(ProductSizesToWritingAppointments)
              .where({ writingAppointment_ID: planning_ID,
                productSize_ID: productSizeAvailable.ID })
          );
          if (psToWA.length === 0) {
            return {
              errorProduct: 
                productToWritingAppointment.product.supplierProductNumber ??
                productToWritingAppointment.product_ID,
              errorSize: sizeDist.SIZE,
              errorProductSize: productSizeAvailable.size_1_CODE  ?? productSizeAvailable.ID,
            };
          }
        }
      }
    }
  }
};

const checkLotSizeDistribution = async (planning_ID: string) => {
  const { TB_SAC_SIZE_PLAN } = cds.entities("");
  const { ProductsToWritingAppointments, ProductSizes, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments",
  );

  const productsToWritingAppointments = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );
  const currentPlanning = await cds.run(
    SELECT.one
      .from(WritingAppointments)
      .where({ ID: planning_ID }),
  );
  const totQuantPlanning = currentPlanning.allocationMode_ID === "AutomaticAllocation";
  for (const productToWritingAppointment of productsToWritingAppointments) {
    const productDetails = productToWritingAppointment.product;
    const psIds = (await cds.run(
      SELECT.from(ProductSizes)
        .where({ product_ID: productToWritingAppointment.product_ID })
        .columns("ID")
    )).map((ps: any) =>  ps.ID);
    const psToWA = await cds.run(
      SELECT.one.from(ProductSizesToWritingAppointments)
        .where({ writingAppointment_ID: planning_ID, 
          productSize_ID: { in: psIds },
          isValidSizeCurve: true,
          isManuallyEdited: true
        })
    );
    if (psToWA) continue; 
    if (!totQuantPlanning) {
      for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
        const currentHGAmount =
          productToWritingAppointment[`houseGroup${hgIndex}`] || 0;
        if (currentHGAmount <= 0) continue;
        const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
          .where`KT = ${productDetails.consumerTopic_ID} AND
          BRAND = ${productDetails.brand_ID} AND
          SIZE_KEY = ${productToWritingAppointment.sizeKey} AND
          cast(LOTSIZE as Integer) <= ${currentHGAmount}`.columns(
          "MAX(LOTSIZE) as LOTSIZE"
        );
        if (!lotSize?.LOTSIZE) {
          return {
            errorLotSize: currentHGAmount,
            errorProduct:
              productToWritingAppointment.product.supplierProductNumber ??
              productToWritingAppointment.product_ID,
          };
        }
      }
    } else {
      const currentAmount = productToWritingAppointment.totalAmount || 0;
      if (currentAmount <= 0) continue;
      const lotSize = await SELECT.one.from(TB_SAC_SIZE_PLAN)
        .where`KT = ${productDetails.consumerTopic_ID} AND
        BRAND = ${productDetails.brand_ID} AND
        SIZE_KEY = ${productToWritingAppointment.sizeKey} AND
        cast(LOTSIZE as Integer) <= ${currentAmount}`.columns(
        "MAX(LOTSIZE) as LOTSIZE"
      );
      if (!lotSize?.LOTSIZE) {
        return {
          errorLotSize: currentAmount,
          errorProduct:
            productToWritingAppointment.product.supplierProductNumber ??
            productToWritingAppointment.product_ID,
        };
      }
    }
  }
};

const checkEligibleProductsForPSDistribution = async (planning_ID: string) => {
  const { 
    ProductsToWritingAppointments, 
    ProductSizesToWritingAppointments, 
    ProductSizes 
  } = cds.entities("com.valantic.preorder.product");

  const planningProducts = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID})
      .columns((pTWA: any) => {
        pTWA("*");
        pTWA.product((p: any) => {
          p("*");
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

  const pPsbyId = planningProductSizes.reduce((map: any, pPs: any) => {
    map[pPs.productSize_ID] = pPs;
    return map;
  }, {} );

  const psbyId = productSizes.reduce((map: any, ps: any) => {
    if (!map[ps.product_ID]) map[ps.product_ID] = []; 
    map[ps.product_ID].push(ps);
    return map;
  }, {} );

  const nonEligibleProduct = planningProducts.filter((pp: any) => {
    if (pp.sizeKey) return false
    const sizes = psbyId[pp.product_ID] || [];
    const hasManuallyEdits = sizes.some((s: any) => 
      pPsbyId[s.ID]?.isManuallyEdited === true 
    );
    return !hasManuallyEdits;
  }); 

  if (nonEligibleProduct.length > 0) {
    return {
      errorProduct: 
        nonEligibleProduct[0].product.supplierProductNumber ?? 
        nonEligibleProduct[0].product_ID
    };
  }
}

const checkBudget = async (planning_ID: string) => {
  const budgetHGResult = await getBudgetHG(planning_ID);
  if (budgetHGResult === "NO_HOUSE_GROUP_DATA_FOUND") return;
  for (const hgBudget of budgetHGResult?.houseGroupBudgets || []) {
    if (hgBudget?.remainingBudget && hgBudget?.remainingBudget < 0) {
      return hgBudget?.houseGroup;
    }
  }
};

const checkHG = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const productToWAs = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );
  for (const productToWA of productToWAs) {
    let largestIndex = 0;
    let missingIndex;
    const largestValidIndex = Number(productToWA.product.houseGroup_ID);
    for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
      const hgField = `houseGroup${hgIndex}`;
      const quantity = productToWA[hgField];
      if ((quantity > 0 && hgIndex > largestIndex)) {
        largestIndex = hgIndex;
      }
      if ((!quantity || quantity === 0) && hgIndex <= largestValidIndex) {
        missingIndex = hgIndex;
      }
    }
    if (isNaN(largestValidIndex)) {
      return {
        errorMessage:"HG_MISSING_ERROR",
        errorProduct:
          productToWA.product.supplierProductNumber ?? productToWA.product_ID,
        largestIndex: largestIndex,
        validIndex: undefined,
      };
    }
    if (largestIndex > largestValidIndex) {
      return {
        errorMessage:"HG_EXCEEDS_ALLOWED_VALUE_ERROR",
        errorProduct:
          productToWA.product.supplierProductNumber ?? productToWA.product_ID,
        largestIndex: largestIndex,
        validIndex: largestValidIndex,
      };
    }
    if (missingIndex) {
      return {
        errorMessage:"HG_MISSING_AMOUNT_ERROR",
        errorProduct:
          productToWA.product.supplierProductNumber ?? productToWA.product_ID,
        largestIndex: missingIndex,
        validIndex: largestValidIndex,
      };
    }
  }
};

const checkPsHG = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const productSizeToWAs = await cds.run(
    SELECT.from(ProductSizesToWritingAppointments)
      .where({ 
        writingAppointment_ID: planning_ID,
        isValidSizeCurve: true,
       })
      .columns((psTW: any) => {
        psTW("*");
        psTW.productSize((ps: any) => {
          ps("*");
        });
      })
  );
  for (const productSizeToWA of productSizeToWAs) {
    let largestIndex = 0;
    let missingIndex;
    const largestValidIndex = Number(productSizeToWA.productSize.houseGroup_ID);
    for (let hgIndex = 1; hgIndex <= 15; hgIndex++) {
      const hgField = `houseGroup${hgIndex}`;
      const quantity = productSizeToWA[hgField];
      if ((quantity > 0 && hgIndex > largestIndex)) {
        largestIndex = hgIndex;
      }
      if ((!quantity || quantity === 0) && hgIndex <= largestValidIndex) {
        missingIndex = hgIndex;
      }
    }
    if (isNaN(largestValidIndex)) {
      return {
        errorMessage:"HG_MISSING_VARIANT_ERROR",
        errorProductSize:
          productSizeToWA.productSize.size_1_CODE ?? productSizeToWA.productSize_ID,
        largestIndex: largestIndex,
        validIndex: undefined,
      };
    }
    if (largestIndex > largestValidIndex) {
      return {
        errorMessage:"HG_EXCEEDS_ALLOWED_VALUE_VARIANT_ERROR",
        errorProductSize:
          productSizeToWA.productSize.size_1_CODE ?? productSizeToWA.productSize_ID,
        largestIndex: largestIndex,
        validIndex: largestValidIndex,
      };
    }
    if (missingIndex) {
      return {
        errorMessage:"HG_MISSING_AMOUNT_VARIANT_ERROR",
        errorProductSize:
          productSizeToWA.productSize.size_1_CODE ?? productSizeToWA.productSize_ID,
        largestIndex: missingIndex,
        validIndex: largestValidIndex,
      };
    }
  }
};

export async function checkProductMasterData(planning_ID: string) {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const productToWAs = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );
  for (const productToWA of productToWAs) {
    const productDetails = productToWA.product;
    if (
      !productDetails.consumerTopic_ID ||
      !productDetails.topicComponent_ID ||
      !productDetails.brand_ID
    ) {
      return (
        productToWA.product.supplierProductNumber ?? productToWA.product_ID
      );
    }
  }
}
export async function checkBudgetOfConsumerTopicBrand(planning_ID: string) {
  const { SELECT } = cds.ql;
  const { TB_SAC_BUDGET } = cds.entities("");
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments"
  );

  const wA = await cds.run(
    SELECT.one.from(WritingAppointments).where({
      ID: planning_ID,
    })
  );

  const plannedWAs = await cds.run(
    SELECT.from(WritingAppointments).where({
      status_ID: { in: ["InProgress", "ToCheck", "CreationFailed"] },
      consumerTopic_ID: wA.consumerTopic_ID,
      brand_ID: wA.brand_ID,
    })
  );

  const productsToWAs = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );

  const plannedProductsToWAs = await cds.run(
    SELECT.from(ProductsToWritingAppointments).where({
      writingAppointment_ID: plannedWAs.map((wa: any) => wa.ID),
    })
  );

  for (const productToWA of productsToWAs) {
    const month = new Date(productToWA.deliveryDateVZ).getMonth() + 1;
    const year = new Date(productToWA.deliveryDateVZ).getFullYear();
    const dateString = `${year}${month.toString().padStart(2, "0")}`;

    //1000 account for budget
    const budget =
      (
        await cds.run(
          SELECT.one
            .from(TB_SAC_BUDGET)
            .where({
              KT: wA.consumerTopic_ID,
              BRAND: wA.brand_ID,
              DATE: dateString,
              ACCOUNT: "1000",
            })
            .columns("sum(AMOUNT) as AMOUNT")
        )
      )?.AMOUNT || 0;
    //2100 for WE, 2200 for open orders
    const budgetUsed =
      (
        await cds.run(
          SELECT.one
            .from(TB_SAC_BUDGET)
            .where({
              KT: wA.consumerTopic_ID,
              BRAND: wA.brand_ID,
              DATE: dateString,
              ACCOUNT: { in: ["2100", "2200"] },
            })
            .columns("sum(AMOUNT) as AMOUNT")
        )
      )?.AMOUNT || 0;
    const totalPlannedAmount = plannedProductsToWAs
      .filter((pTW: any) => {
        const pDate = new Date(pTW.deliveryDateVZ);
        return pDate.getMonth() + 1 === month && pDate.getFullYear() === year;
      })
      .reduce(
        (sum: number, current: any) => sum + (current.totalPurchaseAmount || 0),
        0
      );
    if (budget - budgetUsed - totalPlannedAmount < 0) {
      return {
        errorProduct:
          productToWA?.product?.supplierProductNumber ?? productToWA.product_ID,
        errorMonth: month,
        errorYear: year,
      };
    }
  }
}

export async function checkDeliveryDates(planning_ID: string) {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments, ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const productToWAs = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns((pTW: any) => {
        pTW("*");
        pTW.product((p: any) => {
          p("*");
        });
      })
  );
  for (const productToWA of productToWAs) {
    const productDetails = productToWA.product;
    if (!productToWA.deliveryDateVZ || !productDetails?.availableUntil) {
      return {
        errorProduct:
          productDetails.supplierProductNumber ?? productToWA.product_ID,
        deliveryDateVZ: productToWA.deliveryDateVZ,
        availableUntil: productDetails.availableUntil,
        errorProductSize: undefined,
      };
    }
    const deliveryDate = new Date(productToWA.deliveryDateVZ);
    const availableUntil = new Date(productDetails.availableUntil);
    if (deliveryDate > availableUntil) {
      return {
        errorProduct:
          productDetails.supplierProductNumber ?? productToWA.product_ID,
        deliveryDateVZ: productToWA.deliveryDateVZ,
        availableUntil: productDetails.availableUntil,
        errorProductSize: undefined,
      };
    }
  }

  const productSizeToWAs = await cds.run(
    SELECT.from(ProductSizesToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID,
        isValidSizeCurve: true
       })
      .columns((psTW: any) => {
        psTW("*");
        psTW.productSize((ps: any) => {
          ps("*");
        });
      })
  );

  for (const productSizeToWA of productSizeToWAs) {
    const productSizeDetails = productSizeToWA.productSize;
    if (!productSizeToWA.deliveryDateVZ || !productSizeDetails?.availableUntil) {
      return {
        errorProduct: undefined,
        errorProductSize:
          productSizeDetails.size_1_CODE ?? productSizeToWA.productSize_ID,
        deliveryDateVZ: productSizeToWA.deliveryDateVZ,
        availableUntil: productSizeDetails.availableUntil,
      };
    }
    const deliveryDate = new Date(productSizeToWA.deliveryDateVZ);
    const availableUntil = new Date(productSizeDetails.availableUntil);
    if (deliveryDate > availableUntil) {
      return {
        errorProduct: undefined,
        errorProductSize:
          productSizeDetails.size_1_CODE ?? productSizeToWA.productSize_ID,
        deliveryDateVZ: productSizeToWA.deliveryDateVZ,
        availableUntil: productSizeDetails.availableUntil,
      };
    }
  }


}

const checkSupplyTypeRestrictions = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductsToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments"
  );

  const writingAppointment = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID })
  );
  const allocationMode = writingAppointment?.allocationMode_ID;

  if (
    allocationMode === "AutomaticAllocation" ||
    allocationMode === "PlanningWithSimulation"
  ) {
    const result = await cds.run(
      SELECT.one
        .from(ProductsToWritingAppointments)
        .where({
          writingAppointment_ID: planning_ID,
          supplyType_SUPPLY_TYPE: "CD1_M",
        })
        .columns(["product_ID", "product.supplierProductNumber"])
    );
    if (result) {
      return {
        code: "OPTION_SUPPLY_TYPE_CD1_M_NOT_ALLOWED_ERROR",
        args: [
          result.product_supplierProductNumber ?? result.product_ID,
          writingAppointment?.name ?? planning_ID,
        ],
      };
    }
  }

  if (allocationMode === "ManualAllocation") {
    const result = await cds.run(
      SELECT.one
        .from(ProductsToWritingAppointments)
        .where({
          writingAppointment_ID: planning_ID,
          supplyType_SUPPLY_TYPE: "WH_M",
        })
        .columns(["product_ID", "product.supplierProductNumber"])
    );
    if (result) {
      return {
        code: "OPTION_SUPPLY_TYPE_WH_M_NOT_ALLOWED_ERROR",
        args: [
          result.product_supplierProductNumber ?? result.product_ID,
          writingAppointment?.name ?? planning_ID,
        ],
      };
    }
  }
};

const checkPsSupplyTypeRestrictions = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments"
  );

  const writingAppointment = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID })
  );
  const allocationMode = writingAppointment?.allocationMode_ID;

  if (
    allocationMode === "AutomaticAllocation" ||
    allocationMode === "PlanningWithSimulation"
  ) {
    const result = await cds.run(
      SELECT.one
        .from(ProductSizesToWritingAppointments)
        .where({
          writingAppointment_ID: planning_ID,
          supplyType_SUPPLY_TYPE: "CD1_M",
          isValidSizeCurve: true,
        })
        .columns(["productSize_ID", "productSize.size_1_CODE", "productSize.size_2_CODE",])
    );
    if (result) {
      return {
        code: "VARIANT_SUPPLY_TYPE_CD1_M_NOT_ALLOWED_ERROR",
        args: [
          result.productSize_size_1_CODE ?? result.productSize_ID,
          writingAppointment?.name ?? planning_ID,
        ],
      };
    }
  }

  if (allocationMode === "ManualAllocation") {
    const result = await cds.run(
      SELECT.one
        .from(ProductSizesToWritingAppointments)
        .where({
          writingAppointment_ID: planning_ID,
          supplyType_SUPPLY_TYPE: "WH_M",
          isValidSizeCurve: true,
        })
        .columns(["productSize_ID", "productSize.size_1_CODE", "productSize.size_2_CODE",])
    );
    if (result) {
      return {
        code: "VARIANT_SUPPLY_TYPE_WH_M_NOT_ALLOWED_ERROR", 
        args: [
          result.productSize_size_1_CODE ?? result.productSize_ID,
          writingAppointment?.name ?? planning_ID,
        ],
      };
    }
  }
};

const checkMandatoryOrderFields = async (planning_ID: string) => {
  const { SELECT } = cds.ql;
  const { 
    ProductsToWritingAppointments, 
    Products, 
    ProductSizesToWritingAppointments, 
    ProductSizes 
  } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments"
  );
  const { SupplierConsumerTopicBrands } = cds.entities(
    "com.valantic.preorder.consumertopicbrand"
  );
  const pTWA = await cds.run(
    SELECT.from(ProductsToWritingAppointments).where({
      writingAppointment_ID: planning_ID,
    })
  );
  const psTWA = await cds.run(
    SELECT.from(ProductSizesToWritingAppointments).where({
      writingAppointment_ID: planning_ID,
      isValidSizeCurve: true,
    })
  );
  const writingAppointment = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID })
  );

  const supplierConsumerTopicBrand = await cds.run(
    SELECT.one.from(SupplierConsumerTopicBrands).where({
      consumerTopic_ID: writingAppointment?.consumerTopic_ID,
      brand_ID: writingAppointment?.brand_ID,
      supplier_ID: writingAppointment?.supplier_ID,
    })
  );

  for (const productToWA of pTWA) {
    const product = await cds.run(
      SELECT.one.from(Products).where({ ID: productToWA.product_ID })
    );
    if (!productToWA?.deliveryDateVZ) {
      return {
        errorId: product?.supplierProductNumber ?? productToWA?.product_ID,
        errorEntity: "PRODUCTSTOWRITINGAPPOINTMENT",
        errorField: "DELIVERYDATEVZ",
      };
    }
    if (!productToWA?.deliveryDateShop && productToWA?.supplyType_SUPPLY_TYPE !== "WH_M") {
      return {
        errorId: product?.supplierProductNumber ?? productToWA?.product_ID,
        errorEntity: "PRODUCTSTOWRITINGAPPOINTMENT",
        errorField: "DELIVERYDATESHOP",
      };
    }
  }
  const psId = psTWA.map((ps: any) => ps.productSize_ID);
  const productSizes = await cds.run(
    SELECT.from(ProductSizes).where({ ID: { in: psId } })
  );
  for (const productSizeToWA of psTWA) {
    const productSize = productSizes.find((ps: any) => ps.ID === productSizeToWA.productSize_ID);
    if (!productSizeToWA?.deliveryDateVZ) {
      return {
        errorId: productSize?.size_1_CODE ?? productSizeToWA?.productSize_ID,
        errorEntity: "PRODUCTSIZESTOWRITINGAPPOINTMENT",
        errorField: "DELIVERYDATEVZ",
      };
    }
    if (!productSizeToWA?.deliveryDateShop && productSizeToWA?.supplyType_SUPPLY_TYPE !== "WH_M") {
      return {
        errorId: productSize?.size_1_CODE ?? productSizeToWA?.productSize_ID,
        errorEntity: "PRODUCTSIZESTOWRITINGAPPOINTMENT",
        errorField: "DELIVERYDATESHOP",
      };
    }
  }
};

export const validateSizeDistribution = async (
  planning_ID: string,
  variantLevel: boolean = false
): Promise<{ code: string; args: any[] } | undefined> => {
  const productDetailsError = await checkProductMasterData(planning_ID);
  if (productDetailsError) {
    return {
      code: "MISSING_PRODUCT_DATA_ERROR",
      args: [productDetailsError],
    };
  }

  if (!variantLevel) {
    const sizeKeyError = await checkSizeKeyAvailable(planning_ID);
    if (sizeKeyError) {
      return {
        code: "MISSING_SIZE_KEY_ERROR",
        args: [sizeKeyError.errorProduct],
      };
    }
  } else {
    const nonEligibleProduct = await checkEligibleProductsForPSDistribution(planning_ID);
    if (nonEligibleProduct) {
      return {
        code: "PRODUCT_SIZEKEY_MISSING",
        args: [nonEligibleProduct.errorProduct],
      };
    }
  }

  const lotSizeError = await checkLotSizeDistribution(planning_ID);
  if (lotSizeError) {
    return {
      code: "NO_LOT_SIZE_FOUND_ERROR",
      args: [lotSizeError.errorProduct, lotSizeError.errorLotSize],
    };
  }

  const sizeDistributionError = await checkSizesAvailable(planning_ID, variantLevel);
  if (sizeDistributionError) {
    return {
      code: sizeDistributionError.errorProductSize
        ? "VARIANT_WA_MISSING_ERROR"
        : "SIZE_DISTRIBUTION_MISMATCH_ERROR",
      args: [
        sizeDistributionError.errorProduct,
        sizeDistributionError.errorSize,
        sizeDistributionError.errorProductSize ?? "",
      ],
    };
  }
};

export async function validatePlanning(
  planning_ID: string
): Promise<{ code: string; args: any[] } | undefined> {
  const { SELECT } = cds.ql;
  const { WritingAppointments } = cds.entities("com.valantic.preorder.writingAppointments");
  const quantityErrorProduct = await checkMinimumOrderQuantities(planning_ID);
  if (quantityErrorProduct) {
    return {
      code: "MINIMUM_ORDER_QUANTITY_NOT_MET",
      args: [quantityErrorProduct],
    };
  }
  const priceErrorProduct = await checkPrices(planning_ID);
  if (priceErrorProduct) {
    return {
      code: (priceErrorProduct.errorProduct) 
        ? "MISSING_PRODUCT_PRICE_ERROR" 
        : "MISSING_PRODUCT_PRICE_VARIANT_ERROR",
      args: [priceErrorProduct],
    };
  }
  const deliveryDateError = await checkDeliveryDates(planning_ID);
  if (deliveryDateError) {
    return {
      code: deliveryDateError.errorProduct
        ? "INVALID_DELIVERY_DATE_ERROR" 
        : "INVALID_DELIVERY_DATE_VARIANT_ERROR",
      args: [
        deliveryDateError.errorProduct 
          ? deliveryDateError.errorProduct
          : deliveryDateError.errorProductSize,
        deliveryDateError.deliveryDateVZ,
        deliveryDateError.availableUntil,
      ],
    };
  }

  const supplyTypeError = await checkSupplyTypeRestrictions(planning_ID);
  if (supplyTypeError) {
    return supplyTypeError;
  }

  const psSupplyTypeError = await checkPsSupplyTypeRestrictions(planning_ID);
  if (psSupplyTypeError) {
    return psSupplyTypeError;
  }

  const totalQuantityPlanning = (await cds.run(
    SELECT.one
      .from(WritingAppointments)
      .columns("allocationMode_ID as allocationMode")
      .where({ ID: planning_ID })
  ))?.allocationMode === "AutomaticAllocation";
  if (!totalQuantityPlanning) {
    const hgError = await checkHG(planning_ID);
    if (hgError) {
      return {
        code: hgError.errorMessage,
        args: [hgError.errorProduct, hgError.largestIndex, hgError.validIndex],
      };
    }
    const psHgError = await checkPsHG(planning_ID);
    if (psHgError) {
      return {
        code: psHgError.errorMessage,
        args: [psHgError.errorProductSize, psHgError.largestIndex, psHgError.validIndex],
      };
    }
  }
  /* GPOPT-1206
  const budgetErrorHG = await checkBudget(planning_ID);
  if (budgetErrorHG) {
    return {
      code: "MISSING_HG_BUDGET_ERROR",
      args: [budgetErrorHG],
    };
  }

  const budgetErrorConsumerTopicBrand =
    await checkBudgetOfConsumerTopicBrand(planning_ID);
  if (budgetErrorConsumerTopicBrand) {
    return {
      code: "MISSING_CONSUMER_TOPIC_BRAND_BUDGET_ERROR",
      args: [
        budgetErrorConsumerTopicBrand.errorProduct,
        budgetErrorConsumerTopicBrand.errorMonth,
        budgetErrorConsumerTopicBrand.errorYear,
      ],
    };
  }
  */
  const validateSizeDistributionResult =
    await validateSizeDistribution(planning_ID, true);
  if (validateSizeDistributionResult) {
    return validateSizeDistributionResult;
  }

  const mandatoryOrderFieldsError =
    await checkMandatoryOrderFields(planning_ID);
  if (mandatoryOrderFieldsError) {
    return {
      code: `${mandatoryOrderFieldsError.errorEntity}_${mandatoryOrderFieldsError.errorField}_MISSING`,
      args: [mandatoryOrderFieldsError.errorId],
    };
  }
  return;
}

export async function validatePlanningProducts(planning_ID: string) {
  const statusErrorProduct = await checkProductStatus(planning_ID);
  if (statusErrorProduct) {
    return {
      code: "PRODUCT_STATUS_NOT_CREATED_IN_SAP_ERROR",
      args: [statusErrorProduct],
    };
  }
  const sapProductNumberError = await checkSAPProductNumber(planning_ID);
  if (sapProductNumberError) {
    return {
      code: "MISSING_SAP_PRODUCT_NUMBER_ERROR",
      args: [sapProductNumberError],
    };
  }
}
