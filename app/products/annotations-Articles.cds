using Product as service from '../../srv/product/product-service';

annotate service.Articles with {
    supplier          @(
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
                },
            ],
        },
        Common.Text     : {
            $value                : supplier.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    consumerTopic     @(
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

    brand             @(
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

    targetGroup       @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TargetGroups',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: targetGroup_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : targetGroup.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    topicComponent    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'TopicComponents',
            SearchSupported,
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
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : topicComponent.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    assortmentModule  @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'WG_SBS',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: supplier_ID,
                    ValueListProperty: 'up__supplier_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'up__consumerTopic_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: brand_ID,
                    ValueListProperty: 'up__brand_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: topicComponent_ID,
                    ValueListProperty: 'topicComponent_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: assortmentModule_ID,
                    ValueListProperty: 'assortmentModule_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'assortmentModule_NAME',
                },

            ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : assortmentModule.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    sizeSystem        @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SizeSystems',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: sizeSystem_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : sizeSystem.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    gridBox           @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'NineGridBoxes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: gridBox_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : gridBox.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    // priceLevel        @(
    //     Common.ValueList               : {
    //         $Type         : 'Common.ValueListType',
    //         CollectionPath: 'PriceLevels',
    //         SearchSupported,
    //         Parameters    : [{
    //             $Type            : 'Common.ValueListParameterInOut',
    //             LocalDataProperty: priceLevel_ID,
    //             ValueListProperty: 'ID',
    //         }],
    //     },
    //     Common.Text                    : {
    //         $value                : priceLevel.name,
    //         ![@UI.TextArrangement]: #TextLast
    //     }
    // );

    status            @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductStatus',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: status_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : status.name,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
    module            @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Modules',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: module_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : module.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    omnichannel       @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Omnichannels',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: omnichannel_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : omnichannel.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    presentationType  @(
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

    occasion          @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Occasions',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: occasion_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : occasion.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    property          @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Properties',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: property_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : property.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    quality           @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Qualities',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: quality_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : quality.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    surfaceWashing    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SurfaceWashings',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: surfaceWashing_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : surfaceWashing.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    mainForm          @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'MainForms',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: mainForm_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : mainForm.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    stockingThickness @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'StockingThickness',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: stockingThickness_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : stockingThickness.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
};

annotate service.Articles with {
    // Annotate each property that will be used as a filter
    ID          @(Common.Label: '{i18n>product.ID}');

    name        @(Common.Label: '{i18n>product.name}');

    status      @(Common.Label: '{i18n>product.status}');

    // This is especially important for association fields
    supplier    @(Common.Label: '{i18n>product.supplier}');

    brand       @(Common.Label: '{i18n>product.brand}');

    seasonYear  @(Common.Label: '{i18n>product.seasonYear}')  @Common.IsCalendarYear;

    addHangTag  @(Common.Label: '{i18n>product.addHangTag}');
    isImported  @Common.Label: '{i18n>product.isImported}';
    isImported  @readonly    : true;

}


//List report values
annotate service.Articles with {
    houseGroup                   @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'HouseGroups',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: houseGroup_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : houseGroup.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    supplyType                   @(
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
                }
            ],
        },
        Common.Text     : {
            $value                : supplyType.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    seasonType                   @(
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
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    pricatCatalog                @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PricatCatalogs',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: pricatCatalog_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : pricatCatalog.ID,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    productType                  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ProductTypes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: productType_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : productType.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    ownershipStatus              @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'OwnershipStatus',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: ownershipStatus_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : ownershipStatus.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    shippingInstruction          @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ShippingInstructions',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: shippingInstruction_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : shippingInstruction.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    material1                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Materials',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: material1_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : material1.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    material2                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Materials',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: material2_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : material2.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    material3                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Materials',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: material3_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : material3.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    material4                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Materials',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: material4_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : material4.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    material5                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Materials',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: material5_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : material5.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    shippingPort                 @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'ShippingPorts',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: shippingPort_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : shippingPort.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    transportChain                 @(
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
    productionPlant              @(
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
    storageLocation              @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'StorageLocations',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: storageLocation_LGORT,
                    ValueListProperty: 'LGORT',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'LGOBE',
                }
            ],
        },
        Common.Text     : {
            $value                : storageLocation.LGOBE,
            ![@UI.TextArrangement]: #TextLast,
        },
    );
    // differingIncoTerm   @(
    //     Common.ValueList: {
    //         $Type         : 'Common.ValueListType',
    //         CollectionPath: 'IncoTerms',
    //         SearchSupported,
    //         Parameters    : [
    //             {
    //                 $Type            : 'Common.ValueListParameterInOut',
    //                 LocalDataProperty: differingIncoTerm_ID,
    //                 ValueListProperty: 'ID',
    //             },
    //             {
    //                 $Type            : 'Common.ValueListParameterDisplayOnly',
    //                 ValueListProperty: 'name',
    //             }
    //         ],
    //     },
    //     Common.Text     : {
    //         $value                : differingIncoTerm.name,
    //         ![@UI.TextArrangement]: #TextLast,
    //     }
    // );
    mainLabel                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: mainLabel_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : mainLabel.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    subLabel                     @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: subLabel_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : subLabel.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    addHangTag                   @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: addHangTag_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : addHangTag.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    sizeLabel                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: sizeLabel_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : sizeLabel.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    sizeCode                     @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: sizeCode_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : sizeCode.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    hangTag                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: hangTag_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : hangTag.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    stringWithSeal               @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: stringWithSeal_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : stringWithSeal.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    priceSticker                 @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: priceSticker_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : priceSticker.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    careLabel                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VKHMs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: careLabel_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : careLabel.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    series                       @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Series',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: series_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : series.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    license                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Licenses',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: license_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : license.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    // program             @(
    //     Common.ValueList: {
    //         $Type         : 'Common.ValueListType',
    //         CollectionPath: 'Programs',
    //         SearchSupported,
    //         Parameters    : [
    //             {
    //                 $Type            : 'Common.ValueListParameterInOut',
    //                 LocalDataProperty: program_ID,
    //                 ValueListProperty: 'ID',
    //             },
    //             {
    //                 $Type            : 'Common.ValueListParameterDisplayOnly',
    //                 ValueListProperty: 'NAME',
    //             }
    //         ],
    //     },
    //     Common.Text     : {
    //         $value                : program.NAME,
    //         ![@UI.TextArrangement]: #TextLast,
    //     }
    // );
    program                      @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'WGPROGRAMS',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: supplier_ID,
                    ValueListProperty: 'up__supplier_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'up__consumerTopic_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: brand_ID,
                    ValueListProperty: 'up__brand_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: program_ID,
                    ValueListProperty: 'program_ID',
                },

                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'program_NAME',
                }
            ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : program.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    pattern                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Patterns',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: pattern_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : pattern.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    vat                          @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'VATs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: vat_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : vat.name,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
    currency                     @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Currencies',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: currency_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : currency.name,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
    uvpType                      @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'UVPTypes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: uvpType_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : uvpType.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    specialProduct               @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SpecialProducts',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: specialProduct_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : specialProduct.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    sustainabilitySealOfApproval @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SustainabilitySealOfApprovals',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: sustainabilitySealOfApproval_GSNR,
                    ValueListProperty: 'GSNR',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'GSNR_KTXT',
                }
            ],
        },
        Common.Text     : {
            $value                : sustainabilitySealOfApproval.GSNR_KTXT,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    merchandiseSecurityMethod    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'MerchandiseSecurityMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: merchandiseSecurityMethod_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : merchandiseSecurityMethod.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    priceLabelMethod             @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'PriceLabelMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: priceLabelMethod_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : priceLabelMethod.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    hangerMethod                 @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'HangerMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: hangerMethod_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : hangerMethod.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    loadingGroup                 @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'LoadingGroups',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: loadingGroup_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : loadingGroup.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    washing                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'WashingMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: washing_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : washing.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    bleaching                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'BleachingMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: bleaching_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : bleaching.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    ironing                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'IroningMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: ironing_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : ironing.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    cleaning                     @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'CleaningMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: cleaning_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : cleaning.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    drying                       @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'DryingMethods',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: drying_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : drying.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    // purchaseGroup       @(
    //     Common.ValueList: {
    //         $Type         : 'Common.ValueListType',
    //         CollectionPath: 'PurchaseGroups',
    //         SearchSupported,
    //         Parameters    : [
    //             {
    //                 $Type            : 'Common.ValueListParameterInOut',
    //                 LocalDataProperty: purchaseGroup_ID,
    //                 ValueListProperty: 'ID',
    //             },
    //             {
    //                 $Type            : 'Common.ValueListParameterDisplayOnly',
    //                 ValueListProperty: 'name',
    //             }
    //         ],
    //     },
    //     Common.Text     : {
    //         $value                : purchaseGroup.name,
    //         ![@UI.TextArrangement]: #TextLast,
    //     }
    // );

    // productGroup        @(
    //     Common.ValueList: {
    //         $Type         : 'Common.ValueListType',
    //         CollectionPath: 'ProductGroups',
    //         SearchSupported,
    //         Parameters    : [
    //             {
    //                 $Type            : 'Common.ValueListParameterInOut',
    //                 LocalDataProperty: productGroup_ID,
    //                 ValueListProperty: 'ID',
    //             },
    //             {
    //                 $Type            : 'Common.ValueListParameterDisplayOnly',
    //                 ValueListProperty: 'name',
    //             }
    //         ],
    //     },
    //     Common.Text     : {
    //         $value                : productGroup.name,
    //         ![@UI.TextArrangement]: #TextLast,
    //     }
    // );
    productGroup                 @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'WG_SBS',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: supplier_ID,
                    ValueListProperty: 'up__supplier_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'up__consumerTopic_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: brand_ID,
                    ValueListProperty: 'up__brand_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: assortmentModule_ID,
                    ValueListProperty: 'assortmentModule_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: productGroup_ID,
                    ValueListProperty: 'productGroup_ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'productGroup_NAME',
                }
            ],
        },
        Common.ValueListWithFixedValues: false,
        Common.Text                    : {
            $value                : productGroup.NAME,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    baseUnitOfMeasure            @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'BaseUnitOfMeasures',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: baseUnitOfMeasure_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : baseUnitOfMeasure.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    orderUnit                    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'BaseUnitOfMeasures',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: orderUnit_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : orderUnit.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    storageUnit                  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'StorageUnitOfMeasures',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: storageUnit_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : storageUnit.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    storageUnitConversionUnit    @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'BaseUnitOfMeasures',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: storageUnitConversionUnit_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : storageUnitConversionUnit.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
}

