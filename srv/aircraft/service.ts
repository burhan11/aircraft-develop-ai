import cds from '@sap/cds'

class AircraftCreationService extends cds.ApplicationService {
    async init(): Promise<void> {
        this.on("generateAeroplaneData", "Aeroplanes", async (req) => {

        });
        return super.init();
    }
}

module.exports = AircraftCreationService;