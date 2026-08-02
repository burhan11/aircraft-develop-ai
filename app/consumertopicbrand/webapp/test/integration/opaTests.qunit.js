sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "consumertopicbrands/test/integration/FirstJourney",
    "consumertopicbrands/test/integration/pages/SupplierConsumerTopicBrandsList",
    "consumertopicbrands/test/integration/pages/SupplierConsumerTopicBrandsObjectPage",
  ],
  function (
    JourneyRunner,
    opaJourney,
    SupplierConsumerTopicBrandsList,
    SupplierConsumerTopicBrandsObjectPage
  ) {
    "use strict";
    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl("consumertopicbrands") + "/index.html",
    });

    JourneyRunner.run(
      {
        pages: {
          onTheSupplierConsumerTopicBrandsList: SupplierConsumerTopicBrandsList,
          onTheSupplierConsumerTopicBrandsObjectPage:
            SupplierConsumerTopicBrandsObjectPage,
        },
      },
      opaJourney.run
    );
  }
);