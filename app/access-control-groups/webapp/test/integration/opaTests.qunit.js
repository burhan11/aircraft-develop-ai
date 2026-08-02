sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'accesscontrolgroups/test/integration/FirstJourney',
		'accesscontrolgroups/test/integration/pages/GroupsList',
		'accesscontrolgroups/test/integration/pages/GroupsObjectPage',
		'accesscontrolgroups/test/integration/pages/UserGroupsObjectPage'
    ],
    function(JourneyRunner, opaJourney, GroupsList, GroupsObjectPage, UserGroupsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('accesscontrolgroups') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheGroupsList: GroupsList,
					onTheGroupsObjectPage: GroupsObjectPage,
					onTheUserGroupsObjectPage: UserGroupsObjectPage
                }
            },
            opaJourney.run
        );
    }
);