using {com.valantic.preorder.consumertopicbrand} from '../../db/consumertopicbrand/schema';
using {com.valantic.preorder.common} from '../../db/common/supplier';
using {com.valantic.preorder.common.product} from '../../db/common/product';
using {com.valantic.preorder.common.helper.topic} from '../../db/common/helper/topic';
using {com.valantic.preorder.common.helper.logistic} from '../../db/common/helper/logistic';
using {com.valantic.preorder.common.helper.classification} from '../../db/common/helper/classification';
using {com.valantic.preorder.common.helper.method} from '../../db/common/helper/method';
using {com.valantic.preorder.product as productmasterdata} from '../../db/product/schema';
using {com.valantic.preorder.writingAppointments} from '../../db/writing-appointment/schema';
using {
                   LFA1,
                   MATHIER_HIERNODE5_KT,
                   MATHIER_HIERNODE7_SBS,
                   MATHIER_HIERNODE6_TBS,
                   WRF_BRANDS,
    WRF_CHARVAL as extCHARVAL,
                   ZSTTA_GROE_SYS,
                   ZSTTA_MUSTER_T,
                   ZSTTA_SONDERARTT,
                   T6WFGT,
                   MARA,
                   ZBMTA0081_SERIE,
                   ZSTTA_ZIELGR_T,
                   T023T,
    EINA        as extEINA,
    MARA        as extMARA,
    PRICAT_K003 as extPRICAT_K003,
                   ZSTTA_SUP_TYPE,
                   PRODUCTION_PLANT,
                   ZSTTA_NH_GS_T,
    EINE        as extEINE,
    WRF_PSCD_TCHAINH

} from '../../db/synced/sap-ecc-schema';

