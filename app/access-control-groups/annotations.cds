using AccessControlDataService as service from '../../srv/access-control-data/access-control-data-service';
annotate service.Groups with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>EntraGroup}',
                Value : ID,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : '{i18n>GeneralInformation}',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>ConsumerTopic}',
            ID : 'ConsumerTopics',
            Target : 'consumerTopics/@UI.LineItem#ConsumerTopics',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>EntraGroup}',
            Value : ID,
        },
    ],
);

annotate service.GroupsConsumerTopics with @(
    UI.LineItem #ConsumerTopics : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>ConsumerTopic}',
            Value : consumerTopic_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : consumerTopic.ID,
            Label : 'ID',
        },
    ]
);

