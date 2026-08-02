using ConsumerTopicBrandService as service from '../../srv/consumertopicbrand/consumertopicbrand-service';
using from '../../db/consumertopicbrand/schema';


annotate service.SupplierConsumerTopicBrands with @(
    Capabilities                       : {SearchRestrictions: {Searchable: false}},
    UI.Facets                          : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>GeneralInformation}',
            ID    : 'GeneralInformation',
            Target: '@UI.FieldGroup#GeneralInformation',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>LogisticTransport}',
            ID    : 'LogisticTransport',
            Target: '@UI.FieldGroup#LogisticTransport',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>SalesResources}',
            ID    : 'Sales',
            Target: '@UI.FieldGroup#Sales',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Programs}',
            ID    : 'Programs',
            Target: 'to_Programs/@UI.LineItem#Programs',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Wgsbszuordnung}',
            ID    : 'WGSBSZuordnung',
            Target: 'to_WG_SBS/@UI.LineItem#WGSBSZuordnung',
        },
    ],
    UI.FieldGroup #GeneralInformation  : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: topicComponent_ID,
                Label: '{i18n>TopicComponent}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplierContact,
                Label: '{i18n>LieferantenAnsprechpartner}',
            },
            {
                $Type: 'UI.DataField',
                Value: ownershipStatus_ID,
                Label: '{i18n>OwnershipStatus}',
            },
            {
                $Type: 'UI.DataField',
                Value: targetGroup_ID,
                Label: '{i18n>TargetGroup}',
            },
            {
                $Type: 'UI.DataField',
                Value: gridBox_ID,
                Label: '{i18n>9gridbox}',
            },
            {
                $Type: 'UI.DataField',
                Value: productType_ID,
                Label: '{i18n>ArticleType}',
            },
            {
                $Type: 'UI.DataField',
                Value: pricatCatalog_ID,
                Label: '{i18n>PricatKatalog}',
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.ConnectedFields#connected',
                Label : '{i18n>Vat}',
            },
            // {
            //     $Type: 'UI.DataField',
            //     Value: orderOption_ID,
            //     Label: '{i18n>Orderoption}',
            // },
            {
                $Type: 'UI.DataField',
                Value: priceLevel_ID,
                Label: '{i18n>PriceLevel}',
            },
            {
                $Type: 'UI.DataField',
                Value: comment,
                Label: '{i18n>product.comment}',
            }
        ],
    },
    UI.FieldGroup #LogisticTransport   : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: supplier.COUNTRY,
                Label: '{i18n>CountryOfOrigin}',
            },
            {
                $Type: 'UI.DataField',
                Value: productionPlant_PRODUCTIONPLANT,
                Label: '{i18n>Productionplant}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplier.TRANSPORT_CHAIN,
                Label: '{i18n>TransportChain}',
            },
            {
                $Type: 'UI.DataField',
                Value: shippingInstruction_ID,
                Label: '{i18n>ShippingInstruction}',
            },
            {
                $Type: 'UI.DataField',
                Value: loadingGroup_ID,
                Label: '{i18n>LoadingGroup}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplyType_SUPPLY_TYPE,
                Label: '{i18n>Supplytype}',
            },
            {
                Label: '{i18n>incoterm1}',
                $Type: 'UI.DataField',
                Value: supplier.INCO1,
            }
        /*{
            $Type: 'UI.DataField',
            Value: goodsDistribution_ID,
            Label: '{i18n>GoodDistribution}',
        },*/
        ],
    },
    UI.FieldGroup #Sales               : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: merchandiseSecurityMethod_ID,
                Label: '{i18n>MerchandiseSecurityMethod}',
            },
            {
                $Type: 'UI.DataField',
                Value: priceLabelMethod_ID,
                Label: '{i18n>PriceLabelMethod}',
            },
            {
                $Type: 'UI.DataField',
                Value: hangerMethod_ID,
                Label: '{i18n>HangerMethod}',
            },
        ],
    },
    UI.DataPoint #supplierID_supplierID: {
        $Type: 'UI.DataPointType',
        Value: supplier_ID,
        Title: '{i18n>Bbn}',
    },
    UI.HeaderFacets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : '_',
        Target: '@UI.FieldGroup#_',
    }, ],
    UI.FieldGroup #_                   : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: supplier.ID,
                Label: '{i18n>Supplier}',
            },
            {
                $Type: 'UI.DataField',
                Value: supplier_ID,
                Label: '{i18n>BBN}',
            },
            {
                $Type: 'UI.DataField',
                Value: brand_ID,
            },
        ],
    },
    UI.HeaderInfo                      : {
        Title         : {
            $Type: 'UI.DataField',
            Value: consumerTopic.ID,
        },
        TypeName      : '',
        TypeNamePlural: '',
    },
    UI.ConnectedFields #connected      : {
        $Type   : 'UI.ConnectedFieldsType',
        Template: '{vat_ID} -{vat_vat}',
        Data    : {
            $Type  : 'Core.Dictionary',
            vat_ID : {
                $Type: 'UI.DataField',
                Value: vat_ID,
            },
            vat_vat: {
                $Type: 'UI.DataField',
                Value: vat.vat,
            },
        },
    },
);

