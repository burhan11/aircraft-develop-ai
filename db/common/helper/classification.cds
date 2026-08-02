using {managed} from '@sap/cds/common';
using {PRICAT_K001} from '../../synced/sap-ecc-schema';

namespace com.valantic.preorder.common.helper.classification;

entity NineGridBoxes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Brands : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity TargetGroups : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity PricatCatalogs as
    select
        key ID,
            LIFNR,
            UNIQUE_REFERENCE
    from PRICAT_K001
    where
        UNIQUE_REFERENCE like 'BRANCHENDEPOT%';


entity ProductTypes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity AssortmentModules : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity VATs : managed {
    key ID   : String;
        name : String;
        vat  : Integer;
}

entity Modules : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity SeasonTypes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity SupplyTypes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity UVPTypes : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Series : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Licenses : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Occasions : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity PriceLevels : managed {
    key ID          : String;
        name        : String;
        description : String;
}
