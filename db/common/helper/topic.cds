using {managed} from '@sap/cds/common';
using {com.valantic.preorder.accessControl} from '../../access-control-data/schema';

namespace com.valantic.preorder.common.helper.topic;

// entity ConsumerTopics : managed {
//     key ID          : String;
//         name        : String;
//         description : String;
//         group       : Association to many accessControl.GroupsConsumerTopics
//                           on group.consumerTopic = $self
//                       @title: 'Assigned Group';
// }

entity TopicComponents : managed {
    key ID          : String;
        name        : String;
        description : String;
}