// annotate service.ArticlestatusSummary with @(UI: {Chart: {
//     $Type              : 'UI.ChartDefinitionType',
//      Legend: {
//             Visible: false
//         },
//     ChartType          : #Column,
//     Measures : [
//             'count_red',
//             'count_orange',
//             'count_green'
//         ],

//         MeasureAttributes : [
//             {
//                 Measure : 'count_red',
//                 Role    : #Axis1,
//                 DataPoint : '@UI.DataPoint#Red'
//             },
//             {
//                 Measure : 'count_orange',
//                 Role    : #Axis1,
//                 DataPoint : '@UI.DataPoint#Orange'
//             },
//             {
//                 Measure : 'count_green',
//                 Role    : #Axis1,
//                 DataPoint : '@UI.DataPoint#Green'
//             }
//         ],
//     Dimensions         : ['status_ID'],
//     DimensionAttributes: [{
//         $Type    : 'UI.ChartDimensionAttributeType',
//         Dimension: 'status_ID',
//         Role     : #Category
//     }]
// }});

// annotate service.ArticlestatusSummary with @(
//     UI.DataPoint#StatusCount: {
//         Value      : count,
//         Criticality: Criticality
//     }
// );

// annotate service.ArticlestatusSummary with @(
//     UI.DataPoint#Red: {
//         Value      : count_red ,
//         Criticality: #Negative
//     },
//     UI.DataPoint#Orange: {
//         Value      : count_orange,
//         Criticality: #Critical
//     },
//     UI.DataPoint#Green: {
//         Value      : count_green,
//         Criticality: #Positive
//     }
// );

