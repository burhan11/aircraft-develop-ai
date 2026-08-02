using Product as service from '../../srv/product/product-service';

annotate service.WRF_CHARVAL with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : description,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.EvaluationColors with {
    ID     @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name   @UI.HiddenFilter;
    number @UI.HiddenFilter;
};

// annotate service.SizeRuns with;


annotate service.SizeRuns with {
    ID          @Common.Text: {
        $value                : ID,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.BaseUnitOfMeasures with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate service.StorageUnitOfMeasures with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate service.VATs with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate service.Currencies with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate service.UVPTypes with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};


annotate service.SupplyTypes with {
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

annotate service.SeasonTypes with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.PricatCatalogs with {
    ID    @Common.Text: {
        $value                : ID,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    LIFNR @UI.HiddenFilter;
};

annotate service.OwnershipStatus with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.ShippingInstructions with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.Materials with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.ShippingPorts with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.TransportChains with {
    TC_ID          @Common.Text: {
        $value                : TC_NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    TC_NAME        @UI.HiddenFilter;
};

annotate service.IncoTerms with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.VKHMs with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.Series with {
    // @Search.fuzzinessThreshold: 1.0
    ID  @Common.Text: {
        $value                : ID,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;

};

annotate service.Programs with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.Patterns with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.SpecialProducts with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.LoadingGroups with {
    // @Search.fuzzinessThreshold: 1.0
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.SustainabilitySealOfApprovals with {
    // @Search.fuzzinessThreshold: 1.0
    GSNR      @Common.Text: {
        $value                : GSNR_KTXT,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    GSNR_KTXT @UI.HiddenFilter;
};

annotate service.Brands with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.ConsumerTopics with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.TargetGroups with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.TopicComponents with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.AssortmentModules with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
};

annotate service.ProductGroups with {
    // @Search.fuzzinessThreshold: 1.0
    ID          @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME        @UI.HiddenFilter;
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.WG_SBS with {
    productGroup     @Common.Text: {
        $value                : productGroup_NAME,
        ![@UI.TextArrangement]: #TextLast
    };
    assortmentModule @Common.Text: {
        $value                : assortmentModule_NAME,
        ![@UI.TextArrangement]: #TextLast
    }
};

annotate service.WGPROGRAMS with {
    program @Common.Text: {
        $value                : program_NAME,
        ![@UI.TextArrangement]: #TextLast
    }
};

annotate service.SizeSystems with {
    // @Search.fuzzinessThreshold: 1.0
    ID  @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;

};

annotate service.ProductStatus with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    Criticality @UI.HiddenFilter;
};

annotate service.Suppliers with {
    // @Search.fuzzinessThreshold: 1.0
    ID              @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME            @UI.HiddenFilter;
    COUNTRY         @UI.HiddenFilter;
    TRANSPORT_CHAIN @UI.HiddenFilter;
};

annotate service.NineGridBoxes with {
    ID          @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
};

annotate service.ProductTypes with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
// description @UI.HiddenFilter;
};

annotate service.WashingMethods with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
// description @UI.HiddenFilter;
};

annotate service.BleachingMethods with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
// description @UI.HiddenFilter;
};

annotate service.IroningMethods with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
// description @UI.HiddenFilter;
};

annotate service.DryingMethods with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
// description @UI.HiddenFilter;
};

annotate service.CleaningMethods with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
// description @UI.HiddenFilter;
};

annotate service.PurchaseGroups with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate service.Sizes with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.PresentationTypes with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.Licenses with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.Occasions with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.Properties with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.Qualities with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.Omnichannels with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.SurfaceWashings with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.MainForms with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.StockingThickness with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.Modules with {
    // @Search.fuzzinessThreshold: 1.0
    CODE        @UI.HiddenFilter
                @Common.Text: {
        $value                : DESCRIPTION,
        ![@UI.TextArrangement]: #TextLast
    };
    DESCRIPTION @UI.HiddenFilter;
};

annotate service.HouseGroups with {
    ID   @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    name @UI.HiddenFilter;
};

annotate service.StorageLocations with {
    // @Search.fuzzinessThreshold: 1.0
    LGORT  @Common.Text: {
        $value                : LGOBE,
        ![@UI.TextArrangement]: #TextLast,
    }  @UI.HiddenFilter;
    LGOBE  @UI.HiddenFilter;
};

annotate service.MARA with {
    // @Search.fuzzinessThreshold: 1.0
    ID   @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
}

annotate service.PriceLevels with {
    ID          @UI.HiddenFilter  @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextLast
    };
    name        @UI.HiddenFilter;
    description @UI.HiddenFilter;
}

annotate service.ArticlesVH with {
    ID            @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME          @UI.HiddenFilter;
    supplier      @UI.HiddenFilter;
    consumerTopic @UI.HiddenFilter;
    brand         @UI.HiddenFilter;
}

annotate service.ProductsVH with {
    ID                  @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    NAME                @UI.HiddenFilter;
    supplier            @UI.HiddenFilter;
    consumerTopic       @UI.HiddenFilter;
    brand               @UI.HiddenFilter;
    article             @UI.HiddenFilter;
    evaluationColorName @UI.HiddenFilter
}

annotate service.SupplierProductNumberVH with {
    supplierProductNumber @UI.HiddenFilter;
    supplier              @UI.HiddenFilter;
    consumerTopic         @UI.HiddenFilter;
    brand                 @UI.HiddenFilter;
}

