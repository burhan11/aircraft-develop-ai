using AircraftService as service from '../../srv/aircraft/service';

annotate service.Aeroplanes with {
    model        @Common.Label: '{i18n>model}';
    manufacturer @Common.Label: '{i18n>manufacturer}';
    category     @Common.Label: '{i18n>category}';
    capacity     @Common.Label: '{i18n>capacity}';
    range        @title: '{i18n>range}';
};

annotate service.Aeroplanes with @(
    UI.LineItem: [
        {
            $Type : 'UI.DataField',
            Value : model,
        },
        {
            $Type : 'UI.DataField',
            Value : manufacturer,
        },
        {
            $Type : 'UI.DataField',
            Value : category,
        },
        {
            $Type : 'UI.DataField',
            Value : capacity,
        },
        {
            $Type : 'UI.DataField',
            Value : range,
        },
    ],
    UI.SelectionFields: [
        manufacturer,
        category,
        createdAt
    ]
);

