using {com.valantic.preorder.consumertopicbrand} from '../../db/consumertopicbrand/schema';
using {com.valantic.preorder.common} from '../../db/common/supplier';
using {com.valantic.preorder.common.product} from '../../db/common/product';
using {com.valantic.preorder.common.helper.topic} from '../../db/common/helper/topic';
using {com.valantic.preorder.common.helper.logistic} from '../../db/common/helper/logistic';
using {com.valantic.preorder.common.helper.classification} from '../../db/common/helper/classification';
using {com.valantic.preorder.common.helper.method} from '../../db/common/helper/method';
using {com.valantic.preorder.accessControl} from '../../db/access-control-data/schema';
using {com.valantic.preorder.product as productmasterdata} from '../../db/product/schema';
using {com.valantic.preorder.writingAppointments} from '../../db/writing-appointment/schema';
using {com.valantic.preorder.planning as planning} from '../../db/pre-order-volume-planning/schema';
using {
    WRF_PSCD_TCHAINH,
    MATHIER_HIERNODE5_KT,
    WRF_BRANDS,
    WRF_CHARVAL,
    ZSTTA_GROE_SYS,
    ZSTTA_MUSTER_T,
    ZSTTA_SONDERARTT,
    ZBMTA0081_SERIE,
    ZSTTA_ZIELGR_T,
    T023T,
    T6WFGT,
    PRICAT_K001,
    MARA,
    ZSTTA_SUP_TYPE,
    T001L,
    T001W,
    ZSTTA_NH_GS_T,
    MATHIER_HIERNODE6_TBS,
    MATHIER_HIERNODE7_SBS,

} from '../../db/synced/sap-ecc-schema';

using {
    TB_SAC_HGR,
    TB_SAC_SIZE_PLAN,
    TB_SAC_BUDGET,
} from '../../db/synced/sac-schema';

service DevelopmentService {
    entity TB_SAC_HGRS                   as projection on TB_SAC_HGR;
    entity ShippingInstructions          as projection on logistic.ShippingInstructions;
    entity LoadingGroups                 as projection on logistic.LoadingGroups;
    entity OwnershipStatus               as projection on logistic.OwnershipStatus;
    entity GoodsDistributions            as projection on logistic.GoodsDistributions;
    entity Brands                        as projection on classification.Brands;

    entity ConsumerTopics                as projection on MATHIER_HIERNODE5_KT
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    entity TopicComponents               as projection on topic.TopicComponents;
    entity NineGridBoxes                 as projection on classification.NineGridBoxes;
    entity TargetGroups                  as projection on classification.TargetGroups;
    entity Suppliers                     as projection on common.Suppliers;
    entity OrderOptions                  as projection on consumertopicbrand.OrderOptions;
    entity PricatCatalogs                as projection on classification.PricatCatalogs;
    entity ProductTypes                  as projection on classification.ProductTypes;
    entity SupplyTypes                   as projection on classification.SupplyTypes;
    entity VKHMs                         as projection on method.VKHMs;
    entity Programs                      as projection on product.Programs;
    entity ProductGroups                 as projection on product.ProductGroups;
    entity AssortmentModules             as projection on classification.AssortmentModules;
    entity VATs                          as projection on classification.VATs;
    entity Groups                        as projection on accessControl.Groups;
    entity GroupsConsumerTopics          as projection on accessControl.GroupsConsumerTopics;
    entity Modules                       as projection on classification.Modules;
    entity EvaluationColors              as projection on product.EvaluationColors;
    entity SizeSystems                   as projection on product.SizeSystems;
    entity Sizes                         as projection on product.Sizes;
    entity SeasonTypes                   as projection on classification.SeasonTypes;
    entity PresentationTypes             as projection on product.PresentationTypes;
    entity Currencies                    as projection on logistic.Currencies;
    entity UVPTypes                      as projection on classification.UVPTypes;
    entity Materials                     as projection on product.Materials;
    entity ShippingPorts                 as projection on logistic.ShippingPorts;
    entity TransportChains               as projection on WRF_PSCD_TCHAINH;
    entity ProductionPlants              as projection on logistic.ProductionPlants;
    entity IncoTerms                     as projection on logistic.IncoTerms;
    entity Series                        as projection on classification.Series;
    entity Licenses                      as projection on classification.Licenses;
    entity Occasions                     as projection on classification.Occasions;
    entity AttachmentMethods             as projection on method.AttachmentMethods;
    entity SustainabilitySealOfApprovals as projection on ZSTTA_NH_GS_T;
    entity ProductsToWritingAppointments as projection on productmasterdata.ProductsToWritingAppointments;
    entity WritingAppointments           as projection on writingAppointments.WritingAppointments;
    entity ProductStatus                 as projection on productmasterdata.ProductStatus;
    entity PlanningStatus                as projection on writingAppointments.PlanningStatus;
    entity SupplierConsumerTopicBrands   as projection on consumertopicbrand.SupplierConsumerTopicBrands;
    entity SAPOrderItems                 as projection on writingAppointments.SAPOrderItems;
    entity ProductSizes                  as projection on productmasterdata.ProductSizes;

    entity TB_SAC_SIZE_PLANS             as projection on TB_SAC_SIZE_PLAN;
    entity TB_SAC_BUDGETS                as projection on TB_SAC_BUDGET;
    entity T001Ls                        as projection on T001L;
    entity T001Ws                        as projection on T001W;
    entity ZSTTA_SUP_TYPES               as projection on ZSTTA_SUP_TYPE;
    entity T161s                         as projection on writingAppointments.T161;
    entity CreationStatus                as projection on product.CreationStatus;
    entity MARAs                         as projection on MARA;
    entity BaseUnitOfMeasures            as projection on productmasterdata.BaseUnitOfMeasures;
    entity PriceLevels                   as projection on classification.PriceLevels;
    

    @cds.redirection.target
    entity PRICAT_K001s                  as projection on PRICAT_K001;

    @readonly
    entity TBSs                          as projection on MATHIER_HIERNODE6_TBS
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    @readonly
    entity SBSs                          as projection on MATHIER_HIERNODE7_SBS
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    action   createSAPProduct(DeepID: String, to_Products: array of ProductECC);
    action   createSAPOrder(DeepID: String, to_Orders: array of OrdersECC);

    function deleteImageUrl(key: String) returns String;
}