annotate service.EvaluationColorsVH with {
    evaluationColorID     @Common.Text: {
        $value                : evaluationColorName,
        ![@UI.TextArrangement]: #TextLast
    }  @UI.HiddenFilter;
    evaluationColorName   @UI.HiddenFilter;
    supplier              @UI.HiddenFilter;
    consumerTopic         @UI.HiddenFilter;
    brand                 @UI.HiddenFilter;
    supplierProductNumber @UI.HiddenFilter;
}

annotate service.MerchandiseSecurityMethods with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
}

annotate service.PriceLabelMethods with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
}

annotate service.HangerMethods with {
    ID   @Common.Text: {
        $value                : NAME,
        ![@UI.TextArrangement]: #TextLast,
    }  @UI.HiddenFilter;
    NAME @UI.HiddenFilter;
}

// Search fields
annotate service.WRF_CHARVAL with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.EvaluationColors with @cds.search: {
    ID,
    name
};

annotate service.SizeRuns with @cds.search: {
    ID,
    name
};

annotate service.BaseUnitOfMeasures with @cds.search: {
    ID,
    name
};

annotate service.VATs with @cds.search: {
    ID,
    name
};

annotate service.Currencies with @cds.search: {
    ID,
    name
};

annotate service.UVPTypes with @cds.search: {
    ID,
    name
};

annotate service.SupplyTypes with @cds.search: {
    DESCRIPTION,
    SUPPLY_TYPE
};

annotate service.SeasonTypes with @cds.search: {
    ID,
    name
};

annotate service.PricatCatalogs with @cds.search: {
    ID,
    LIFNR
};

annotate service.OwnershipStatus with @cds.search: {
    ID,
    name
};

annotate service.ShippingInstructions with @cds.search: {
    ID,
    name
};

annotate service.Materials with @cds.search: {
    ID,
    name
};

annotate service.ShippingPorts with @cds.search: {
    ID,
    name
};

annotate service.TransportChains with @cds.search: {
    TC_ID,
    TC_NAME
};

annotate service.IncoTerms with @cds.search: {
    ID,
    name
};

annotate service.VKHMs with @cds.search: {
    ID,
    NAME
};

annotate service.Series with @cds.search: {ID};

annotate service.Programs with @cds.search: {
    ID,
    NAME
};

annotate service.Patterns with @cds.search: {
    ID,
    NAME
};

annotate service.SpecialProducts with @cds.search: {
    ID,
    NAME
};


annotate service.LoadingGroups with @cds.search: {
    ID,
    name
};

annotate service.SustainabilitySealOfApprovals with @cds.search: {
    GSNR,
    GSNR_KTXT
};

annotate service.Brands with @cds.search: {
    ID,
    NAME
};

annotate service.ConsumerTopics with @cds.search: {
    ID,
    NAME
};

annotate service.TargetGroups with @cds.search: {
    ID,
    NAME
};

annotate service.TopicComponents with @cds.search: {
    ID,
    NAME
};

annotate service.AssortmentModules with @cds.search: {
    ID,
    NAME
};

annotate service.ProductGroups with @cds.search: {
    ID,
    NAME
};

annotate service.WGPROGRAMS with @cds.search: {program};

annotate service.SizeSystems with @cds.search: {
    ID,
    NAME

};

annotate service.ProductStatus with @cds.search: {
    ID,
    name
};

annotate service.Suppliers with @cds.search: {
    ID,
    NAME
};

annotate service.NineGridBoxes with @cds.search: {
    ID,
    name
};

annotate service.ProductTypes with @cds.search: {
    ID,
    name
};

annotate service.WashingMethods with @cds.search: {
    ID,
    name
};

annotate service.BleachingMethods with @cds.search: {
    ID,
    name
};

annotate service.IroningMethods with @cds.search: {
    ID,
    name
};

annotate service.DryingMethods with @cds.search: {
    ID,
    name
};

annotate service.CleaningMethods with @cds.search: {
    ID,
    name
};

annotate service.PurchaseGroups with @cds.search: {
    ID,
    name
};

annotate service.Sizes with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.PresentationTypes with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.Licenses with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.Occasions with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.Properties with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.Qualities with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.Omnichannels with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.SurfaceWashings with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.MainForms with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.StockingThickness with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.Modules with @cds.search: {
    CODE,
    DESCRIPTION
};

annotate service.HouseGroups with @cds.search: {
    ID,
    name
};

annotate service.ProductionPlants with @cds.search: {
    NAME1,
    PRODUCTIONPLANT
};

annotate service.StorageLocations with @cds.search: {
    LGORT,
    LGOBE
};

annotate service.MARA with @cds.search: {
    ID,
    NAME
};

annotate service.PriceLevels with @cds.search: {
    ID,
    name
};

annotate service.ArticlesVH with @cds.search: {
    ID,
    NAME
};

annotate service.ProductsVH with @cds.search: {
    ID,
    NAME
};

annotate service.SupplierProductNumberVH with @cds.search: {supplierProductNumber};

annotate service.EvaluationColorsVH with @cds.search: {
    evaluationColorID,
    evaluationColorName
};


annotate service.MerchandiseSecurityMethods with @cds.search: {
    ID,
    NAME
};

annotate service.PriceLabelMethods with @cds.search: {
    ID,
    NAME
};

annotate service.HangerMethods with @cds.search: {
    ID,
    NAME
};




annotate service.ProductionPlants with {
    PRODUCTIONPLANT @Common.Text: {
        $value                : NAME1,
        ![@UI.TextArrangement]: #TextLast,
    }
};
