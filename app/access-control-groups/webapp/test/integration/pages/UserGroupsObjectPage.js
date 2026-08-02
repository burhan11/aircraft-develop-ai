sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'accesscontrolgroups',
            componentId: 'UserGroupsObjectPage',
            contextPath: '/Groups/members'
        },
        CustomPageDefinitions
    );
});