import cds from "@sap/cds";
const getFiscalDates = () => {
  const now = new Date();
  const months: string[] = [];

  for (let i = 0; i < 18; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    months.push(`${year}${month}`);
  }
  return months;
};

export const getPlanningBudgets = async (
  consumerTopic_ID: string,
  brand_ID: string,
) => {
  const { SELECT } = cds.ql;
  const { TB_SAC_BUDGET } = cds.entities("");
  const fiscalDates = getFiscalDates();
  const budgets = await cds.run(
    SELECT.from(TB_SAC_BUDGET)
      .where({
        DATE: { in: fiscalDates },
        BRAND: brand_ID,
        KT: consumerTopic_ID,
        ACCOUNT: {
          in: [
            "1000",
            "2000",
            "2100",
            "2200",
            "2300",
            "5100",
            "5000",
            "5200",
            "5300",
            "5400",
          ],
        },
      })
      .columns("ACCOUNT", "DATE", "sum(AMOUNT) as AMOUNT")
      .groupBy("ACCOUNT", "DATE"),
  );

  const planningBudgets = await getWritingAppointmentBudgets(
    consumerTopic_ID,
    brand_ID,
  );
  return [...budgets, ...planningBudgets];
};

export const buildBudgetKTTree = (planningBudgets: any[]) => {
  const accountMap = new Map();
  const fiscalDates = getFiscalDates(); // YYYYMM strings, ordered 0..17
  const monthsWithYear: { month: string; year: string }[] = fiscalDates.map(
    (date) => ({
      month: date.substring(4), // MM
      year: date.substring(0, 4), // YYYY
    }),
  );

  // Required accounts that must always be present
  const requiredAccounts = [
    "1000",
    "2000",
    "2100",
    "2200",
    "2300",
    "4000",
    "5100",
    "5000",
    "5200",
    "5300",
    "5400",
    "8000",
    "9000",
  ];

  // Initialize required accounts
  requiredAccounts.forEach((account) => {
    const isRootAccount = account.endsWith("000");
    accountMap.set(account, {
      account,
      isRoot: isRootAccount,
      children: [],
      total: 0,
    });
    // Pre-fill all fiscal periods with 0, keyed by YYYYMM
    fiscalDates.forEach((date) => {
      accountMap.get(account)[date] = 0;
    });
  });

  // Collect amounts keyed by YYYYMM — no collision between years
  planningBudgets.forEach((item: any) => {
    const fiscalDate = item.DATE; // YYYYMM

    if (!fiscalDates.includes(fiscalDate)) return; // outside window

    if (!accountMap.has(item.ACCOUNT)) {
      const isRootAccount = item.ACCOUNT.endsWith("000");
      accountMap.set(item.ACCOUNT, {
        account: item.ACCOUNT,
        isRoot: isRootAccount,
        children: [],
        total: 0,
      });
      fiscalDates.forEach((date) => {
        accountMap.get(item.ACCOUNT)[date] = 0;
      });
    }

    const accountData = accountMap.get(item.ACCOUNT);
    accountData[fiscalDate] = item.AMOUNT;
    accountData.total += item.AMOUNT;
  });

  // Calculate account 8000: 1000 - 2000 - 4000
  const account1000 = accountMap.get("1000");
  const account2000 = accountMap.get("2000");
  const account4000 = accountMap.get("4000");
  const account8000 = accountMap.get("8000");

  if (account1000 && account2000 && account4000 && account8000) {
    fiscalDates.forEach((date) => {
      account8000[date] =
        (account1000[date] || 0) -
        (account2000[date] || 0) -
        (account4000[date] || 0);
    });
    account8000.total =
      (account1000.total || 0) -
      (account2000.total || 0) -
      (account4000.total || 0);
  }

  // Convert YYYYMM keys to positional m0..m17 keys and strip internal fields
  const toPositional = (accountData: any) => {
    const result: any = {
      account: accountData.account,
      total: accountData.total,
      children: accountData.children,
    };
    fiscalDates.forEach((date, index) => {
      result[`m${index}`] = accountData[date] ?? 0;
    });
    return result;
  };

  const rootAccounts: any[] = [];

  accountMap.forEach((accountData, account) => {
    if (accountData.isRoot) {
      // Add child accounts
      accountMap.forEach((childData, childAccount) => {
        if (!childData.isRoot && childAccount.startsWith(account.charAt(0))) {
          accountData.children.push(toPositional(childData));
        }
      });
      rootAccounts.push(toPositional(accountData));
    }
  });

  // Define custom order for root accounts
  const accountOrder = ["1000", "5000", "2000", "4000", "8000", "9000"];
  rootAccounts.sort((a, b) => {
    return accountOrder.indexOf(a.account) - accountOrder.indexOf(b.account);
  });

  const childAccountOrder: { [key: string]: string[] } = {
    "2000": ["2200", "2100", "2300"],
    "5000": ["5100", "5200", "5300", "5400"],
  };

  rootAccounts.forEach((account) => {
    if (account.children && account.children.length > 0) {
      const customOrder = childAccountOrder[account.account];
      if (customOrder) {
        account.children.sort((a: any, b: any) => {
          const indexA = customOrder.indexOf(a.account);
          const indexB = customOrder.indexOf(b.account);
          return indexA - indexB;
        });
      } else {
        // Default to alphabetical sorting
        account.children.sort((a: any, b: any) =>
          a.account.localeCompare(b.account),
        );
      }
    }
  });

  return {
    monthsWithYear: monthsWithYear.sort((a, b) => {
      const dateA = `${a.year}${a.month}`;
      const dateB = `${b.year}${b.month}`;
      return dateA.localeCompare(dateB);
    }),
    accounts: rootAccounts,
  };
};

