using Check as service from '../../srv/check/check-service';

annotate service.Suppliers with {
    ID              @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME            @UI.HiddenFilter;
    COUNTRY         @UI.HiddenFilter;
    TRANSPORT_CHAIN @UI.HiddenFilter;
};

annotate service.Brands with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.ConsumerTopics with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.CombinedDataView with {
    statusName    @UI.HiddenFilter;
    status        @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductStatus',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: status_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : status.name,
            ![@UI.TextArrangement]: #TextOnly,
        },
    // UI.HiddenFilter                : true

    );

    brand         @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Brands',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: brand_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : brand.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    consumerTopic @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ConsumerTopics',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : consumerTopic.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    supplier      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Suppliers',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: supplier_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : supplier.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
}

annotate service.CombinedDataView with @(UI: {
    // Define the title for the List Report page
    HeaderInfo     : {
        TypeName      : 'Combined Entry',
        TypeNamePlural: 'Combined Entries',
        Title         : {
            $Type: 'UI.DataField',
            Value: name
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: entityType
        }
    },

    // Define the filter fields for the List Report page
    SelectionFields: [
        consumerTopic_ID,
        brand_ID,
        supplier_ID,
        date,
        status_ID
    ],

    // Define the columns for the table on the List Report page
    LineItem       : [

        {
            $Type: 'UI.DataField',
            Value: entityType,
            Label: '{i18n>type}'
        },
        {
            $Type: 'UI.DataField',
            Value: name,
            Label: '{i18n>ProductName}'
        },
        {
            $Type: 'UI.DataField',
            Value: date,
            Label: '{i18n>product.writingAppointmentStartDate}'
        },

        {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
            Label: '{i18n>ConsumerTopic}'
        },
        {
            $Type: 'UI.DataField',
            Value: brand_ID,
            Label: '{i18n>Brand}'
        },
        {
            $Type: 'UI.DataField',
            Value: supplier_ID,
            Label: '{i18n>Supplier}'
        },
        {
            $Type: 'UI.DataField',
            Value: GTIN,
            Label: '{i18n>product.GTIN}'
        },
        {
            $Type: 'UI.DataField',
            Value: statusName,
            Label: '{i18n>status}',
            CriticalityRepresentation: #WithIcon,
            Criticality              : Criticality
        },
        {
            $Type: 'UI.DataField',
            Value: sapHttpStatus,
            Label: '{i18n>sapHttpStatus}'
        },
        {
            $Type: 'UI.DataField',
            Value: sapHttpStatusText,
            Label: '{i18n>sapHttpStatusText}'
        },
        {
            $Type: 'UI.DataField',
            Value: sapStatus,
            Label: '{i18n>sapStatus}'
        },
        {
            $Type: 'UI.DataField',
            Value: sapStatusText,
            Label: '{i18n>sapStatusText}'
        },
        {
            $Type: 'UI.DataField',
            Value: sapTransactionId,
            Label: '{i18n>sapTransactionId}'
        }
    ]
});

annotate service.CombinedDataView with {
  statusCriticality @UI.DataPoint: {
    Value: statusName,
    Criticality: Criticality
  };
};

// Add labels to the individual properties for better UI texts (e.g., in filters)
annotate service.CombinedDataView with {
    sapHttpStatus     @title: '{i18n>sapHttpStatus}';
    sapHttpStatusText @title: '{i18n>sapHttpStatusText}';
    sapStatus         @title: '{i18n>sapStatus}';
    sapStatusText     @title: '{i18n>sapStatusText}';
    sapTransactionId  @title: '{i18n>sapTransactionId}';
    entityType        @title: '{i18n>type}';
    name              @title: '{i18n>ProductName}';
    consumerTopic     @title: '{i18n>ConsumerTopic}';
    brand             @title: '{i18n>Brand}';
    supplier          @title: '{i18n>Supplier}';
    status            @title: '{i18n>Status}';
    date              @title: '{i18n>product.writingAppointmentStartDate}';
}

annotate service.ProductStatus with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    Criticality @UI.HiddenFilter;
};
