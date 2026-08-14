import copilotModelAircraft from "./copilotModelAircraft";

export default class copilotModel {
    private _aircraft: copilotModelAircraft;
    public constructor() {
        this._aircraft = new copilotModelAircraft();
    }

    public get aircraft(): copilotModelAircraft {
        return this._aircraft;
    }

    public set aircraft(value: copilotModelAircraft) {
        this._aircraft = value;
    }
}