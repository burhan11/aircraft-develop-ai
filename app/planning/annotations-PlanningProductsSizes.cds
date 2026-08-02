using PlanningService as service from '../../srv/pre-order-volume-planning/planning-service';

annotate service.PlanningProductSizes with {
    houseGroup            @sap.updatable: false;
    supplierColor         @sap.updatable: false;
    evaluationColor       @sap.updatable: false;
    supplierProductName   @sap.updatable: false;
    supplierProductNumber @sap.updatable: false;
    productGroup          @sap.updatable: false;
    seasonType            @sap.updatable: false;
    presentationType      @sap.updatable: false;
    ownershipStatus       @sap.updatable: false;
    sizeKey               @sap.updatable: false;
    differingSizeKey      @sap.updatable: false;
    size_1                @sap.updatable: false;
    size_2                @sap.updatable: false;
    transportChain        @sap.updatable: false;
    incoTerm              @sap.updatable: false;
    productionPlant       @sap.updatable: false;
    supplyType            @sap.updatable: false;
}

annotate service.ProductSizesWithoutExpands with {
    imageUrl              @sap.updatable: false;
    evaluationColor       @sap.updatable: false;
    productGroup          @sap.updatable: false;
    supplierProductNumber @sap.updatable: false;
    supplierProductName   @sap.updatable: false;
    houseGroup            @sap.updatable: false;
    isImported            @sap.updatable: false;
    size_1                @sap.updatable: false;
    size_2                @sap.updatable: false;
};

annotate service.ProductSizesWithoutExpands {
    imageUrl              @Common.Label: '{i18n>product.imageUrl}';
    productGroup          @Common.Label: '{i18n>product.productGroup}';
    supplierProductNumber @Common.Label: '{i18n>product.supplierProductNumber}';
    supplierProductName   @Common.Label: '{i18n>product.supplierProductName}';
    supplierColor         @Common.Label: '{i18n>product.supplierColor}';
    evaluationColor       @Common.Label: '{i18n>product.evaluationColor}';
    seasonType            @Common.Label: '{i18n>planning.seasonType}';
    isImported            @Common.Label: '{i18n>product.isImported}';
    size_1                @Common.Label: '{i18n>product.size_1}';
    size_2                @Common.Label: '{i18n>product.size_2}';
}


annotate service.ProductSizesWithoutExpands with {
    productGroup     @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductGroups',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: productGroup_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    LocalDataProperty: productGroup_ID,
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : productGroup.NAME,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );

    evaluationColor  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'EvaluationColors',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: evaluationColor_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : evaluationColor.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    seasonType       @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SeasonTypes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: seasonType_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : seasonType.name,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
    presentationType @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PresentationTypes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: presentationType_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : presentationType.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
};


annotate service.PlanningProductSizes {
    productSize               @Common.Label: '{i18n>ProductID}';
    purchasePrice         @Common.Label: '{i18n>planning.purchasePrice}';
    purchaseDiscount      @Common.Label: '{i18n>planning.purchaseDiscount}';
    salesPrice            @Common.Label: '{i18n>planning.salesPrice}';
    deliveryDateVZ        @Common.Label: '{i18n>DeliveryDate}';
    houseGroup1           @Common.Label: '{i18n>planning.houseGroup1}';
    houseGroup2           @Common.Label: '{i18n>planning.houseGroup2}';
    houseGroup3           @Common.Label: '{i18n>planning.houseGroup3}';
    houseGroup4           @Common.Label: '{i18n>planning.houseGroup4}';
    houseGroup5           @Common.Label: '{i18n>planning.houseGroup5}';
    houseGroup6           @Common.Label: '{i18n>planning.houseGroup6}';
    houseGroup7           @Common.Label: '{i18n>planning.houseGroup7}';
    houseGroup8           @Common.Label: '{i18n>planning.houseGroup8}';
    houseGroup9           @Common.Label: '{i18n>planning.houseGroup9}';
    houseGroup10          @Common.Label: '{i18n>planning.houseGroup10}';
    houseGroup11          @Common.Label: '{i18n>planning.houseGroup11}';
    houseGroup12          @Common.Label: '{i18n>planning.houseGroup12}';
    houseGroup13          @Common.Label: '{i18n>planning.houseGroup13}';
    houseGroup14          @Common.Label: '{i18n>planning.houseGroup14}';
    houseGroup15          @Common.Label: '{i18n>planning.houseGroup15}';
    totalAmount           @Common.Label: '{i18n>planning.totalAmount}';
    sizeKey               @Common.Label: '{i18n>product.sizeKey}';
    differingSizeKey      @Common.Label: '{i18n>product.differingSizeKey}';
    index                 @Common.Label: '{i18n>Index}';
    totalPurchaseAmount   @Common.Label: '{i18n>product.purchaseVolume}';
    evaluationColor       @(
        Common.Label    : '{i18n>product.evaluationColor}',
        Common.Text     : {
            $value                : evaluationColor.name,
            ![@UI.TextArrangement]: #TextLast,
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'EvaluationColors',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: evaluationColor_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                },
            ],
        },
    );
    productGroup          @Common.Label: '{i18n>product.productGroup}';
    supplierColor         @Common.Label: '{i18n>product.supplierColor}';
    supplierProductName   @Common.Label: '{i18n>product.supplierProductName}';
    supplierProductNumber @Common.Label: '{i18n>product.supplierProductNumber}';
    presentationType      @(
        Common.Label    : '{i18n>product.presentationType}',
        Common.Text     : {
            $value                : presentationType.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PresentationTypes',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: presentationType_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
    );
    seasonType            @Common.Label: '{i18n>planning.seasonType}';

    writingAppointment    @UI.Hidden;
    productSize_supplyType  @UI.Hidden;
}