type PurchaseECC {
    ProductID             : String;
    ID                    : String;
    vat                   : String;
    currency              : String;
    purchasePriceEURNetto : Decimal;
}

type SalesECC {
    ProductID    : String;
    ID           : String;
    uvpPrice     : Decimal;
    currentPrice : Decimal;
    uvpType      : String;
}

type ProductECC {
    ParentID                        : String;
    ID                              : String;
    name                            : String;
    status                          : String;
    supplier                        : String;
    consumerTopic                   : String;
    brand                           : String;
    topicComponent                  : String;
    assortmentModule                : String;
    productGroup                    : String;
    targetGroup                     : String;
    module                          : String;
    supplierProductNumber           : String;
    supplierProductNumberVariant    : String;
    productText                     : String;
    supplierProductName             : String;
    receiptText                     : String;
    supplierColor                   : String;
    evaluationColor                 : String;
    sizeSystem                      : String;
    size1                           : String;
    size2                           : String;
    sizeRun                         : String;
    GTIN                            : String;
    supplyType                      : String;
    seasonType                      : String;
    seasonYear                      : String;
    presentationType                : String;
    sapNumber                       : String;
    lotNumber                       : String;
    pricatCatalog                   : String;
    productType                     : String;
    depotform                       : String;
    ownershipStatus                 : String;
    gridBox                         : String;
    omnichannel                     : String;
    shippingInstruction             : String;
    shippingPort                    : String;
    productionPlant                 : String;
    differingIncoTerm               : String;
    mainLabel                       : String;
    subLabel                        : String;
    sizeLabel                       : String;
    sizeCode                        : String;
    hangTag                         : String;
    stringWithSeal                  : String;
    priceSticker                    : String;
    careLabel                       : String;
    addHangTag                      : String;
    houseGroup                      : String;
    costOfGoodsCalculation          : String;
    priceLevel                      : String;
    onlineSalesFrom                 : String;
    series                          : String;
    license                         : String;
    program                         : String;
    occasion                        : String;
    property                        : String;
    quality                         : String;
    pattern                         : String;
    specialProduct                  : String;
    surfaceWashing                  : String;
    mainForm                        : String;
    stockingThickness               : String;
    basicDataText                   : String;
    purchaseOrderText               : String;
    merchandiseSecurityMethod       : String;
    priceLabelMethod                : String;
    hangerMethod                    : String;
    dispositionFeature              : String;
    loadingGroup                    : String;
    sustainabilitySealOfApproval    : String;
    sustainabilityCertifier         : String;
    sustainabilityMaterial          : String;
    sustainabilityPortion           : String;
    washing                         : String;
    bleaching                       : String;
    ironing                         : String;
    cleaning                        : String;
    drying                          : String;
    differentUnitOfMeasureAvailable : String;
    differentUnitOfMeasure1         : String;
    differentUnitOfMeasureOut1      : String;
    differentUnitOfMeasure2         : String;
    differentUnitOfMeasureOut2      : String;
    differentUnitOfMeasure3         : String;
    differentUnitOfMeasureOut3      : String;
    differentUnitOfMeasure4         : String;
    differentUnitOfMeasureOut4      : String;
    onlineOrderStep                 : String;
    minimumOrderQuantity            : Integer;
    maximumOrderQuantity            : Integer;
    comment                         : String;
    /* GPOPT-1324
    supplierProductGroup            : String;
    */
    imageUrl                        : String;
    To_Purchase                     : array of PurchaseECC;
    To_Sales                        : array of SalesECC;
}

type PositionsECC {
    OrderID               : UUID;
    ID                    : UUID;
    orderNumber           : String(35);
    plant                 : String(4);
    ownershipRelationship : String(2);
    orderTextInfo         : String;
    sapArticleNumber      : String(18);
    ltVz                  : String(4);
    ltBranch              : String(4);
    storageLocation       : String(4);
    orderQuantity         : String;
    splitRelevance        : String(1);
}

type AdditionalDataECC {
    OrderID          : UUID;
    ID               : UUID;
    documentType     : String(4);
    itemCategory     : String(4);
    incotermsPart1   : String(3);
    incotermsPart2   : String(28);
    processIndicator : String(1);
    aktnr            : String(10);
}

type OrdersECC {
    DeepOrderID            : UUID;
    ID                     : UUID;
    orderNumber            : String(35);
    splitNumber            : String(4);
    plant                  : String(4);
    salesOrganization      : String(4);
    distributionChannel    : String(2);
    division               : String(2);
    dpcumentType           : String(4);
    supplier               : String(10);
    kt                     : String(10);
    ownershipRelationship  : String(2);
    productionPlant        : String(4);
    orderApprovalReason    : String;
    orderTextInfo          : String;
    externalOrderNumber    : String(35);
    externalOrderPosition  : String(6);
    to_AdditionalData      : AdditionalDataECC;
    to_Positions           : array of PositionsECC;
}
