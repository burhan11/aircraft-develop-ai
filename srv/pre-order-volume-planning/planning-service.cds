using {com.valantic.preorder.planning} from '../../db/pre-order-volume-planning/schema';
using {com.valantic.preorder.common.helper.classification} from '../../db/common/helper/classification';
using {com.valantic.preorder.common.helper.logistic} from '../../db/common/helper/logistic';
using {com.valantic.preorder.common} from '../../db/common/supplier';
using {com.valantic.preorder.common.helper.topic} from '../../db/common/helper/topic';
using {com.valantic.preorder.writingAppointments} from '../../db/writing-appointment/schema';
using {com.valantic.preorder.product as productmasterdata} from '../../db/product/schema';
using {com.valantic.preorder.common.product as product} from '../../db/common/product';
using {
                   LFA1,
                   MATHIER_HIERNODE5_KT,
                   WRF_BRANDS,
    WRF_CHARVAL as extCHARVAL,
                   T023T,
                   ZBMTA0081_SERIE,
                   MARA,
                   ZSTTA_SUP_TYPE,
                   WAKH,
                   T001W,
                   PRODUCTION_PLANT,
                   WRF_PSCD_TCHAINH

} from '../../db/synced/sap-ecc-schema';

using {TB_SAC_SIZE_PLAN, } from '../../db/synced/sac-schema';

