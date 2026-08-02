import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataV2Model from "sap/ui/model/odata/v2/ODataModel";
import { ModelNames } from "../utils/enums/ModelNames";
import Filter from "sap/ui/model/Filter";
import Router from "sap/ui/core/routing/Router";

export default abstract class BaseController extends Controller {

  public getODataModel(sName?: string): ODataV2Model {
    return this.getView()?.getModel(sName) as ODataV2Model;
  };

  public readV2Data(
    sEntityName: any,
    filters?: Filter[],
    urlParamter: Record<string, string> = {}
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      const dataV2Model = this.getODataModel(ModelNames.ODataV2Model);
      dataV2Model.create(sEntityName, {
        success: (data: any) => {
          resolve(data)
        },
        error: (error: any) => {
          reject(error)
        },
        filters: filters,
        urlParameters: urlParamter,
      })
    });
  };

  public async createV2Data(
    sEntityName: any,
    payload: Record<string, any>,
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      const dataV2Model = this.getODataModel(ModelNames.ODataV2Model);
      dataV2Model.create(sEntityName, payload, {
        success: (data: any) => {
          resolve(data)
        },
        error: (error: any) => {
          reject(error)
        }
      })
    });
  };

  private getRouter(): Router {
    return UIComponent.getRouterFor(this);
  };

  public navTo(sName: string, oParamter: any): void {
    this.getRouter().navTo(sName, oParamter)
  };

}

