using {com.valantic.preorder.accessControl} from '../../db/access-control-data/schema';

using {MATHIER_HIERNODE5_KT} from '../../db/synced/sap-ecc-schema';

service AccessControlDataService {
    @odata.draft.enabled
    entity Groups               as projection on accessControl.Groups;
    @readonly
    entity ConsumerTopics       as projection on MATHIER_HIERNODE5_KT
                                   where
                                           DATE_FROM <= $now
                                       and DATE_TO   >= $now;
    @odata.draft.enabled
    entity GroupsConsumerTopics as projection on accessControl.GroupsConsumerTopics;
}
