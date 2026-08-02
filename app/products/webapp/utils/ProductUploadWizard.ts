
export const setupUploadTablePersonalization = (i18nModel: any) => {
    return [
        {
            key: "image_col",
            label: i18nModel!.getResourceBundle().getText("wizard.step2.col.image"),
            path: "image",
        },
        {
            key: "supplierProductNumber_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.supplierProductNumber"),
            path: "supplierProductNumber",
        },
        {
            key: "supplierProductName_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.supplierProductName"),
            path: "supplierProductName",
        },
        {
            key: "supplierColor_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.supplierColor"),
            path: "supplierColor",
        },
        // {
        //   key: "productGroup_col",
        //   label: i18nModel!
        //     .getResourceBundle()
        //     .getText("wizard.step2.col.productGroup"),
        //   path: "productGroup",
        // },
        {
            key: "sizeRun_col",
            label: i18nModel!.getResourceBundle().getText("wizard.step2.col.sizeRun"),
            path: "sizeRun"
        },
        {
            key: "currency_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.currency"),
            path: "currency",
        },
        {
            key: "purchasePrice_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.purchasePrice"),
            path: "purchasePrice",
        },
        {
            key: "retailPrice_col",
            label: i18nModel!.getResourceBundle().getText("wizard.step2.col.uvp"),
            path: "retailPrice",
        },
        {
            key: "availableFrom_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.availableFrom"),
            path: "availableFrom",
        },
        {
            key: "availableUntil_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.availableUntil"),
            path: "endOfLife",
        },
        {
            key: "endOfLife_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.endOfLife"),
            path: "endOfLife",
        },
        {
            key: "presentationType_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.presentationType"),
            path: "presentationType",
        },
        {
            key: "gtin_col",
            label: i18nModel!.getResourceBundle().getText("wizard.step2.col.gtin"),
            path: "gtin",
        },
        {
            key: "material1_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material1Code"),
            path: "material1",
        },
        {
            key: "material1Portion_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material1Portion"),
            path: "material1Portion",
        },
        {
            key: "material2_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material2Code"),
            path: "material2",
        },
        {
            key: "material2Portion_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material2Portion"),
            path: "material2Portion",
        },
        {
            key: "material3_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material3Code"),
            path: "material3",
        },
        {
            key: "material3Portion_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material3Portion"),
            path: "material3Portion",
        },
        {
            key: "material4_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material4Code"),
            path: "material4",
        },
        {
            key: "material4Portion_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material4Portion"),
            path: "material4Portion",
        },
        {
            key: "material5_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material5Code"),
            path: "material5",
        },
        {
            key: "material5Portion_col",
            label: i18nModel!
                .getResourceBundle()
                .getText("wizard.step2.col.material5Portion"),
            path: "material5Portion",
        },
    ];
}