export const getWritingAppointmentBudgets = async (
  consumerTopic_ID: string,
  brand_ID: string,
) => {
  const { ProductSizesToWritingAppointments } = cds.entities(
    "com.valantic.preorder.product",
  );

  const fiscalDates = getFiscalDates();

  // Build SQL date range conditions for fiscal year
  const startDate = `${fiscalDates[0].substring(0, 4)}-${fiscalDates[0].substring(4)}-01`;
  const endYear = fiscalDates[fiscalDates.length - 1].substring(0, 4);
  const endMonth = fiscalDates[fiscalDates.length - 1].substring(4);
  const endDate = `${endYear}-${endMonth}-30`;

  const result = await SELECT.from(ProductSizesToWritingAppointments)
    .columns(
      `year(deliveryDateVZ) as year`,
      `month(deliveryDateVZ) as month`,
      `sum(cast(coalesce(totalPurchaseAmount, 0) as Decimal)) as PURCHASE_AMOUNT`,
      `sum(cast(coalesce(totalAmount, 0) as Decimal)) as PRODUCT_AMOUNT`,
    )
    .where({
      "writingAppointment.status_ID": "InProgress",
      "writingAppointment.consumerTopic_ID": consumerTopic_ID,
      "writingAppointment.brand_ID": brand_ID,
      deliveryDateVZ: { between: startDate, and: endDate },
    })
    .groupBy(`year(deliveryDateVZ)`, `month(deliveryDateVZ)`);
  const formattedResult: any[] = [];

  result.forEach((item: any) => {
    const date = `${item.year}${item.month.toString().padStart(2, "0")}`;

    // Only include dates within fiscal year range
    if (fiscalDates.includes(date)) {
      // Add entry for account 4000 (Purchase Amount)
      formattedResult.push({
        ACCOUNT: "4000",
        BRAND: brand_ID,
        KT: consumerTopic_ID,
        DATE: date,
        AMOUNT: item.PURCHASE_AMOUNT,
      });

      // Add entry for account 9000 (Product Amount)
      formattedResult.push({
        ACCOUNT: "9000",
        BRAND: brand_ID,
        KT: consumerTopic_ID,
        DATE: date,
        AMOUNT: item.PRODUCT_AMOUNT,
      });
    }
  });
  return formattedResult;
};
