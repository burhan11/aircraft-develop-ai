import BaseController from "./BaseController.controller";

/**
 * @namespace com.valantic.aircrafts.controller
 */
export default class Main extends BaseController {

  public onInit(): void {

  };

  public async onCreateAircraft(): Promise<void> {
    const payload = {
      "model": "",
      "manufacturer": "",
      "category": "",
      "capacity": 0,
      "range": 0
    }
    const createdEntry = await this.createV2Data("/Aeroplanes", payload);
    this.navTo("RouteDetail", {
      id: (createdEntry as any).ID,
      query: { action: "CREATE" }
    })
  }
}