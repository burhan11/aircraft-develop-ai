using {
    managed,
    cuid
} from '@sap/cds/common';
using {com.valantic.preorder.consumertopicbrand} from '../consumertopicbrand/schema';

namespace com.valantic.preorder.common.product;

entity ProductGroups : managed, cuid {
    key ID                  : String;
        name                : String;
        sapProductGroup     : String                                                            @title: 'WGR SAP';
        assortmentComponent : String                                                            @title: 'SBS SAP';
        supplier            : Association to one consumertopicbrand.SupplierConsumerTopicBrands @title: 'Refers to Supplier';
}

entity Programs : managed {
    key ID     : String;
        name   : String;
        number : String;
}

entity EvaluationColors : managed {
    key ID     : String;
        name   : String;
        number : String;
}

entity SizeSystems : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Sizes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity SizeRuns : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity PresentationTypes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Materials : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity CreationStatus : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity SustainabilitySealOfApprovals : managed {
    key ID          : String;
        name        : String;
        description : String;
}