annotate service.SupplierConsumerTopicBrands with @(
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: supplier_ID,
            Label: '{i18n>BBN}',
        },
        {
            $Type: 'UI.DataField',
            Value: supplier.NAME,
            Label: '{i18n>Supplier}',
        },
        {
            $Type: 'UI.DataField',
            Value: brand_ID,
        },
    ],
    UI.SelectionFields           : [
        consumerTopic_ID,
        brand_ID,
        supplier_ID,
    ],

    UI.FieldGroup #CreationFields: {Data: [
        {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
            Label: '{i18n>ConsumerTopic}',
        },
        {
            $Type: 'UI.DataField',
            Value: supplier_ID,
            Label: '{i18n>Supplier}',
        },
        {
            $Type: 'UI.DataField',
            Value: brand_ID,
            Label: '{i18n>Brand}',
        },
    ]}
);

annotate service.SupplierConsumerTopicBrands with {
    // @Search.fuzzinessThreshold: 1.0
    consumerTopic @(
        Common.Label                   : '{i18n>ConsumerTopic}',
        Common.Text                    : {
            $value                : consumerTopic.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ConsumerTopics',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: consumerTopic_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.ValueListWithFixedValues: false,
    )
};

annotate service.ConsumerTopics with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }
};

annotate service.SupplierConsumerTopicBrands with {
    // @Search.fuzzinessThreshold: 1.0
    supplier @(
        Common.Label                   : '{i18n>Supplier}',
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Suppliers',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: supplier_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.ValueListWithFixedValues: false,
    )
};

annotate service.SupplierConsumerTopicBrands with {
    // @Search.fuzzinessThreshold: 1.0
    brand @(
        Common.Label                   : '{i18n>Brand}',
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Brands',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: brand_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : brand.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
    )
};

annotate service.Suppliers with {
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
    NAME @UI.MultiLineText: true
};

annotate service.SupplierConsumerTopicBrands with {
    topicComponent @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TopicComponents',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: topicComponent_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'HIERNODE5',
                }
            ],
        },
        Common.Text     : {
            $value                : topicComponent.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
    );
    priceLevel     @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PriceLevels',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: priceLevel_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        readonly,
        Common.Text     : {
            $value                : priceLevel.name,
            ![@UI.TextArrangement]: #TextLast
        }
    )
};

annotate service.TopicComponents with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }
};

annotate service.SupplierConsumerTopicBrands with {
    targetGroup @(
        Common.Text     : {
            $value                : targetGroup.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TargetGroups',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: targetGroup_ID,
                ValueListProperty: 'ID',
            }, ],
        },
    )
};

