using {com.valantic.preorder.product as productmasterdata} from '../../db/product/schema';
using {com.valantic.preorder.writingAppointments} from '../../db/writing-appointment/schema';

using {
                   LFA1,
                   MATHIER_HIERNODE5_KT,
                   WRF_BRANDS,
    WRF_CHARVAL as extCHARVAL,
                   ZSTTA_GROE_SYS,
                   ZSTTA_MUSTER_T,
                   ZSTTA_SONDERARTT,
                   ZSTTA_ZIELGR_T,
                   T023T,
                   PRICAT_K001

} from '../../db/synced/sap-ecc-schema';

service Check {
    entity Articles            as select from productmasterdata.Articles;

    entity Products            as select from productmasterdata.Products;

    entity ProductSizes        as select from productmasterdata.ProductSizes;

    entity WritingAppointments as projection on writingAppointments.WritingAppointments;

    entity ConsumerTopics      as projection on MATHIER_HIERNODE5_KT
                                  where
                                          DATE_FROM <= $now
                                      and DATE_TO   >= $now;

    @readonly
    entity Brands              as projection on WRF_BRANDS;

    @readonly
    entity ProductStatus       as projection on productmasterdata.ProductStatus;

    @readonly
    entity Suppliers           as projection on LFA1;

    entity CombinedDataView    as
        // ARTICLE
        select from Articles {
            key ID,
                'Artikel'             as entityType : String,
                supplierProductNumber as name,
                null                  as date       : Date,
                consumerTopic,
                brand,
                supplier,
                // GTIN,
                status,
                status.name           as statusName,
                sapHttpStatus,
                sapHttpStatusText,
                sapStatus,
                sapStatusText,
                sapTransactionId,
                cast(
                    0 as Integer
                )                     as Criticality
        } where status.ID <> 'CreationFailed'
        union all
            // OPTION
            select from Products {
                key ID,
                    'Option'              as entityType : String,
                    supplierProductNumber as name,
                    null                  as date       : Date,
                    consumerTopic,
                    brand,
                    supplier,
                    // GTIN,
                    status,
                    status.name           as statusName,
                    sapHttpStatus,
                    sapHttpStatusText,
                    sapStatus,
                    sapStatusText,
                    sapTransactionId,
                    cast(
                        0 as Integer
                    )                     as Criticality
            } where status.ID <> 'CreationFailed'
        union all
            // VARIANT
            select from ProductSizes {
                key ID,
                    'Variante'            as entityType : String,
                    supplierProductNumber as name,
                    null                  as date       : Date,
                    consumerTopic,
                    brand,
                    supplier,
                    // GTIN,
                    status,
                    status.name           as statusName,
                    sapHttpStatus,
                    sapHttpStatusText,
                    sapStatus,
                    sapStatusText,
                    sapTransactionId,
                    cast(
                        0 as Integer
                    )                     as Criticality
            }
        union all
            // AUFTRAG
            select from WritingAppointments {
                key ID,
                    'Auftrag'   as entityType : String,
                    name,
                    date,
                    consumerTopic,
                    brand,
                    supplier,
                    // null        as GTIN       : String,
                    status,
                    status.name as statusName,
                    sapHttpStatus,
                    sapHttpStatusText,
                    sapStatus,
                    sapStatusText,
                    sapTransactionId,
                    cast(
                        0 as Integer
                    )           as Criticality
            };

    action approve(entity: String, ID: String) returns Boolean;


}
