using PlanningService.OrderItems from '../../srv/pre-order-volume-planning/planning-service';

annotate PlanningService.OrderItems with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: orderNumber,
        Label: '{i18n>planning.sapOrderNumber}'
    },
    {
        $Type: 'UI.DataField',
        Value: orderQuantity,
        Label: '{i18n>product.orderQuantity}'
    },
    {
        $Type: 'UI.DataField',
        Value: sapArticleNumber,
        Label: '{i18n>product.sapArticleNumber}',
    },
    {
        $Type: 'UI.DataField',
        Value: shop,
        Label: '{i18n>shop}'
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
        Value: countryOfProduction,
    },
    {
        $Type: 'UI.DataField',
        Value: purchaseOrderText,
    },
    {
        $Type: 'UI.DataField',
        Value: supplyType,
        Label: '{i18n>supplyType}'
    },
    {
        $Type: 'UI.DataField',
        Value: supplierProductNumber,
        Label: '{i18n>product.supplierProductNumber}'
    },
    {
        $Type: 'UI.DataField',
        Value: supplierColor,
        Label: '{i18n>product.supplierColor}'
    },
    {
        $Type: 'UI.DataField',
        Value: size_1_CODE,
        Label: '{i18n>product.size1}'
    },
    {
        $Type: 'UI.DataField',
        Value: size_2_CODE,
        Label: '{i18n>product.size2}'
    },
    {
        $Type: 'UI.DataField',
        Value: size_GTIN,
        Label: '{i18n>product.GTIN}'
    },
    {
        $Type: 'UI.DataField',
        Value: allocationNumber,
        Label: '{i18n>order.allocationNumber}'
    }
], );

annotate PlanningService.OrderItems with {
    writingAppointment @UI.Hidden;
    product            @UI.Hidden;
    supplyType         @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SupplyTypes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
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
    incoTerm           @(
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
    transportChain     @(
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
    productionPlant    @(
        Common.Label    : '{i18n>Productionplant}',
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductionPlants',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: supplier_ID,
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
}