service Product {
    /*ENTITIES*/
    @cds.redirection.target
    entity Products                      as projection on productmasterdata.Products
        actions {
            function getImageUrl() returns String;
            action   changeImage(imageUrl: String, imageBase64: String);
            action   markForDeletion();
        };
    action   copyProducts(products: String)                                  returns Boolean;

    //Do not allow deletion for suppliers
    @restrict: [{grant: [
        'READ',
        'CREATE',
        'UPDATE'
    ]} // Allow read, create, update, but not delete
    ]
    entity SupplierProducts              as projection on productmasterdata.Products;

    @restrict                    : [{grant: ['CREATE']}]
    @cds.server.body_parser.limit: '50MB'
    entity UploadArticles                as projection on productmasterdata.UploadArticles;

    action   uploadArticles(products: array of UploadArticles)                         returns Boolean;

    @restrict                    : [{grant: ['CREATE']}]
    @cds.server.body_parser.limit: '50MB'
    entity UploadProducts                as projection on productmasterdata.UploadProducts;

    action   uploadProducts(products: array of UploadProducts)                         returns Boolean;

    @restrict                    : [{grant: ['CREATE']}]
    @cds.server.body_parser.limit: '50MB'
    entity UploadVariants                as projection on productmasterdata.UploadVariants;

    action   uploadVariants(products: array of UploadVariants)                         returns Boolean;

    @restrict                    : [{grant: ['CREATE']}]
    @cds.server.body_parser.limit: '50MB'
    entity UploadWritingAppointments                as projection on productmasterdata.UploadWritingAppointments;

    action   uploadWritingAppointments(products: array of UploadWritingAppointments)                         returns Boolean;

    /*VALUEHELPS*/
    @readonly

    entity Suppliers                     as projection on LFA1;

    @readonly
    entity ConsumerTopics                as projection on MATHIER_HIERNODE5_KT
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    @readonly
    entity Brands                        as projection on WRF_BRANDS;

    @readonly
    entity TopicComponents               as projection on MATHIER_HIERNODE6_TBS
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    @readonly
    entity AssortmentModules             as projection on MATHIER_HIERNODE7_SBS
                                            where
                                                    DATE_FROM <= $now
                                                and DATE_TO   >= $now;

    @readonly
    entity ProductGroups                 as projection on T023T;

    @readonly
    entity TargetGroups                  as projection on ZSTTA_ZIELGR_T;

    @readonly
    entity Modules                       as projection on productmasterdata.Modules;

    @readonly
    entity EvaluationColors              as projection on product.EvaluationColors;

    @readonly
    entity SizeSystems                   as projection on ZSTTA_GROE_SYS;

    @readonly
    entity Sizes                         as projection on productmasterdata.Sizes;

    @readonly
    entity SupplyTypes                   as projection on ZSTTA_SUP_TYPE;

    @readonly
    entity SeasonTypes                   as projection on classification.SeasonTypes;

    @readonly
    entity PresentationTypes             as projection on productmasterdata.PresentationTypes;

    @readonly
    entity Currencies                    as projection on logistic.Currencies;

    @readonly
    entity VATs                          as projection on classification.VATs;

    @readonly
    entity UVPTypes                      as projection on classification.UVPTypes;

    @readonly
    entity PricatCatalogs                as projection on classification.PricatCatalogs;

    @readonly
    entity ProductTypes                  as projection on classification.ProductTypes;

    @readonly
    entity OwnershipStatus               as projection on logistic.OwnershipStatus;

    @readonly
    entity NineGridBoxes                 as projection on classification.NineGridBoxes;

    @readonly
    entity Materials                     as projection on product.Materials;

    @readonly
    entity TransportChains                 as projection on WRF_PSCD_TCHAINH;

    @readonly
    entity ShippingPorts                 as projection on logistic.ShippingPorts;

    @readonly
    entity IncoTerms                     as projection on logistic.IncoTerms;

    @readonly
    entity VKHMs                         as projection on MARA
                                            where
                                                MARA.TYPE = 'ZVHM';

    @readonly
    entity MerchandiseSecurityMethods         as projection on MARA
                                            where
                                                    MARA.TYPE  = 'ZVHM'
                                                and MARA.MATKL = '9901773';

    @readonly
    entity PriceLabelMethods           as projection on MARA
                                            where
                                                    MARA.TYPE  = 'ZVHM'
                                                and MARA.MATKL = '9901774';

    @readonly
    entity HangerMethods                 as projection on MARA
                                            where
                                                    MARA.TYPE  = 'ZVHM'
                                                and MARA.MATKL = '9901775';

    @readonly
    entity Series                        as projection on ZBMTA0081_SERIE;

    @readonly
    entity Licenses                      as projection on productmasterdata.Licenses;

    @readonly
    entity Programs                      as projection on T6WFGT;

    @readonly
    entity Patterns                      as projection on ZSTTA_MUSTER_T;

    @readonly
    entity SpecialProducts               as projection on ZSTTA_SONDERARTT;

    @readonly
    entity Occasions                     as projection on productmasterdata.Occasions;

    @readonly
    entity Properties                    as projection on productmasterdata.Properties;

    @readonly
    entity LoadingGroups                 as projection on logistic.LoadingGroups;

    @readonly
    entity SustainabilitySealOfApprovals as projection on ZSTTA_NH_GS_T;

    entity ProductsToWritingAppointments as projection on productmasterdata.ProductsToWritingAppointments;

    entity ArticlesToWritingAppointments as projection on productmasterdata.ArticlesToWritingAppointments;

    entity ProductSizesToWritingAppointments as projection on productmasterdata.ProductSizesToWritingAppointments;

    @readonly
    entity WritingAppointments           as projection on writingAppointments.WritingAppointments;

    @readonly
    entity ConsumerTopicBrands           as projection on consumertopicbrand.SupplierConsumerTopicBrands;

    @readonly
    entity ShippingInstructions          as projection on logistic.ShippingInstructions;

    @readonly
    entity BaseUnitOfMeasures            as projection on productmasterdata.BaseUnitOfMeasures;

    @readonly
    entity StorageUnitOfMeasures                as projection on productmasterdata.StorageUnitOfMeasures;

    @readonly
    @cds.redirection.target
    entity WRF_CHARVAL                   as projection on extCHARVAL;

    @readonly
    entity Qualities                     as projection on productmasterdata.Qualities;

    @readonly
    entity Omnichannels                  as projection on productmasterdata.Omnichannels;

    @readonly
    entity SurfaceWashings               as projection on productmasterdata.SurfaceWashings;

    @readonly
    entity MainForms                     as projection on productmasterdata.MainForms;

    @readonly
    entity StockingThickness             as projection on productmasterdata.StockingThickness;


    @readonly
    entity WashingMethods                as projection on method.WashingMethods;

    @readonly
    entity BleachingMethods              as projection on method.BleachingMethods;

    @readonly
    entity DryingMethods                 as projection on method.DryingMethods;

    @readonly
    entity IroningMethods                as projection on method.IroningMethods;

    @readonly
    entity CleaningMethods               as projection on method.CleaningMethods;

    @readonly
    entity PriceLevels                   as projection on classification.PriceLevels;

    @readonly
    entity EINA                          as projection on extEINA;

    @readonly
    entity MARA                          as projection on extMARA;

    @readonly
    entity PRICAT_K003                   as projection on extPRICAT_K003;

    @readonly
    entity ProductionPlants              as projection on PRODUCTION_PLANT;

    @readonly
    entity StorageLocations              as projection on logistic.StorageLocations;

    @readonly
    entity EINE                          as projection on extEINE;

    @readonly
    entity CreationStatus                as projection on product.CreationStatus;

    @readonly
    entity SizeRuns                      as projection on product.SizeRuns;

    @readonly
    entity HouseGroups                   as projection on logistic.HouseGroups;

    /*FUNCTIONS*/
    function checkForExistingProduct(supplierProductNumber: String, GTIN: String)      returns ExistingProductCheck;

    function searchProductsInSAP(searchTerm: String)                                   returns Boolean;

    function importProductFromSAP(materialNumber: String, color: String, type: String) returns Boolean;

    function checkExistingGTINInTool(GTIN: String)                                     returns ExistingProductCheck;

    function checkHigherLevelStatus(variant_ID: String)                                returns Boolean;

    /*TYPES*/
    type ExistingProductCheck : {
        existing   : Boolean;
        existingIn : String @assert.range enum {
            SAP;
            PRICAT;
            PREORDER
        }
    };

    @readonly
    entity FlatAppointments              as
        select from productmasterdata.Products as P
        left outer join productmasterdata.ProductsToWritingAppointments as P2WA
            on P.ID = P2WA.product.ID
        left outer join writingAppointments.WritingAppointments as WA
            on P2WA.writingAppointment.ID = WA.ID
        {
            key P.ID                            as productID,
                // Use the direct alias WA for the key, not the path P2WA...
            key WA.ID                           as writingAppointmentID,

                // Your Attributes
                P.module.DESCRIPTION            as moduleDescription            : String @title: 'Modul',
                // P.size1.DESCRIPTION             as size1Description             : String @title: 'Größe 1',
                // P.size2.DESCRIPTION             as size2Description             : String @title: 'Größe 2',
                P.presentationType.DESCRIPTION  as presentationTypeDescription  : String @title: 'Präsentationsart',
                P.occasion.DESCRIPTION          as occasionDescription          : String @title: 'Anlass',
                P.property.DESCRIPTION          as propertyDescription          : String @title: 'Eigenschaft',
                P.quality.DESCRIPTION           as qualityDescription           : String @title: 'Qualität',
                P.surfaceWashing.DESCRIPTION    as surfaceWashingDescription    : String @title: 'Oberflächenwaschung',
                P.mainForm.DESCRIPTION          as mainFormDescription          : String @title: 'Formhaupt',
                P.stockingThickness.DESCRIPTION as stockingThicknessDescription : String @title: 'Strumpfstärke',
                P.omnichannel.DESCRIPTION       as omnichannelDescription       : String @title: 'Omnichannel',

                WA.name                         as writingAppointmentName,
                P2WA.deliveryDateVZ             as deliveryDate,


                // // Exclude ID to void duplication with productID
                // // Be careful with associations included here

                P.*


        } where P.isArchived = false;
        
    @readonly
    entity FlatArticles              as
        select from productmasterdata.Articles as A
        left outer join productmasterdata.ArticlesToWritingAppointments as A2WA
            on A.ID = A2WA.article.ID
        left outer join writingAppointments.WritingAppointments as WA
            on A2WA.writingAppointment.ID = WA.ID
        {
            key A.ID                        as articleID,
            key WA.ID                       as writingAppointmentID,
                // Use the direct alias WA for the key, not the path P2WA...
            // Your Attributes
            A.module.DESCRIPTION            as moduleDescription            : String @title: 'Modul',
            A.presentationType.DESCRIPTION  as presentationTypeDescription  : String @title: 'Präsentationsart',
            A.occasion.DESCRIPTION          as occasionDescription          : String @title: 'Anlass',
            A.property.DESCRIPTION          as propertyDescription          : String @title: 'Eigenschaft',
            A.quality.DESCRIPTION           as qualityDescription           : String @title: 'Qualität',
            A.surfaceWashing.DESCRIPTION    as surfaceWashingDescription    : String @title: 'Oberflächenwaschung',
            A.mainForm.DESCRIPTION          as mainFormDescription          : String @title: 'Formhaupt',
            A.stockingThickness.DESCRIPTION as stockingThicknessDescription : String @title: 'Strumpfstärke',
            A.omnichannel.DESCRIPTION       as omnichannelDescription       : String @title: 'Omnichannel',
            WA.name                         as writingAppointmentName,
            A2WA.deliveryDateVZ             as deliveryDate,
            // Exclude ID to void duplication with articleID
            // Be careful with associations included here
            A.*
        } where A.isArchived = false;

    @readonly
    entity FlatProductSizes              as
        select from productmasterdata.ProductSizes as PS
        left outer join productmasterdata.ProductSizesToWritingAppointments as PS2WA
            on PS.ID = PS2WA.productSize.ID
        left outer join writingAppointments.WritingAppointments as WA
            on PS2WA.writingAppointment.ID = WA.ID
        {
            key PS.ID                        as productSizesID,
            key WA.ID                        as writingAppointmentID,
                // Use the direct alias WA for the key, not the path P2WA...
            // Your Attributes
            PS.module.DESCRIPTION            as moduleDescription            : String @title: 'Modul',
            PS.size_1.DESCRIPTION            as size_1Description            : String @title: 'Größe 1',
            PS.size_2.DESCRIPTION            as size_2Description            : String @title: 'Größe 2',
            PS.presentationType.DESCRIPTION  as presentationTypeDescription  : String @title: 'Präsentationsart',
            PS.occasion.DESCRIPTION          as occasionDescription          : String @title: 'Anlass',
            PS.property.DESCRIPTION          as propertyDescription          : String @title: 'Eigenschaft',
            PS.quality.DESCRIPTION           as qualityDescription           : String @title: 'Qualität',
            PS.surfaceWashing.DESCRIPTION    as surfaceWashingDescription    : String @title: 'Oberflächenwaschung',
            PS.mainForm.DESCRIPTION          as mainFormDescription          : String @title: 'Formhaupt',
            PS.stockingThickness.DESCRIPTION as stockingThicknessDescription : String @title: 'Strumpfstärke',
            PS.omnichannel.DESCRIPTION       as omnichannelDescription       : String @title: 'Omnichannel',
            WA.name                          as writingAppointmentName,
            PS2WA.deliveryDateVZ             as deliveryDate,
            // Exclude ID to void duplication with productSizesID
            // Be careful with associations included here
            PS.*
        } where PS.isArchived = false;

    action   createSAPProduct(product_ID: String, level: String)                       returns {};
    action   checkChildExistence(ID: String, level: String)                            returns {};
    @readonly
    entity ProductsTable              as
        select from productmasterdata.Products as P
        // left outer join productmasterdata.ProductsToWritingAppointments as P2WA
        //     on P.ID = P2WA.product.ID
        // left outer join writingAppointments.WritingAppointments as WA
        //     on P2WA.writingAppointment.ID = WA.ID
        {
            key P.ID                            as productID,
                // Use the direct alias WA for the key, not the path P2WA...
            // key WA.ID                           as writingAppointmentID,
                // Your Attributes
                P.module.DESCRIPTION            as moduleDescription            : String @title: 'Modul',
                P.presentationType.DESCRIPTION  as presentationTypeDescription  : String @title: 'Präsentationsart',
                P.occasion.DESCRIPTION          as occasionDescription          : String @title: 'Anlass',
                P.property.DESCRIPTION          as propertyDescription          : String @title: 'Eigenschaft',
                P.quality.DESCRIPTION           as qualityDescription           : String @title: 'Qualität',
                P.surfaceWashing.DESCRIPTION    as surfaceWashingDescription    : String @title: 'Oberflächenwaschung',
                P.mainForm.DESCRIPTION          as mainFormDescription          : String @title: 'Formhaupt',
                P.stockingThickness.DESCRIPTION as stockingThicknessDescription : String @title: 'Strumpfstärke',
                P.omnichannel.DESCRIPTION       as omnichannelDescription       : String @title: 'Omnichannel',
                // WA.name                         as writingAppointmentName,
                // P2WA.deliveryDateVZ             as deliveryDate,
                P.*
        } where P.isArchived = false;    

    @readonly
    entity ProductSizesTable              as
        select from productmasterdata.ProductSizes as PS
        {
            key PS.ID                        as productSizesID,
            // Use the direct alias WA for the key, not the path P2WA...
            // Your Attributes
            PS.module.DESCRIPTION            as moduleDescription            : String @title: 'Modul',
            PS.size_1.DESCRIPTION            as size_1Description            : String @title: 'Größe 1',
            PS.size_2.DESCRIPTION            as size_2Description            : String @title: 'Größe 2',
            PS.presentationType.DESCRIPTION  as presentationTypeDescription  : String @title: 'Präsentationsart',
            PS.occasion.DESCRIPTION          as occasionDescription          : String @title: 'Anlass',
            PS.property.DESCRIPTION          as propertyDescription          : String @title: 'Eigenschaft',
            PS.quality.DESCRIPTION           as qualityDescription           : String @title: 'Qualität',
            PS.surfaceWashing.DESCRIPTION    as surfaceWashingDescription    : String @title: 'Oberflächenwaschung',
            PS.mainForm.DESCRIPTION          as mainFormDescription          : String @title: 'Formhaupt',
            PS.stockingThickness.DESCRIPTION as stockingThicknessDescription : String @title: 'Strumpfstärke',
            PS.omnichannel.DESCRIPTION       as omnichannelDescription       : String @title: 'Omnichannel',
            PS.*
        } where PS.isArchived = false;    

    @readonly
    entity WG_SBS                        as
        select from consumertopicbrand.SupplierConsumerTopicBrands.to_WG_SBS as CTB {
            key CTB.ID,
                CTB.up_,
                CTB.productGroup,
                CTB.assortmentModule,
                CTB.productGroup.NAME     as productGroup_NAME,
                CTB.assortmentModule.NAME as assortmentModule_NAME,
                CTB.up_.topicComponent.ID as topicComponent_ID
        };

    @readonly
    entity WGPROGRAMS                    as
        select from consumertopicbrand.SupplierConsumerTopicBrands.to_Programs as TPS {
            key TPS.ID,
                TPS.up_,
                TPS.program,
                TPS.program.NAME as program_NAME
        };

    @readonly
    entity PurchaseGroups                as projection on productmasterdata.PurchaseGroups;

    /* GPOPT-1175: Remove valid range in purchase and sales data
    entity Products_to_Purchase          as projection on productmasterdata.Products.to_Purchase;
    entity Products_to_Sales             as projection on productmasterdata.Products.to_Sales;
    */
    @cds.redirection.target
    entity ProductSizes                  as projection on productmasterdata.ProductSizes
        actions {
           action   markForDeletion(); 
        }

    @cds.redirection.target
    entity Articles                       as projection on productmasterdata.Articles
        actions {
            action   markForDeletion();
        };

    @readonly
    entity ArticlesVH       as
        select from Articles as A
        {
            key A.ID                as ID,
                A.name              as NAME,
                A.supplier,
                A.consumerTopic,
                A.brand
        };

    @readonly
    entity ProductsVH           as
        select from Products as P
        {
            key P.ID                    as ID,
                P.name                  as NAME,
                P.supplier,
                P.consumerTopic,
                P.brand,
                P.article,
                P.evaluationColor.name  as evaluationColorName
        };  

    @readonly
    entity SupplierProductNumberVH      as
        select from Articles as A
        {
            key A.supplierProductNumber,
                A.supplier,
                A.consumerTopic,
                A.brand,    
        } group by
            A.supplierProductNumber,
            A.supplier,
            A.consumerTopic,
            A.brand;

    @readonly
    entity EvaluationColorsVH      as
        select from Products as P
        {
            key P.evaluationColor.ID   as evaluationColorID,
                P.evaluationColor.name as evaluationColorName,
                P.supplier,
                P.consumerTopic,
                P.brand,
                P.supplierProductNumber
        } group by 
            P.evaluationColor.ID,
            P.evaluationColor.name,
            P.supplier,
            P.consumerTopic,
            P.brand,
            P.supplierProductNumber ;    

    @readonly
    entity ProductStatusSummary          as
        select from productmasterdata.Products as P
        left outer join productmasterdata.ProductStatus as PS
            on P.status.ID = PS.ID
        {
            key P.status.ID        as status_ID        : String @title: 'Status',
                P.status.name      as status_name,
                /* 🔴 RED */
                sum(case
                        when P.status.ID in (
                                 'CreationFailed', 'Failed', 'MarkedForDeletion'
                             )
                             then 1
                        else 0
                    end)           as count_red        : Integer,

                /* 🟡 ORANGE */
                sum(case
                        when P.status.ID in (
                                 'ToCheck', 'RequestedToSAP', 'InProgress', 'PartiallyCreatedInSAP'
                             )
                             then 1
                        else 0
                    end)           as count_orange     : Integer,

                /* 🟢 GREEN */
                sum(case
                        when P.status.ID in (
                                 'CreatedInSAP', 'ReleasedForSupplier', 'NewSupplierProduct'
                             )
                             then 1
                        else 0
                    end)           as count_green      : Integer,

                //count( * )         as count            : Integer @title: 'Anzahl',
                P.brand.ID         as brand_ID         : String @title: 'Marke',
                P.consumerTopic.ID as consumerTopic_ID : String @title: 'KT',
                P.supplier.ID      as supplier_ID      : String @title: 'Supplier',
        //          case
        //     when P.status.ID in ('CreationFailed','Failed','MarkedForDeletion') then 1
        //     when P.status.ID in ('ToCheck','RequestedToSAP','InProgress') then 2
        //     when P.status.ID in ('CreatedInSAP','ReleasedForSupplier') then 3
        //     else 0
        // end           as Criticality  : Integer,
        }
        group by
            P.status.ID,
            P.status.name,
            P.brand.ID,
            P.consumerTopic.ID,
            P.supplier.ID
}