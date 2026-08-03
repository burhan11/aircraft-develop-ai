import BaseController from "./BaseController.controller";
import { RoutingRoutes } from "../utils/enums/RoutingRoutes";
import Event from "sap/ui/base/Event";
import { UUID } from "node:crypto";
import { ModelNames } from "../utils/enums/ModelNames";
import { RoutingActions } from "../utils/enums/RoutingActions";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";

/**
 * @namespace com.valantic.aircrafts.controller
 */
export default class Detail extends BaseController {

  public onInit(): void {
    const route = this.getRouter()?.getRoute(RoutingRoutes.routeViewDetail);
    route.attachPatternMatched(this.handleRoute, this);
  };

  public async handleRoute(event: Event): Promise<void> {
    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    const parameters = event.getParameters();
    const aeroplaneId: UUID = parameters.arguments?.id;
    const action: string = parameters.arguments['?query'].action;
    const aeroplanePath = oDataModel.createKey("/Aeroplanes", {
      ID: aeroplaneId
    });

    let bInEditModel: boolean = false;

    switch (action) {
      case RoutingActions.viewDetailDisplay:
        bInEditModel = false;
        break;

      case RoutingActions.viewDetailCreate:
        bInEditModel = true;
        break;

      default:
        break;
    };

    this.geteModel(ModelNames.detailViewModel).setProperty(
      "/detail/bInEditModel",
      bInEditModel
    );
    this.geteModel(ModelNames.detailViewModel).setProperty(
      "/detail/aeroplaneId",
      aeroplaneId
    );
    this.geteModel(ModelNames.detailViewModel).setProperty(
      "/detail/aeroplanePath",
      aeroplanePath
    );

    const objectPageLayout = this.byId("idObjectPageLayout") as ObjectPageLayout;
    objectPageLayout.bindElement(aeroplanePath);
  };

  public onEditAeroplaneData(): void {

  }

  public onSaveAeroplaneData(): void {
    
  }

}