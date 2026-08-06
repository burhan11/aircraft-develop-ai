import BaseController from "./BaseController.controller";
import { ModelNames } from "../utils/enums/ModelNames";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import Table from "sap/ui/table/Table";
import { RoutingRoutes } from "../utils/enums/RoutingRoutes";
import { RoutingActions } from "../utils/enums/RoutingActions";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";

/**
 * @namespace com.valantic.aircrafts.controller
 */
export default class Main extends BaseController {

  private _sCsvtext: Array<string> = [];

  public onInit(): void {
    const aeroplaneSmartTable = this.byId("idAeroplaneSmartTable") as SmartTable;
    aeroplaneSmartTable.attachInitialise(() => {
      const oTable = aeroplaneSmartTable.getTable() as Table;
      oTable.attachCellClick((oEvent: Event) => {
        const rowBindingContext = oEvent.getParameter("rowBindingContext");
        this.navTo(RoutingRoutes.routeViewDetail, {
          id: (rowBindingContext.getObject() as any).ID,
          query: { action: RoutingActions.viewDetailDisplay }
        })
      })
    })
  };

  public async onCreateAircraft(): Promise<void> {
    const payload = {
      "model": "",
      "manufacturer": "",
      "category": "",
      "capacity": null,
      "range": null,
    }
    const createdEntry = await this.createV2Data("/Aeroplanes", payload);
    this.navTo(RoutingRoutes.routeViewDetail, {
      id: (createdEntry as any).ID,
      query: { action: RoutingActions.viewDetailCreate }
    });
  };

  public async onChangeFile(oEvent: Event): Promise<void> {
    const oFile = oEvent.getParameters().files[0];
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      this._sCsvtext = e.target.result.split("\r\n");
    }
    fileReader.readAsText(oFile);
  };


  public async onBatchProcess(): Promise<void> {
    const multipleRecord = JSON.stringify(this._sCsvtext);
    const data: any = await this.generateRecord(multipleRecord, "");

    for (let i = 0; i < data?.results.length; i++) {
      const payload = data?.results[i];
      this.createV2Data("/Aeroplanes", payload);
    }
    const aeroplaneSmartTable = this.byId("idAeroplaneSmartTable") as SmartTable;
    aeroplaneSmartTable.rebind(true);
  };

}