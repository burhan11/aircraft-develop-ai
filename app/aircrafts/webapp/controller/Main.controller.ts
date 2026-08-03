import BaseController from "./BaseController.controller";
import { ModelNames } from "../utils/enums/ModelNames";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import Table from "sap/ui/table/Table";
import { RoutingRoutes } from "../utils/enums/RoutingRoutes";
import { RoutingActions } from "../utils/enums/RoutingActions";

/**
 * @namespace com.valantic.aircrafts.controller
 */
export default class Main extends BaseController {

  public onInit(): void {
    const oDataModel = this.geteModel(ModelNames.ODataV2Model);
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
      "capacity": 0,
      "range": 0
    }
    const createdEntry = await this.createV2Data("/Aeroplanes", payload);
    this.navTo("RouteDetail", {
      id: (createdEntry as any).ID,
      query: { action: "CREATE" }
    });
  }
}