using PlanningService.Planning from '../../srv/pre-order-volume-planning/planning-service';

annotate PlanningService.Planning with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: date,
            Label: '{i18n>orderDate}',
        },
        {
            $Type: 'UI.DataField',
            Value: name,
            Label: '{i18n>product.writingAppointment}'
        },
        {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
        },
        {
            $Type: 'UI.DataField',
            Value: brand_ID
        },
        {
            $Type: 'UI.DataField',
            Value: purchaseVolume,
        },
        {
            $Type: 'UI.DataField',
            Value: status_ID,
        }


    ],
    UI.SelectionFields: [
        consumerTopic_ID,
        brand_ID,
        supplier_ID,
        status_ID,
        ID
    ]
);

annotate PlanningService.Planning with {
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
        },
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
    status        @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PlanningStatus',
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
        }
    );
    status_name   @UI.Hidden;
    productionPlant @readonly;


};


annotate PlanningService.Planning with {
    purchaseVolume       @(Common.Label: '{i18n>product.purchaseVolume}');
    brand                @(Common.Label: '{i18n>product.brand}');
    consumerTopic        @(Common.Label: '{i18n>product.consumerTopic}');
    supplier             @(Common.Label: '{i18n>product.supplier}');
    status               @(Common.Label: '{i18n>product.status}');
    productionPlant      @(Common.Label: '{i18n>ProductionplantVZ}');
    allocationMode       @(Common.Label: '{i18n>allocationMode}');
    consumerTopicShortID @(Common.Label: '{i18n>consumerTopicShortID}');
    date                 @(Common.Label: '{i18n>orderDate}');
    orderReleaseText     @(Common.Label: '{i18n>orderReleaseText}');
};

annotate PlanningService.Planning with {
    productionPlant @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductionPlantsVZ',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: productionPlant_WERKS,
                ValueListProperty: 'WERKS',
            },
            {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'KUNNR_NAME1',
            }],
        },
        Common.Text     : {
            $value                : productionPlant.KUNNR_NAME1,
            ![@UI.TextArrangement]: #TextOnly
        },
    );
    allocationMode  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AllocationMode',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: allocationMode_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                },
            ],
        },
        Common.Text     : {
            $value                : allocationMode.name,
            ![@UI.TextArrangement]: #TextOnly
        },
    );
};

annotate PlanningService.ConsumerTopics with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate PlanningService.Suppliers with {
    // @Search.fuzzinessThreshold: 1.0
    ID              @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME            @UI.HiddenFilter;
    TRANSPORT_CHAIN @UI.HiddenFilter;
};

annotate PlanningService.Brands with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate PlanningService.WritingAppointments with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @UI.Hidden
         @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
    date @UI.HiddenFilter;
};

annotate PlanningService.ProductGroups with {
    // @Search.fuzzinessThreshold: 1.0
    ID // @UI.Hidden
                @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME        @UI.HiddenFilter;
    DESCRIPTION @UI.HiddenFilter;
};

annotate PlanningService.EvaluationColors with {
    ID     @UI.Hidden
           @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name   @UI.HiddenFilter;
    number @UI.HiddenFilter;
};

annotate PlanningService.SeasonTypes with {
    ID          @UI.Hidden
                @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate PlanningService.Planning with {
    // @Search.fuzzinessThreshold: 1.0
    ID @UI.Hidden
       @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
};


annotate PlanningService.PlanningStatus with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate PlanningService.Suppliers with {
    COUNTRY @UI.HiddenFilter;
};

annotate PlanningService.BaseUnitOfMeasures with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate PlanningService.HouseGroups with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate PlanningService.Series with {
    ID  @Common.Text: {
        $value                : ID,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;

};

annotate PlanningService.ProductStatus with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    Criticality @UI.HiddenFilter;
};

// Search fields
annotate PlanningService.ConsumerTopics with @cds.search: {
    ID,
    NAME
};

annotate PlanningService.Suppliers with @cds.search: {
    ID,
    NAME
};

annotate PlanningService.Brands with @cds.search: {
    ID,
    NAME
};

annotate PlanningService.WritingAppointments with @cds.search: {
    ID,
    name
};

annotate PlanningService.ProductGroups with @cds.search: {
    ID,
    NAME
};

annotate PlanningService.EvaluationColors with @cds.search: {
    ID,
    name
};

annotate PlanningService.SeasonTypes with @cds.search: {
    ID,
    name
};

annotate PlanningService.Planning with @cds.search: {ID};

annotate PlanningService.PlanningStatus with @cds.search: {
    ID,
    name
};

annotate PlanningService.BaseUnitOfMeasures with @cds.search: {
    ID,
    name
};

annotate PlanningService.HouseGroups with @cds.search: {
    ID,
    name
};

annotate PlanningService.Series with @cds.search: {ID};

annotate PlanningService.ProductStatus with @cds.search: {
    ID,
    name
};

annotate PlanningService.SupplyTypes with {
    DESCRIPTION  @UI.HiddenFilter;
    FPRFM_VZ     @UI.HiddenFilter;
    FPRFM_FIL    @UI.HiddenFilter;
    PRICAT_FPRFM @UI.HiddenFilter;
    BWVOR        @UI.HiddenFilter;
    SUPPLY_TYPE  @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
};

annotate PlanningService.AllowedTargetSupplyTypes with {
    DESCRIPTION  @UI.HiddenFilter;
    FPRFM_VZ     @UI.HiddenFilter;
    FPRFM_FIL    @UI.HiddenFilter;
    PRICAT_FPRFM @UI.HiddenFilter;
    BWVOR        @UI.HiddenFilter;
    SUPPLY_TYPE  @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
};

annotate PlanningService.IncoTerms with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast,
    }
};

annotate PlanningService.ProductionPlantsVZ with {
    // @Search.fuzzinessThreshold: 1.0
    WERKS  @Common.Text: {
        $value                : KUNNR_NAME1,
        ![@UI.TextArrangement]: #TextOnly,
    }  @UI.HiddenFilter;
    WERKS  @UI.Hidden;
    NAME1  @UI.HiddenFilter;
    KUNNR  @UI.HiddenFilter;
};

annotate PlanningService.TransportChains with {
    TC_ID   @Common.Text: {
        $value                : TC_NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    TC_NAME @UI.HiddenFilter;
};

annotate PlanningService.AllocationMode with {
    ID  @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    };
};

annotate PlanningService.ActionNumbers with {
    AKART @UI.Hidden
};

annotate PlanningService.ProductionPlants with {
    PRODUCTIONPLANT @Common.Text: {
        $value                : NAME1,
        ![@UI.TextArrangement]: #TextLast,
    }
};