annotate service.PlanningProductSizes with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: deliveryDateVZ,
        },
        {
            $Type: 'UI.DataField',
            Value: productSize.isImported,
        },
        {
            $Type: 'UI.DataField',
            Value: productSize.imageUrl,
        },
        {
            $Type: 'UI.DataField',
            Value: supplyType_SUPPLY_TYPE,
        },
        {
            $Type: 'UI.DataField',
            Value: incoTerm_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: productionPlant_PRODUCTIONPLANT,
        },
        {
            $Type: 'UI.DataField',
            Value: transportChain_TC_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: actionNumber_AKTNR,
        },
        {
            $Type: 'UI.DataField',
            Value: ownershipStatus_ID
        },
        {
            $Type: 'UI.DataField',
            Value: countryOfProduction,
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseOrderText,
        },
        {
            $Type: 'UI.DataField',
            Value: productGroup_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: supplierProductName,
        },
        {
            $Type: 'UI.DataField',
            Value: supplierProductNumber,
        },
        {
            $Type: 'UI.DataField',
            Value: evaluationColor_ID,
        },

        {
            $Type: 'UI.DataField',
            Value: supplierColor,
        },
        {
            $Type: 'UI.DataField',
            Value: purchasePrice,
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseDiscount,
        },
        {
            $Type: 'UI.DataField',
            Value: salesPrice,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: seasonType_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: presentationType_CODE,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>product.size_1}',
            Value: size_1_CODE,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>product.size_2}',
            Value: size_2_CODE,
        },
        {
            $Type: 'UI.DataField',
            Value: totalAmount,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup1,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup2,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup3,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup4,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup5,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup6,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup7,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup8,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup9,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup10,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup11,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup12,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup13,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup14,
        },
        {
            $Type: 'UI.DataField',
            Value: houseGroup15,
        },


    ],
    UI.SelectionFields: [
        productSize.evaluationColor_ID,
        productSize.seasonType_ID,
        productSize.productGroup_ID
    ],
);

annotate service.PlanningProductSizes with {
    productGroup    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductGroups',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: productGroup_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : productGroup.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    supplyType      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AllowedTargetSupplyTypes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: productSize_supplyType_SUPPLY_TYPE,
                    ValueListProperty: 'fromSupplyType_SUPPLY_TYPE',
                },
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: supplyType_SUPPLY_TYPE,
                    ValueListProperty: 'SUPPLY_TYPE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : supplyType.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    incoTerm        @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'IncoTerms',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: incoTerm_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                },
            ],
        },
        Common.Text     : {
            $value                : incoTerm.name,
            ![@UI.TextArrangement]: #TextLast
        },
    );
    transportChain  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TransportChains',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: transportChain_TC_ID,
                    ValueListProperty: 'TC_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'TC_NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : transportChain.TC_NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    productionPlant @(
        Common.Label    : '{i18n>Productionplant}',
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductionPlants',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: product.supplier_ID,
                    ValueListProperty: 'SUPPLIER',
                },
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: productionPlant_PRODUCTIONPLANT,
                    ValueListProperty: 'PRODUCTIONPLANT',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME1',
                }
            ],
        },
        Common.Text     : {
            $value                : productionPlant.NAME1,
            ![@UI.TextArrangement]: #TextLast,
        },
    );
    // actionNumber    @(Common.ValueList: {
    //     $Type         : 'Common.ValueListType',
    //     CollectionPath: 'ActionNumbers',
    //     SearchSupported,
    //     Parameters    : [{
    //         $Type            : 'Common.ValueListParameterInOut',
    //         LocalDataProperty: actionNumber_AKTNR,
    //         ValueListProperty: 'AKTNR',
    //     }, ],
    // });
};
