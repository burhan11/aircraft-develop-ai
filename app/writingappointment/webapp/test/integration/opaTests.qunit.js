sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/valantic/preorder/writingappointment/test/integration/FirstJourney',
		'com/valantic/preorder/writingappointment/test/integration/pages/WritingAppointmentsList',
		'com/valantic/preorder/writingappointment/test/integration/pages/WritingAppointmentsObjectPage'
    ],
    function(JourneyRunner, opaJourney, WritingAppointmentsList, WritingAppointmentsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/valantic/preorder/writingappointment') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheWritingAppointmentsList: WritingAppointmentsList,
					onTheWritingAppointmentsObjectPage: WritingAppointmentsObjectPage
                }
            },
            opaJourney.run
        );
    }
);