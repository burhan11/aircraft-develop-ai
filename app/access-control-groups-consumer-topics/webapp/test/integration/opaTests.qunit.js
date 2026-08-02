sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'accesscontrolgroupsconsumertopics/test/integration/FirstJourney',
		'accesscontrolgroupsconsumertopics/test/integration/pages/GroupsConsumerTopicsList',
		'accesscontrolgroupsconsumertopics/test/integration/pages/GroupsConsumerTopicsObjectPage'
    ],
    function(JourneyRunner, opaJourney, GroupsConsumerTopicsList, GroupsConsumerTopicsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('accesscontrolgroupsconsumertopics') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheGroupsConsumerTopicsList: GroupsConsumerTopicsList,
					onTheGroupsConsumerTopicsObjectPage: GroupsConsumerTopicsObjectPage
                }
            },
            opaJourney.run
        );
    }
);