// annotate service.ArticlestatusSummary with {
//     count_red    @Common.Label: '';
//     count_orange @Common.Label: '';
//     count_green  @Common.Label: '';
// };


// annotate service.ArticlestatusSummary with {

//     status_ID        @(
//         Common.ValueList: {
//             $Type         : 'Common.ValueListType',
//             CollectionPath: 'ProductStatus',
//             SearchSupported,
//             Parameters    : [
//                 {
//                     $Type            : 'Common.ValueListParameterInOut',
//                     LocalDataProperty: status_ID,
//                     ValueListProperty: 'ID',
//                 },
//                 {
//                     $Type            : 'Common.ValueListParameterDisplayOnly',
//                     ValueListProperty: 'name',
//                 }
//             ],
//         },
//         Common.Text     : {
//             $value                : status_name,
//             ![@UI.TextArrangement]: #TextOnly,
//         }
//     );

//     brand_ID         @(
//         Common.ValueList: {
//             $Type         : 'Common.ValueListType',
//             CollectionPath: 'Brands',
//             SearchSupported,
//             Parameters    : [
//                 {
//                     $Type            : 'Common.ValueListParameterInOut',
//                     LocalDataProperty: brand_ID,
//                     ValueListProperty: 'ID',
//                 },
//                 {
//                     $Type            : 'Common.ValueListParameterDisplayOnly',
//                     ValueListProperty: 'NAME',
//                 }
//             ],
//         },
//         Common.Text     : {
//             $value                : brand.NAME,
//             ![@UI.TextArrangement]: #TextLast,
//         }
//     );

