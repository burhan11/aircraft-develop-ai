namespace com.valantic.preorder.planning;

using {
    cuid,
    managed
} from '@sap/cds/common';

using {com.valantic.preorder.writingAppointments} from '../writing-appointment/schema';
using {com.valantic.preorder.common.Suppliers} from '../common/supplier';
using {com.valantic.preorder.common.helper.topic} from '../common/helper/topic';
using {com.valantic.preorder.common.helper.classification} from '../common/helper/classification';
using {com.valantic.preorder.common.product} from '../common/product';
using {com.valantic.preorder.product as productmasterdata} from '../product/schema';
using {
                   LFA1,
                   MATHIER_HIERNODE5_KT,
                   WRF_BRANDS,
                   WRF_CHARVAL,
    WRF_CHARVAL as extCHARVAL,
                   ZSTTA_GROE_SYS,
                   ZSTTA_MUSTER_T,
                   ZSTTA_SONDERARTT,
                   ZSTTA_ZIELGR_T,
                   T023T
} from '../synced/sap-ecc-schema';

entity PlanningProductsToPlanningSizes : managed {
    key writingAppointment : Association to one writingAppointments.WritingAppointments;
    key product            : Association to one productmasterdata.Products @assert.integrity;
    key combinedSize       : String;
        size_1             : Association to one extCHARVAL                 @assert.integrity;
        size_2             : Association to one extCHARVAL                 @assert.integrity;
        houseGroup1        : Integer;
        houseGroup2        : Integer;
        houseGroup3        : Integer;
        houseGroup4        : Integer;
        houseGroup5        : Integer;
        houseGroup6        : Integer;
        houseGroup7        : Integer;
        houseGroup8        : Integer;
        houseGroup9        : Integer;
        houseGroup10       : Integer;
        houseGroup11       : Integer;
        houseGroup12       : Integer;
        houseGroup13       : Integer;
        houseGroup14       : Integer;
        houseGroup15       : Integer;
        totalAmount        : Integer;
}
