using AccessControlDataService as service from '../../srv/access-control-data/access-control-data-service';

annotate service.GroupsConsumerTopics with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>EntraGroup}',
                Value: group_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>ConsumerTopic}',
                Value: consumerTopic_ID,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>EntraGroup}',
            Value: group.name,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>ConsumerTopic}',
            Value: consumerTopic_ID,
        }
    ],
    UI.HeaderInfo                : {
        Title         : {
            $Type: 'UI.DataField',
            Value: group_ID
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
        },
        TypeName      : '',
        TypeNamePlural: '',
    },
);

annotate service.GroupsConsumerTopics with {
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
        Common.Label    : '{i18n>ConsumerTopic}',
    );
    group         @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Groups',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: group_ID,
                ValueListProperty: 'ID',
            }],
        },
        Common.Label     : '{i18n>EntraGroup}'
    )
};

annotate service.ConsumerTopics with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.ConsumerTopics with @cds.search: {
    ID,
    NAME
};
