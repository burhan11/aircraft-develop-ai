sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.valantic.preorder.writingappointment',
            componentId: 'WritingAppointmentsObjectPage',
            contextPath: '/WritingAppointments'
        },
        CustomPageDefinitions
    );
});