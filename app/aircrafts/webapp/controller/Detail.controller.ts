import BaseController from "./BaseController.controller";
import { RoutingRoutes } from "../utils/enums/RoutingRoutes";
import Event from "sap/ui/base/Event";
import { UUID } from "node:crypto";
import { ModelNames } from "../utils/enums/ModelNames";
import { RoutingActions } from "../utils/enums/RoutingActions";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace com.valantic.aircrafts.controller
 */
export default class Detail extends BaseController {

  private _conversationHistory: Array<any> = [];

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

    this.getModel(ModelNames.detailViewModel).setProperty(
      "/detail/bInEditModel",
      bInEditModel
    );
    this.getModel(ModelNames.detailViewModel).setProperty(
      "/detail/aeroplaneId",
      aeroplaneId
    );
    this.getModel(ModelNames.detailViewModel).setProperty(
      "/detail/aeroplanePath",
      aeroplanePath
    );

    const objectPageLayout = this.byId("idObjectPageLayout") as ObjectPageLayout;
    objectPageLayout.bindElement(aeroplanePath);
  };

  public onEditAeroplaneData(): void {
    const aeroplaneId = this.getModel(ModelNames.detailViewModel).getProperty(
      "/detail/aeroplaneId"
    );
    this.navTo(RoutingRoutes.routeViewDetail, {
      id: aeroplaneId,
      query: { action: RoutingActions.viewDetailCreate }
    });
  }

  public onCancelAeroplaneData(): void {
    const aeroplaneId = this.getModel(ModelNames.detailViewModel).getProperty(
      "/detail/aeroplaneId"
    );
    this.navTo(RoutingRoutes.routeViewDetail, {
      id: aeroplaneId,
      query: { action: RoutingActions.viewDetailDisplay }
    });
  };

  public onSaveAeroplaneData(): void {
    const aeroplaneId = this.getModel(ModelNames.detailViewModel).getProperty(
      "/detail/aeroplaneId"
    );
  };

  public async onGenerate(): Promise<void> {
    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    const sPrompt = this.byId("idPromptInput").getValue();
    const aeroplaneId = this.getModel(ModelNames.detailViewModel).getProperty(
      "/detail/aeroplaneId"
    );
    const aeroplanePath = this.getModel(ModelNames.detailViewModel).getProperty(
      "/detail/aeroplanePath"
    );

    if (!sPrompt || sPrompt.trim().length === 0) {
      MessageToast.show("Please describe the aircraft");
      return;
    }

    const data: any = await this.generateRecord(sPrompt, JSON.stringify(this._conversationHistory));

    const response = data?.results[0];
    Object.entries(response).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        oDataModel.setProperty(`${aeroplanePath}/${key}`, value)
      }
    });

    this._conversationHistory.push({ role: 'user', content: sPrompt });
    this._conversationHistory.push({ role: 'assistent', content: JSON.stringify(response) });

    this.byId("idPromptInput").setValue("");
  };
}