annotate service.TargetGroups with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    gridBox @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'NineGridBoxes',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: gridBox_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : gridBox.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.NineGridBoxes with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    goodsDistribution @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'GoodsDistributions',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: goodsDistribution_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : goodsDistribution.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.GoodsDistributions with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    shippingInstruction @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ShippingInstructions',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: shippingInstruction_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : shippingInstruction.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.ShippingInstructions with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    loadingGroup @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'LoadingGroups',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: loadingGroup_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : loadingGroup.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.LoadingGroups with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    merchandiseSecurityMethod @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'MerchandiseSecurityMethods',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: merchandiseSecurityMethod_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : merchandiseSecurityMethod.NAME,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.MerchandiseSecurityMethods with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    priceLabelMethod @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PriceLabelMethods',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: priceLabelMethod_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : priceLabelMethod.NAME,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.PriceLabelMethods with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    hangerMethod @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'HangerMethods',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: hangerMethod_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : hangerMethod.NAME,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.HangerMethods with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    ownershipStatus @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'OwnershipStatus',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: ownershipStatus_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : ownershipStatus.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.OwnershipStatus with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.Suppliers with {
    COUNTRY @Common.FieldControl: #ReadOnly
};

annotate service.Suppliers with {
    TRANSPORT_CHAIN @Common.FieldControl: #ReadOnly
};

annotate service.SupplierConsumerTopicBrands with {
    orderOption @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'OrderOptions',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: orderOption_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : orderOption.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.OrderOptions with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    pricatCatalog @(
        Common.Text     : {
            $value                : pricatCatalog_ID,
            ![@UI.TextArrangement]: #TextSeparate
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PricatCatalogs',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: pricatCatalog_ID,
                ValueListProperty: 'ID',
            }, ],
        },
    )
};

annotate service.SupplierConsumerTopicBrands with {
    productType @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductTypes',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: productType_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : productType.name,
            ![@UI.TextArrangement]: #TextLast,
        },
    )
};

annotate service.ProductTypes with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    supplyType      @(
        Common.Text     : {
            $value                : supplyType.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SupplyTypes',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: supplyType_SUPPLY_TYPE,
                ValueListProperty: 'SUPPLY_TYPE',
            }, ],
        },
    );
    productionPlant @(
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
};

annotate service.SupplierConsumerTopicBrands.to_Programs with @(UI.LineItem #Programs: [{
    $Type: 'UI.DataField',
    Value: program_ID,
    Label: '{i18n>Programid}',
}]);

annotate service.SupplierConsumerTopicBrands.to_Programs with {
    program @(
        Common.Text     : {
            $value                : program.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Programs',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: program_ID,
                ValueListProperty: 'ID',
            }, ],
        },
    )
};

annotate service.Programs with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands.to_WG_SBS with @(UI.LineItem #WGSBSZuordnung: [
    {
        $Type: 'UI.DataField',
        Value: assortmentModule_ID,
        Label: '{i18n>Assortmentmoduleid}',
    },
    {
        $Type: 'UI.DataField',
        Value: productGroup_ID,
        Label: '{i18n>Productgroupid}',
    }
]);

annotate service.SupplierConsumerTopicBrands.to_WG_SBS with {
    productGroup @(
        Common.Text     : {
            $value                : productGroup.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductGroups',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: productGroup_ID,
                ValueListProperty: 'ID',
            }, ],
        },
    )
};

annotate service.ProductGroups with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands.to_WG_SBS with {
    assortmentModule @(
        Common.Text     : {
            $value                : assortmentModule.NAME,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AssortmentModules',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: assortmentModule_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: up_.consumerTopic_ID,
                    ValueListProperty: 'HIERNODE5',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: up_.topicComponent_ID,
                    ValueListProperty: 'HIERNODE6',
                },
            ],
        },
    )
};

annotate service.AssortmentModules with {
    ID @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplierConsumerTopicBrands with {
    vat @(
        Common.Text     : {
            $value                : vat.name,
            ![@UI.TextArrangement]: #TextLast
        },
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VATs',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: vat_ID,
                ValueListProperty: 'ID',
            }, ],
        },
    )
};

annotate service.VATs with {
    ID @Common.Text: name
};

annotate service.ProductionPlants with {
    PRODUCTIONPLANT @Common.Text: {
        $value                : NAME1,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate service.SupplyTypes with {
    SUPPLY_TYPE @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast,
    }
};

/*annotate service.VATs with {
    vat @Common.FieldControl : #ReadOnly
};*/