//     consumerTopic_ID @(
//         Common.ValueList: {
//             $Type         : 'Common.ValueListType',
//             CollectionPath: 'ConsumerTopics',
//             SearchSupported,
//             Parameters    : [
//                 {
//                     $Type            : 'Common.ValueListParameterInOut',
//                     LocalDataProperty: consumerTopic_ID,
//                     ValueListProperty: 'ID',
//                 },
//                 {
//                     $Type            : 'Common.ValueListParameterDisplayOnly',
//                     ValueListProperty: 'NAME',
//                 }
//             ],
//         },
//         Common.Text     : {
//             $value                : consumerTopic.NAME,
//             ![@UI.TextArrangement]: #TextLast,
//         }
//     );

//     supplier_ID      @(
//         Common.ValueList: {
//             $Type         : 'Common.ValueListType',
//             CollectionPath: 'Suppliers',
//             SearchSupported,
//             Parameters    : [
//                 {
//                     $Type            : 'Common.ValueListParameterInOut',
//                     LocalDataProperty: supplier_ID,
//                     ValueListProperty: 'ID',
//                 },
//                 {
//                     $Type            : 'Common.ValueListParameterDisplayOnly',
//                     ValueListProperty: 'NAME',
//                 }
//             ],
//         },
//         Common.Text     : {
//             $value                : supplier.NAME,
//             ![@UI.TextArrangement]: #TextLast,
//         }
//     );
// }

// annotate service.ConsumerTopics with @cds.search: {
//     ID,
//     NAME
// };
