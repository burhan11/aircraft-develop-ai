using {com.valantic.preorder.consumertopicbrand} from '../../db/consumertopicbrand/schema';
using {com.valantic.preorder.common} from '../../db/common/supplier';
using {com.valantic.preorder.common.product} from '../../db/common/product';
using {com.valantic.preorder.common.helper.topic} from '../../db/common/helper/topic';
using {com.valantic.preorder.common.helper.logistic} from '../../db/common/helper/logistic';
using {com.valantic.preorder.common.helper.classification} from '../../db/common/helper/classification';
using {com.valantic.preorder.common.helper.method} from '../../db/common/helper/method';
using {
    LFA1,
    ZSTTA_ZIELGR_T,
    WRF_BRANDS,
    T023T,
    MATHIER_HIERNODE5_KT,
    MATHIER_HIERNODE6_TBS,
    MATHIER_HIERNODE7_SBS,
    T6WFGT,
    MARA,
    ZSTTA_SUP_TYPE,
    PRODUCTION_PLANT
} from '../../db/synced/sap-ecc-schema';

service ConsumerTopicBrandService {
    @odata.draft.enabled
    entity SupplierConsumerTopicBrands as projection on consumertopicbrand.SupplierConsumerTopicBrands;

    @readonly
    entity ShippingInstructions        as projection on logistic.ShippingInstructions;

    @readonly
    entity LoadingGroups               as projection on logistic.LoadingGroups;

    @readonly
    entity OwnershipStatus             as projection on logistic.OwnershipStatus;

    @readonly
    entity GoodsDistributions          as projection on logistic.GoodsDistributions;

    @readonly
    entity Brands                      as projection on WRF_BRANDS;

    @readonly
    entity ConsumerTopics              as projection on MATHIER_HIERNODE5_KT
                                          where
                                                  DATE_FROM <= $now
                                              and DATE_TO   >= $now;

    @readonly
    entity TopicComponents             as projection on MATHIER_HIERNODE6_TBS
                                          where
                                                  DATE_FROM <= $now
                                              and DATE_TO   >= $now;

    @readonly
    entity NineGridBoxes               as projection on classification.NineGridBoxes;

    @readonly
    entity TargetGroups                as projection on ZSTTA_ZIELGR_T;

    @readonly
    entity Suppliers                   as projection on LFA1;

    // @readonly
    // entity Suppliers                   as projection on common.Suppliers;

    @readonly
    entity OrderOptions                as projection on consumertopicbrand.OrderOptions;

    @readonly
    entity PricatCatalogs              as projection on classification.PricatCatalogs;

    @readonly
    entity ProductTypes                as projection on classification.ProductTypes;

    @readonly
    entity SupplyTypes                 as projection on ZSTTA_SUP_TYPE;

    @readonly
    @cds.redirection.target
    entity MerchandiseSecurityMethods       as projection on MARA
                                          where
                                              MARA.TYPE = 'ZVHM' and MARA.MATKL = '9901773';

    @readonly
    entity PriceLabelMethods         as projection on MARA
                                          where
                                              MARA.TYPE = 'ZVHM' and MARA.MATKL = '9901774';

    @readonly
    entity HangerMethods               as projection on MARA
                                          where
                                              MARA.TYPE = 'ZVHM' and MARA.MATKL = '9901775';

    @readonly
    entity Programs                    as projection on T6WFGT;

    @readonly
    entity ProductGroups               as projection on T023T;

    @readonly
    entity AssortmentModules           as projection on MATHIER_HIERNODE7_SBS
                                          where
                                                  DATE_FROM <= $now
                                              and DATE_TO   >= $now;

    @readonly
    entity VATs                        as projection on classification.VATs;

    @readonly
    entity PriceLevels                 as projection on classification.PriceLevels

    @readonly
    entity ProductionPlants            as projection on PRODUCTION_PLANT;

}
