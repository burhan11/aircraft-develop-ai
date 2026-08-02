using PlanningService from '../../srv/pre-order-volume-planning/planning-service';

//List report default columns
annotate PlanningService.Products with @(
    UI.LineItem       : [
        // {
        //     $Type: 'UI.DataFieldWithUrl',
        //     Value: imageUrl,
        // },
        {
            $Type: 'UI.DataField',
            Value: supplierProductNumber,
            Label: '{i18n>product.supplierProductNumber}'
        },
        {
            $Type: 'UI.DataField',
            Value: supplier_ID,
            Label: '{i18n>product.supplier}'

        },
        {
            $Type: 'UI.DataField',
            Value: consumerTopic_ID,
            Label: '{i18n>product.consumerTopic}'
        },
        {
            $Type: 'UI.DataField',
            Value: brand_ID,
            Label: '{i18n>product.brand}'
        },
        {
            $Type: 'UI.DataField',
            Value: status_ID,
            Label: '{i18n>product.status}'
        },
        {
            $Type: 'UI.DataField',
            Value: writingAppointmentName,
            Label: '{i18n>product.writingAppointment}'
        },
        {
            $Type: 'UI.DataField',
            Value: deliveryDate,
            Label: '{i18n>DeliveryDate}'
        }
    ],
    UI.SelectionFields: [
        supplier_ID,
        consumerTopic_ID,
        brand_ID,
        writingAppointmentName,
        status_ID,
    ]
);

//List report values
annotate PlanningService.Products with {
    writingAppointmentName       @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'WritingAppointments',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: writingAppointmentName,
                ValueListProperty: 'name',
            }, ],
        },
        Common.Text     : {
            $value                : writingAppointmentName,
            ![@UI.TextArrangement]: #TextOnly,
        }
    );
    evaluationColor              @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'product.EvaluationColors',
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
    sizeRun                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'product.SizeRuns',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: sizeRun_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : sizeRun.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    supplyType                   @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'SupplyTypes',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: supplyType_SUPPLY_TYPE,
                ValueListProperty: 'SUPPLY_TYPE',
            }, ],
        },
        Common.Text     : {
            $value                : supplyType.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    seasonType                   @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'classification.SeasonTypes',
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
            CollectionPath: 'classification.PricatCatalogs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: pricatCatalog_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : pricatCatalog.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    productType                  @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'classification.ProductTypes',
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
            CollectionPath: 'logistic.OwnershipStatus',
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
            CollectionPath: 'logistic.ShippingInstructions',
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
            CollectionPath: 'product.Materials',
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
            CollectionPath: 'product.Materials',
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
            CollectionPath: 'product.Materials',
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
            CollectionPath: 'product.Materials',
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
            CollectionPath: 'product.Materials',
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
            CollectionPath: 'logistic.ShippingPorts',
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
    differingIncoTerm            @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'IncoTerms',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: differingIncoTerm_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : differingIncoTerm.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
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
    addHangTag                   @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'method.VKHMs',
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
            CollectionPath: 'classification.Series',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: series_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
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
            CollectionPath: 'classification.Licenses',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: license_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : license.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
    program                      @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'product.Programs',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: program_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'NAME',
                }
            ],
        },
        Common.Text     : {
            $value                : program.name,
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
            CollectionPath: 'logistic.LoadingGroups',
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
    supplier                     @(
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
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : supplier.name,
            ![@UI.TextArrangement]: #TextLast
        }
    );

    consumerTopic                @(
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
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : consumerTopic.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    brand                        @(
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
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : brand.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    targetGroup                  @(
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
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : targetGroup.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    topicComponent               @(
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
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : topicComponent.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    assortmentModule             @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'AssortmentModules',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: assortmentModule_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: consumerTopic_ID,
                    ValueListProperty: 'HIERNODE6',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    LocalDataProperty: topicComponent_ID,
                    ValueListProperty: 'HIERNODE6',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                }
            ],
        },
        Common.Text     : {
            $value                : assortmentModule.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    productGroup                 @(
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

    sizeSystem                   @(
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

    gridBox                      @(
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

    status                       @(
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
        }
    );


}

//HIDE composite key WRFCHARVAL
annotate PlanningService.Products with {
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

    size1             @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Sizes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: size1_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : size1.DESCRIPTION,
            ![@UI.TextArrangement]: #TextLast,
        }
    );

    size2             @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Sizes',
            SearchSupported,
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterOut',
                    LocalDataProperty: size2_CODE,
                    ValueListProperty: 'CODE',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'DESCRIPTION',
                },
            ],
        },
        Common.Text     : {
            $value                : size2.DESCRIPTION,
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
    baseUnitOfMeasure @(
        Common.ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'BaseUnitOfMeasures',
            SearchSupported,
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: baseUnitOfMeasure_ID,
                ValueListProperty: 'ID',
            }, ],
        },
        Common.Text     : {
            $value                : baseUnitOfMeasure.name,
            ![@UI.TextArrangement]: #TextLast,
        }
    );
}

annotate PlanningService.Products with {
    // Annotate each property that will be used as a filter
    ID                     @(Common.Label: '{i18n>product.ID}');

    name                   @(Common.Label: '{i18n>product.name}');

    status                 @(Common.Label: '{i18n>product.status}');

    // This is especially important for association fields
    supplier               @(Common.Label: '{i18n>product.supplier}');

    brand                  @(Common.Label: '{i18n>product.brand}');

    seasonYear             @(Common.Label: '{i18n>product.seasonYear}');

    addHangTag             @(Common.Label: '{i18n>product.addHangTag}');

    writingAppointmentName @(Common.Label: '{i18n>product.writingAppointment}');

    sapStatus              @UI.Hidden;
    sapHttpStatus          @UI.Hidden;
    sapHttpStatusText      @UI.Hidden;
    sapStatusText          @UI.Hidden;
    sapTransactionId       @UI.Hidden;
    name                   @UI.Hidden;
    description            @UI.Hidden;
    productID              @UI.Hidden;
    writingAppointmentID   @UI.Hidden;
}
