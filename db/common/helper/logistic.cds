using {managed} from '@sap/cds/common';
using {T001L, ZSTTA_SUP_TYPE} from '../../synced/sap-ecc-schema';

namespace com.valantic.preorder.common.helper.logistic;

entity ShippingInstructions : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity LoadingGroups : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity OwnershipStatus : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity GoodsDistributions : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity DistributionProfiles : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity Currencies : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity ShippingPorts : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity ProductionPlants : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity IncoTerms : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity HouseGroups : managed {
    key ID   : String;
        name : String;
}

@readonly
entity StorageLocations as 
    select
        LGORT,
        LGOBE
    from T001L
    where
        RANK = 1;

entity SupplyTypeTransitions {
    key fromSupplyType : Association to one ZSTTA_SUP_TYPE @title: 'From Supply Type';
    key toSupplyType   : Association to one ZSTTA_SUP_TYPE @title: 'To Supply Type';
}
