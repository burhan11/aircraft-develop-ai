using {managed} from '@sap/cds/common';
using {WRF_CCODES_REG} from '../../synced/sap-ecc-schema';

namespace com.valantic.preorder.common.helper.method;

entity VKHMs : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity AttachmentMethods : managed {
    key ID          : String;
        name        : String;
        description : String;
}

entity WashingMethods as
    select
        key CARE_CODE_REGION as ID,
        CARE_CODE_DESCR  as name
    from WRF_CCODES_REG
    where
        CARE_TYPE = '1';


entity BleachingMethods as
    select
        key CARE_CODE_REGION as ID,
            CARE_CODE_DESCR  as name
    from WRF_CCODES_REG
    where
        CARE_TYPE = '2';

entity IroningMethods as
    select
        key CARE_CODE_REGION as ID,
            CARE_CODE_DESCR  as name
    from WRF_CCODES_REG
    where
        CARE_TYPE = '3';
entity CleaningMethods as
    select
        key CARE_CODE_REGION as ID,
            CARE_CODE_DESCR  as name
    from WRF_CCODES_REG
    where
        CARE_TYPE = '4';

entity DryingMethods as
    select
        key CARE_CODE_REGION as ID,
            CARE_CODE_DESCR  as name
    from WRF_CCODES_REG
    where
        CARE_TYPE = '5';
