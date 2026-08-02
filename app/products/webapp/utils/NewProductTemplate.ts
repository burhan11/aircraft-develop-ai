export const getNewProductTemplate = () => {
  return {
    // GENERAL
    ID: null, // The backend will generate the UUID on creation
    name: "",
    description: "",

    // BASIC (Associations are represented by their foreign key with an _ID suffix)
    supplier_ID: null,
    consumerTopic_ID: null,
    brand_ID: null,
    topicComponent_ID: null,
    assortmentModule_ID: null,
    productGroup_ID: null,
    targetGroup_ID: null,
    module_CODE: null,
    baseUnitOfMeasure_ID: null,

    // IDENTIFICATION
    supplierProductNumber: "",
    supplierProductNumberVariant: "",
    productText: "",
    supplierProductName: "",
    receiptText: "",
    supplierColor: "",
    evaluationColor_ID: null,
    sizeSystem_ID: null,
    size1_CODE: null,
    size2_CODE: null,
    sizeRun_ID: null,
    GTIN: "",
    supplyType_SUPPLY_TYPE: null,
    seasonType_ID: null,
    seasonYear: "",
    presentationtType_CODE: null,
    availableFrom: null,
    availableUntil: null,
    endOfLifeCycle: null,

    // PURCHASE (Composition of many -> empty array)
    //to_Purchase: [],

    // RETAIL (Composition of many -> empty array)
    //to_Sales: [],

    // CLASSIFICATION
    sapNumber: "",
    //lotNumber: "",
    pricatCatalog_ID: null,
    productType_ID: null,
    ownershipStatus_ID: null,
    gridBox_ID: null,
    omnichannel_CODE: null,

    // OTHER
    shippingInstruction_ID: null,
    material1_ID: null,
    portion1: null,
    material2_ID: null,
    portion2: null,
    material3_ID: null,
    portion3: null,
    material4_ID: null,
    portion4: null,
    material5_ID: null,
    portion5: null,
    shippingPort_ID: null,
    transportChain_TC_ID: null,
    productionPlant_PRODUCTIONPLANT: null,
    storageLocation_LGORT: null,
    differingIncoTerm_ID: null,

    // LABELS
    mainLabel_ID: null,
    subLabel_ID: null,
    sizeLabel_ID: null,
    sizeCode_ID: null,
    hangTag_ID: null,
    stringWithSeal_ID: null,
    priceSticker_ID: null,
    careLabel_ID: null,
    addHangTag_ID: null,
    specialOffer: "",

    // NEW TO BE CHECKED
    houseGroup_ID: null,
    costOfGoodsCalculation: "",
    lotCreation: null,
    priceLevel_ID: undefined,
    onlineSalesFrom: null,
    series_ID: null,
    license_CODE: null,
    program_ID: null,
    occasion_CODE: null,
    property_CODE: null,
    quality_CODE: null,
    pattern_ID: null,
    specialProduct_ID: null,
    surfaceWashing: "",
    mainForm: "",
    stockingThickness: "",
    basicDataText: "",
    purchaseOrderText: "",
    merchandiseSecurityMethod_ID: null,
    priceLabelMethod_ID: null,
    hangerMethod_ID: null,
    /* GPOPT-1195 
    dispositionFeature: "",
    */
    loadingGroup_ID: null,
    sustainabilitySealOfApproval_GSNR: null,
    washing: "",
    bleaching: "",
    ironing: "",
    cleaning: "",
    drying: "",
    differentUnitOfMeasureAvailable: null,
    differentUnitOfMeasure1: "",
    differentUnitOfMeasureOut1: "",
    differentUnitOfMeasure2: "",
    differentUnitOfMeasureOut2: "",
    differentUnitOfMeasure3: "",
    differentUnitOfMeasureOut3: "",
    differentUnitOfMeasure4: "",
    differentUnitOfMeasureOut4: "",
    onlineOrderStep: "",
    minimumOrderQuantity: null,
    maximumOrderQuantity: null,
    comment: "",
    countryOfProduction: "",
    /* GPOPT-1324
    supplierProductGroup: "",
    */

    // Other compositions
    writingAppointment: null,
    to_Size: [],
  };
};
