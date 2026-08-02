using {com.valantic.preorder.writingAppointments} from '../../db/writing-appointment/schema';
using {com.valantic.preorder.common.helper.topic} from '../../db/common/helper/topic';
using {com.valantic.preorder.common.helper.classification} from '../../db/common/helper/classification';
using {com.valantic.preorder.common} from '../../db/common/supplier';
using {com.valantic.preorder.product} from '../../db/product/schema';
using {com.valantic.preorder.common.helper.logistic} from '../../db/common/helper/logistic';

using {
    LFA1,
    MATHIER_HIERNODE5_KT,
    WRF_BRANDS,
    PRODUCTION_PLANT,
    ZSTTA_SUP_TYPE,
    T001W

} from '../../db/synced/sap-ecc-schema';

service WritingAppointmentService {
    @odata.draft.enabled
    entity WritingAppointments           as
        projection on writingAppointments.WritingAppointments {
            *,
            null as consumerTopicShortID : String(3),
        };

    @readonly
    entity ConsumerTopics                as projection on MATHIER_HIERNODE5_KT
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    @readonly
    entity Brands                        as projection on WRF_BRANDS;

    @readonly
    entity ProductsToWritingAppointments as projection on product.ProductsToWritingAppointments;

    @readonly
    entity Products                      as projection on product.Products;

    @readonly
    entity Suppliers                     as projection on LFA1;

    @readonly
    entity ItemCategories                as projection on writingAppointments.T163;

    @readonly
    entity IncoTerms                     as projection on logistic.IncoTerms;


    @readonly
    entity ProductionPlants              as projection on PRODUCTION_PLANT;

    @readonly
    entity ProductionPlantsVZ            as projection on T001W;

    @readonly
    entity SupplyTypes                   as projection on ZSTTA_SUP_TYPE;

    @readonly
    entity OwnershipStatus               as projection on logistic.OwnershipStatus;

    @readonly
    entity StorageLocations              as projection on logistic.StorageLocations;

    @readonly
    entity AllocationMode                as projection on writingAppointments.AllocationMode;

    @readonly
    entity ShippingPorts                 as projection on logistic.ShippingPorts;
}