service PlanningService {
    entity Planning                              as
        select from writingAppointments.WritingAppointments {
            key ID,
                name,
                date,
                consumerTopic,
                brand,
                supplier,
                purchaseVolume,
                createdAt,
                createdBy,
                modifiedAt,
                modifiedBy,
                sapOrderNumber,
                status.name as status_name,
                status,
                productionPlant,
                allocationMode,
                isArchived,
                orderReleaseText,
                null        as consumerTopicShortID : String(3),

        }
        where
            isArchived = false;

    action   addPlanningProducts(planning_ID: String, product_ID: String);

    entity PlanningProducts                      as
        select from productmasterdata.ProductsToWritingAppointments {
            key product,
            key writingAppointment,
                *,
                product.houseGroup as houseGroup,
                virtual null       as purchasePrice    : Decimal(15, 2) @readonly,
                virtual null       as purchaseDiscount : Integer        @readonly,
                virtual null       as salesPrice       : Decimal(15, 2) @readonly,
                product.supplierColor,
                product.evaluationColor,
                product.supplierProductName,
                product.supplierProductNumber,
                product.productGroup,
                product.seasonType,
                product.presentationType,
                product.ownershipStatus,
                product.supplyType as product_supplyType,
        }
        actions {
            action updateTotalAmount(totalAmount: Integer);
        };

    entity PlanningProductSizes                  as
        select from productmasterdata.ProductSizesToWritingAppointments {
            key productSize,
            key writingAppointment,
                *,
                productSize.houseGroup as houseGroup,
                virtual null       as purchasePrice    : Decimal(15, 2) @readonly,
                virtual null       as purchaseDiscount : Integer        @readonly,
                virtual null       as salesPrice       : Decimal(15, 2) @readonly,
                productSize.supplierColor,
                productSize.evaluationColor,
                productSize.supplierProductName,
                productSize.supplierProductNumber,
                productSize.productGroup,
                productSize.seasonType,
                productSize.presentationType,
                productSize.ownershipStatus,
                productSize.supplyType as productSize_supplyType,
                productSize.size_1,
                productSize.size_2,
        }
        actions {
            action updateTotalAmount(totalAmount: Integer);
        };    


    entity PlanningProducts_differingHouseGroups as projection on productmasterdata.ProductsToWritingAppointments.differingHouseGroups;

    @readonly
    entity PlanningStatus                        as projection on writingAppointments.PlanningStatus;

    @readonly
    entity Brands                                as projection on WRF_BRANDS;

    @readonly
    entity Suppliers                             as projection on LFA1;

    @readonly
    entity ConsumerTopics                        as projection on MATHIER_HIERNODE5_KT
                                                    where
                                                            DATE_FROM <= $now
                                                        and DATE_TO   >= $now;

    @readonly
    @cds.redirection.target
    entity WritingAppointments                   as projection on writingAppointments.WritingAppointments;

    @readonly
    entity SeasonTypes                           as projection on classification.SeasonTypes;

    @readonly
    entity Series                                as projection on ZBMTA0081_SERIE;


    @readonly
    entity PresentationTypes                     as projection on productmasterdata.PresentationTypes;

    @cds.redirection.target
    @readonly
    entity WRF_CHARVAL                           as projection on extCHARVAL;

    @readonly
    @cds.redirection.target
    entity Products                              as
        select from ProductsWithoutExpands as P
        left outer join productmasterdata.ProductsToWritingAppointments as P2WA
            on P.ID = P2WA.product.ID
        left outer join writingAppointments.WritingAppointments as WA
            on P2WA.writingAppointment.ID = WA.ID
        {
            key P.ID                           as productID,
            key WA.ID                          as writingAppointmentID,
                WA.name                        as writingAppointmentName,
                // P.to_WritingAppointments.index as rowIndex,
                P2WA.index                     as rowIndex,
                P.*

        };

    @readonly
    entity ProductsWithoutExpands                as
        projection on productmasterdata.Products
        /* GPOPT-1175: Remove valid range in purchase and sales data
        excluding {
            to_Sales,
            to_Purchase
        }
        */
        ;

    @readonly
    entity ProductSizesWithoutExpands                as
        projection on productmasterdata.ProductSizes;    

    @readonly
    entity ProductGroups                         as projection on T023T;

    @readonly
    entity EvaluationColors                      as projection on product.EvaluationColors;

    @readonly
    entity HouseGroups                           as projection on logistic.HouseGroups;

    @readonly
    entity BaseUnitOfMeasures                    as projection on productmasterdata.BaseUnitOfMeasures;

    function getBudgetHG(planning_ID: String)              returns {
        houseGroupBudgets : array of {
            houseGroup           : Integer;
            houseCount           : Integer;
            plannedPurchaseLimit : Decimal(15, 2);
            overallCosts         : Decimal(15, 2);
            remainingBudget      : Decimal(15, 2);
            remainingBudgetRatio : Decimal(5, 2);
            productCountPerColor : Integer;
            overallProductCount  : Integer;
        };
        overallBudget     : {
            houseCount           : Integer;
            plannedPurchaseLimit : Decimal(15, 2);
            overallCosts         : Decimal(15, 2);
            remainingBudget      : Decimal(15, 2);
            remainingBudgetRatio : Decimal(5, 2);
            productCountPerColor : Integer;
            overallProductCount  : Integer;
        }
    };

    function getBudgetKT(planning_ID: String)              returns {};

    function validatePlanning(planning_ID: String)         returns {};
    function validateSizeDistribution(planning_ID: String) returns {};
    action   generateDefaultHGAmounts(planning_ID: String);
    action   validateProductSizesDistribution(planning_ID: String);
    action   updateProductsSizeKey(planning_ID: String);


    //TODO WAIT FOR SAC
    @readonly
    entity SAC_SIZE_KEYS                         as
        select from productmasterdata.Products as P
        inner join TB_SAC_SIZE_PLAN as SP
            on     P.consumerTopic.ID  = SP.KT
            and    P.brand.ID          = SP.BRAND
            and (
                   P.productGroup.ID   = SP.MATERIAL_GROUP
                or SP.MATERIAL_GROUP   = '#'
            )

            and (
                   P.topicComponent.ID = SP.TBS
                or SP.TBS              = '#'
            )

        distinct {
            key P.ID        as product_ID,
            key SP.SIZE_KEY as sizeKey
        };

    entity PlanningProductsToPlanningSizes       as projection on planning.PlanningProductsToPlanningSizes;

    @readonly
    @cds.redirection.target
    entity SampleSaleMethods                     as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901770';

    @readonly
    entity MerchandiseSecurityMethods            as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901773';

    @readonly
    entity PriceLabelMethods                     as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901774';

    @readonly
    entity HangerMethods                         as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901775';

    @readonly
    entity AdditionalVKHMMethods                 as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901776';

    @readonly
    entity BrandLabelMethods                     as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901777';

    @readonly
    entity SLSMethods                            as projection on MARA
                                                    where
                                                            MARA.TYPE  = 'ZVHM'
                                                        and MARA.MATKL = '9901778';

    entity OrderItems                            as
        select from writingAppointments.SAPOrderItems as OI
        left join productmasterdata.Products as P
            on OI.product.ID = P.ID
        left join productmasterdata.ProductSizes as PS
            on OI.productSize.ID = PS.ID
        {
            key OI.writingAppointment,
            key OI.sapArticleNumber,
            key OI.shop,
                OI.orderQuantity,
                OI.orderNumber,
                OI.allocationNumber,
                OI.supplyType,
                OI.transportChain,
                OI.productionPlant,
                OI.incoTerm,
                OI.purchaseOrderText,
                OI.product,
                OI.documentType,
                OI.itemCategory,
                OI.storageLocation,
                OI.actionNumber,
                OI.countryOfProduction,
                OI.productSize,
                OI.splitRelevance,
                P.supplierColor,
                P.supplierProductNumber,
                PS.size_1,
                PS.size_2,
                PS.GTIN as size_GTIN
        };

    @readonly
    entity PlanningSizeItems                     as
        select from planning.PlanningProductsToPlanningSizes as PS
        inner join productmasterdata.Products as P
            on PS.product.ID = P.ID
        inner join productmasterdata.ProductSizes as PS2
            on          PS2.product.ID  =  PS.product.ID
            and         PS2.size_1.CODE =  PS.size_1.CODE
            and (
                        PS2.size_2.CODE =  PS.size_2.CODE
                or (
                        PS2.size_2.CODE is null
                    and PS.size_2.CODE  is null
                )
            )
        {
            key PS.writingAppointment,
            key PS.product.ID as product_ID,
            key PS.combinedSize,
                PS.houseGroup1,
                PS.houseGroup2,
                PS.houseGroup3,
                PS.houseGroup4,
                PS.houseGroup5,
                PS.houseGroup6,
                PS.houseGroup7,
                PS.houseGroup8,
                PS.houseGroup9,
                PS.houseGroup10,
                PS.houseGroup11,
                PS.houseGroup12,
                PS.houseGroup13,
                PS.houseGroup14,
                PS.houseGroup15,
                PS.totalAmount,
                P.*,
                PS.size_1,
                PS.size_2,
                PS2.GTIN      as size_GTIN,
                PS2.sapNumber as sapArticleNumber
        };

    @readonly
    entity SupplyTypes                           as projection on ZSTTA_SUP_TYPE;

    @readonly
    entity AllowedTargetSupplyTypes              as
        select from logistic.SupplyTypeTransitions as T
        inner join ZSTTA_SUP_TYPE as ST
            on T.toSupplyType.SUPPLY_TYPE = ST.SUPPLY_TYPE
        {
            key T.fromSupplyType.SUPPLY_TYPE as fromSupplyType_SUPPLY_TYPE,
            key ST.SUPPLY_TYPE,
                ST.DESCRIPTION,
                ST.BWVOR,
                ST.FPRFM_VZ,
                ST.FPRFM_FIL,
                ST.PRICAT_FPRFM
        };

    @readonly
    entity IncoTerms                             as projection on logistic.IncoTerms;

    @readonly
    entity ProductionPlants                      as projection on PRODUCTION_PLANT;

    @readonly
    entity ProductionPlantsVZ                    as projection on T001W;

    @readonly
    entity TransportChains                       as projection on WRF_PSCD_TCHAINH;

    @readonly
    entity AllocationMode                        as projection on writingAppointments.AllocationMode;

    @readonly
    entity ActionNumbers                          as projection on WAKH;
}
