import cds from "@sap/cds";
import {
  getBudgetHG,
  getCurrentSalesComposition,
  getWritingAppointmentBudget,
} from "./db-functions";
export const defaultPlanningGeneration = async (planning_ID: string) => {
  const { ProductsToWritingAppointments, Products } = cds.entities(
    "com.valantic.preorder.product"
  );
  const { WritingAppointments } = cds.entities(
    "com.valantic.preorder.writingAppointments"
  );
  const { TB_SAC_SIZE_PLAN } = cds.entities("");

  // 1. Validate planning exists
  const planning = await cds.run(
    SELECT.one.from(WritingAppointments).where({ ID: planning_ID })
  );
  if (!planning) {
    return "PLANNING_NOT_FOUND";
  }

  // 2. Get all products in this planning
  const planningProducts = await cds.run(
    SELECT.from(ProductsToWritingAppointments)
      .where({ writingAppointment_ID: planning_ID })
      .columns("product_ID", "writingAppointment_ID")
  );
  if (!planningProducts || planningProducts.length === 0) {
    return "NO_PRODUCTS_IN_PLANNING";
  }

  // 3. Get budget data per house group
  const budgetLimits = await getWritingAppointmentBudget(planning_ID);
  if (!budgetLimits || budgetLimits.length === 0) {
    return "NO_BUDGET_DATA_FOUND";
  }

  // Create budget map: HG -> {budget, houseCount, usedBudget}
  const budgetMap = new Map(
    budgetLimits.map((b: any) => [
      b.houseGroup,
      {
        totalBudget: b.plannedPurchaseLimit || 0,
        houseCount: b.houseCount || 0,
        usedBudget: 0,
        targetBudget: (b.plannedPurchaseLimit || 0) * 0.99, // 99% target per HG
        productCount: 0, // Track how many products use this HG
      },
    ])
  );

  // 4. First pass: collect product information
  const productInfos = [];

  for (const planningProduct of planningProducts) {
    const product = await cds.run(
      SELECT.one.from(Products).where({ ID: planningProduct.product_ID })
    );
    if (!product) continue;

    const { purchase } = await getCurrentSalesComposition(product.ID);
    const discountFactor = (100 - (purchase?.productDiscount1 ?? 0)) / 100;
    const purchasePrice = (purchase?.purchasePrice ?? 0) * discountFactor;
    if (purchasePrice === 0) continue;

    // Get size distribution
    const sizeDistribution = await cds.run(
      SELECT.from(TB_SAC_SIZE_PLAN).where({
        KT: product.consumerTopic_ID,
        BRAND: product.brand_ID,
        TBS: product.topicComponent_ID,
      })
    );
    console.log("Size Distribution for product", product.ID, sizeDistribution);

    const uniqueSizes = new Set();
    for (const dist of sizeDistribution) {
      if (dist.SIZE) uniqueSizes.add(dist.SIZE);
    }
    const minQuantityPerHG = Math.max(1, uniqueSizes.size);

    // Determine target house groups
    const productHouseGroup = product.houseGroup_ID
      ? parseInt(product.houseGroup_ID)
      : null;
    const maxHG =
      productHouseGroup && productHouseGroup >= 1 && productHouseGroup <= 15
        ? productHouseGroup
        : 15;

    // Count products per HG to calculate fair budget distribution
    for (let hg = 1; hg <= maxHG; hg++) {
      const budgetData = budgetMap.get(hg) as any;
      if (budgetData && budgetData.totalBudget > 0) {
        budgetData.productCount++;
      }
    }

    productInfos.push({
      planningProduct,
      product,
      purchasePrice,
      minQuantityPerHG,
      maxHG,
    });
  }

  if (productInfos.length === 0) {
    return "NO_PRODUCTS_IN_PLANNING";
  }

  // Calculate weight distribution (exponential decay for priority)
  const weights = [];
  let totalWeight = 0;
  for (let i = 0; i < productInfos.length; i++) {
    const weight = Math.exp(-i * 0.3);
    weights.push(weight);
    totalWeight += weight;
  }

  // 5. Process each product with per-HG budget allocation based on product count
  for (
    let productIndex = 0;
    productIndex < productInfos.length;
    productIndex++
  ) {
    const info = productInfos[productIndex];
    const productPriority = weights[productIndex] / totalWeight;

    // Collect target HGs for this product
    const targetHGs = [];

    for (let hg = 1; hg <= info.maxHG; hg++) {
      const budgetData = budgetMap.get(hg) as any;
      if (
        budgetData &&
        budgetData.totalBudget > 0 &&
        budgetData.houseCount > 0
      ) {
        const remainingBudget = budgetData.targetBudget - budgetData.usedBudget;

        if (remainingBudget > 0 && budgetData.productCount > 0) {
          // Calculate fair share: remaining budget / number of products that still need to use this HG
          const productsRemaining =
            budgetData.productCount -
            (productIndex >= budgetData.productCount ? 0 : 1);
          const fairShareBudget =
            remainingBudget /
            Math.max(1, budgetData.productCount - productIndex);

          targetHGs.push({
            hg,
            totalBudget: budgetData.totalBudget,
            targetBudget: budgetData.targetBudget,
            houseCount: budgetData.houseCount,
            remainingBudget,
            fairShareBudget,
            usedBudget: budgetData.usedBudget,
            productCount: budgetData.productCount,
          });
        }
      }
    }

    if (targetHGs.length === 0) continue;

    const updateData: any = {
      writingAppointment_ID: planning_ID,
      product_ID: info.planningProduct.product_ID,
    };
    let totalQuantity = 0;

    // Distribute quantities based on fair share per HG
    for (const hgData of targetHGs) {
      // Each product gets its fair share, boosted by priority
      const budgetForThisProduct =
        hgData.fairShareBudget * (1 + productPriority);

      // Calculate budget per house
      const budgetPerHouse = budgetForThisProduct / hgData.houseCount;

      // Calculate quantity per house
      let quantityPerHouse = Math.floor(budgetPerHouse / info.purchasePrice);

      // Ensure minimum for size distribution
      quantityPerHouse = Math.max(info.minQuantityPerHG, quantityPerHouse);

      // Calculate actual cost
      const totalProductsForHG = quantityPerHouse * hgData.houseCount;
      const actualCost = totalProductsForHG * info.purchasePrice;

      // Check if we exceed the HG budget
      const budgetData = budgetMap.get(hgData.hg) as any;
      if (budgetData) {
        const newUsedBudget = budgetData.usedBudget + actualCost;

        // If we would exceed target budget, reduce quantity
        if (newUsedBudget > budgetData.targetBudget) {
          const maxAffordable = budgetData.targetBudget - budgetData.usedBudget;
          const maxProductsTotal = Math.floor(
            maxAffordable / info.purchasePrice
          );
          quantityPerHouse = Math.max(
            info.minQuantityPerHG,
            Math.floor(maxProductsTotal / hgData.houseCount)
          );

          const adjustedCost =
            quantityPerHouse * hgData.houseCount * info.purchasePrice;

          // Only add if we can afford at least the minimum
          if (budgetData.usedBudget + adjustedCost <= budgetData.targetBudget) {
            budgetData.usedBudget += adjustedCost;
            updateData[`houseGroup${hgData.hg}`] = quantityPerHouse;
            totalQuantity += quantityPerHouse * hgData.houseCount;
          } else {
            updateData[`houseGroup${hgData.hg}`] = 0;
          }
        } else {
          // We're within budget
          budgetData.usedBudget += actualCost;
          updateData[`houseGroup${hgData.hg}`] = quantityPerHouse;
          totalQuantity += quantityPerHouse * hgData.houseCount;
        }
      }
    }

    // Set unused HGs to 0
    for (let i = 1; i <= 15; i++) {
      if (!updateData[`houseGroup${i}`]) {
        updateData[`houseGroup${i}`] = 0;
      }
    }

    updateData.totalAmount = totalQuantity;
    const { purchase } = await getCurrentSalesComposition(
      info.planningProduct.product_ID
    );

    updateData.totalPurchaseAmount =
      totalQuantity *
      ((purchase?.purchasePrice ?? 0) *
        (1 - (purchase?.productDiscount1 ?? 0) / 100));

    // Update database
    await cds.run(
      UPDATE(ProductsToWritingAppointments)
        .where({
          writingAppointment_ID: planning_ID,
          product_ID: info.planningProduct.product_ID,
        })
        .set(updateData)
    );
  }

  // 6. Calculate final utilization per HG
  const hgUtilization: any = {};
  let totalUsedBudget = 0;
  let totalAvailableBudget = 0;

  budgetMap.forEach((data: any, hg) => {
    const utilization = ((data.usedBudget / data.totalBudget) * 100).toFixed(2);
    hgUtilization[`HG${hg}`] =
      `${utilization}% (${data.productCount} products)`;
    totalUsedBudget += data.usedBudget;
    totalAvailableBudget += data.totalBudget;
  });

  // 7. Update overall planning purchase volume
  const budgetResult = await getBudgetHG(planning_ID);
  if (typeof budgetResult !== "string") {
    await cds.run(
      UPDATE.entity(WritingAppointments)
        .where({ ID: planning_ID })
        .set({ purchaseVolume: budgetResult?.overallBudget?.overallCosts })
    );
  }
};
