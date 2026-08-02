using {managed} from '@sap/cds/common';
using {com.valantic.preorder.common.helper.topic} from '../common/helper/topic';

namespace com.valantic.preorder.accessControl;

using {
    LFA1,
    MATHIER_HIERNODE5_KT,
    WRF_BRANDS,
    ZSTTA_GROE_SYS,
    ZSTTA_MUSTER_T,
    ZSTTA_SONDERARTT,
    ZBMTA0081_SERIE,
    ZSTTA_ZIELGR_T,
    T023T,
    T6WFGT,
    MARA

} from '../synced/sap-ecc-schema';

entity Groups : managed {
    key ID             : String;
        name           : String(100) @title: 'Group Name';
        description    : String(255) @title: 'Group Description';
        consumerTopics : Association to many GroupsConsumerTopics
                             on consumerTopics.group = $self;
}

entity GroupsConsumerTopics {
    key group         : Association to Groups;
    key consumerTopic : Association to MATHIER_HIERNODE5_KT;
}
