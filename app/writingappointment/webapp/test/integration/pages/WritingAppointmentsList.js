sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.valantic.preorder.writingappointment',
            componentId: 'WritingAppointmentsList',
            contextPath: '/WritingAppointments'
        },
        CustomPageDefinitions
    );
});