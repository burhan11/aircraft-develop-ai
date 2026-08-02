using WritingAppointmentService as service from '../../srv/writing-appointment/writing-appointment-service';

annotate service.WritingAppointments with @(
    UI.FieldGroup #General: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: name,
                Label: '{i18n>Name}',
            },
            {
                $Type: 'UI.DataField',
                Value: consumerTopic_ID,

            },
            {
                $Type: 'UI.DataField',
                Value: brand_ID,
            },
            {
                $Type: 'UI.DataField',
                Value: supplier_ID,
            },
            {
                $Type: 'UI.DataField',
                Value: date,
                Label: '{i18n>AppointmentDate}',
            },
            {
                $Type: 'UI.DataField',
                Value: consumerTopicShortID,
                Label: '{i18n>consumerTopicShortID}',
            },
            {
                $Type: 'UI.DataField',
                Value: productionPlant_WERKS,
                Label: '{i18n>ProductionplantVZ}',
            },
            {
                $Type: 'UI.DataField',
                Value: allocationMode_ID,
            },
        ],
    },
    UI.Facets             : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'Allgemein',
            Target: '@UI.FieldGroup#General',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Products}',
            ID    : 'Products',
            Target: 'to_Products/@UI.LineItem#Products',
        }
    ],
    UI.LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Value: date,
        },
        {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: brand_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: supplier_ID,
        },
    ],
    UI.SelectionFields    : [
        date,
        consumerTopic_ID,
        brand_ID,
        supplier_ID
    ],
    UI.HeaderInfo         : {
        Title         : {
            $Type: 'UI.DataField',
            Value: name,
        },
        TypeName      : '',
        TypeNamePlural: '',
    },
);



annotate service.WritingAppointments with {
    sapHttpStatus        @UI.Hidden: true;
    sapHttpStatusText    @UI.Hidden: true;
    sapStatus            @UI.Hidden: true;
    sapStatusText        @UI.Hidden: true;
    sapTransactionId     @UI.Hidden: true;
    purchaseVolume       @UI.Hidden: true;
    sapOrderNumber       @(Common.Label: '{i18n>sapOrderNumber}');
    consumerTopicShortID @readonly : true;
    name                 @(Common.Label: '{i18n>WritingAppointment}');
    date                 @(Common.Label: '{i18n>AppointmentDate}');
    consumerTopic        @(Common.Label: '{i18n>ConsumerTopic}');
    brand                @(Common.Label: '{i18n>Brand}');
    supplier             @(Common.Label: '{i18n>Supplier}');
    status               @(Common.Label: '{i18n>Status}');
    allocationMode       @(Common.Label: '{i18n>allocationMode}');
    productionPlant      @(Common.Label: '{i18n>ProductionplantVZ}');
};


annotate service.WritingAppointments with {
    consumerTopic @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ConsumerTopics',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                },
            ],
        },
        Common.Text     : {
            $value                : consumerTopic.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
    )
};

annotate service.WritingAppointments with {
    supplier         @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Suppliers',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: supplier_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                },
            ],
        },
        Common.Text     : {
            $value                : supplier.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
    );
    productionPlant  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductionPlantsVZ',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: productionPlant_WERKS,
                ValueListProperty: 'WERKS',
            }],
        },
        Common.Text     : {
            $value                : productionPlant.KUNNR_NAME1,
            ![@UI.TextArrangement]: #TextOnly
        },
    )     @readonly;
};

annotate service.WritingAppointments with {
    brand          @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Brands',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: brand_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                },
            ],
        },
        Common.Text     : {
            $value                : brand.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
    );
    status         @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PlanningStatus',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: status_ID,
                ValueListProperty: 'ID',
            }],
        },
        Common.Text     : {
            $value                : status.name,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
    allocationMode @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AllocationMode',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: allocationMode_ID,
                ValueListProperty: 'ID',
            }],
        },
        Common.Text     : {
            $value                : allocationMode.name,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
};

annotate service.ConsumerTopics with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.Brands with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.Suppliers with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.IncoTerms with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.ProductsToWritingAppointments with @(UI.LineItem #Products: [
    {
        $Type: 'UI.DataField',
        Value: product.supplierProductNumber,
        Label: '{i18n>product.supplierProductNumber}',
    },
    {
        $Type: 'UI.DataField',
        Value: product.supplyType_SUPPLY_TYPE,
        Label: '{i18n>product.supplyType}',
    },
    {
        $Type: 'UI.DataField',
        Value: product.ownershipStatus_ID,
        Label: '{i18n>product.ownershipStatus}',
    },
    {
        $Type: 'UI.DataField',
        Value: product.storageLocation_LGORT,
        Label: '{i18n>StorageLocation}',
    },
    {
        $Type: 'UI.DataField',
        Value: product.productionPlant_PRODUCTIONPLANT,
        Label: '{i18n>product.productionPlant}',
    },
    {
        $Type: 'UI.DataField',
        Value: product.shippingPort_ID,
        Label: '{i18n>product.shippingPort}',
    },
    {
        $Type: 'UI.DataField',
        Value: deliveryDateVZ,
        Label: '{i18n>DeliveryDate}'
    },
    {
        $Type: 'UI.DataField',
        Value: deliveryDateShop,
        Label: '{i18n>DeliveryDateShop}'
    }
]);

annotate service.PlanningStatus with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly,
    }
};

annotate service.AllocationMode with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly,
    }
};

annotate service.SupplyTypes with {
    SUPPLY_TYPE @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    }
};

annotate service.OwnershipStatus with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.StorageLocations with {
    // @Search.fuzzinessThreshold: 1.0
    LGORT  @Common.Text: {
        $value                : LGOBE,
        ![@UI.TextArrangement]: #TextLast,
    }  @UI.HiddenFilter;
    LGOBE  @UI.HiddenFilter;
};

annotate service.ProductionPlantsVZ with {
    // @Search.fuzzinessThreshold: 1.0
    WERKS  @Common.Text: {
        $value                : KUNNR_NAME1,
        ![@UI.TextArrangement]: #TextOnly,
    }  @UI.HiddenFilter;
    WERKS  @UI.Hidden;
    NAME1  @UI.HiddenFilter;
    KUNNR  @UI.HiddenFilter;
};

annotate service.ShippingPorts with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};
