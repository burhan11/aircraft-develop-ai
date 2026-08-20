import Controller from "sap/ui/core/mvc/Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import Filter from "sap/ui/model/Filter";

export default class BaseController extends Controller {

  public getODataModel(sName?: string): void {
    return this.getView()?.getModel(sName) as ODataModel;
  }

  public getLocalModel(sName?: string): void {
    return this.getView()?.getModel(sName) as JSONModel;
  }

  public async createRecord(
    sEntityName: string,
    payload: Record<string, any>,
  ): Promise<Object> {
    return new Promise<any>((resolve, reject) => {
      const oModel = this.getODataModel() as ODataModel;
      try {
        oModel.create(sEntityName, payload, {
          success: (data: any) => {
            resolve(data);
          },
          error: (error: any) => {
            reject(error)
          },
        })
      } catch (error) {
        MessageToast.show("Error while updating");
      }
    })
  };

  public async readRecords(
    sEntityName: any,
    filters?: Filter[],
    urlParamter: Record<string, any> = {}
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      const oModel = this.getODataModel() as ODataModel;
      oModel.read(sEntityName, {
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

  public async processChatInput(
    sEntityName: any,
    urlParamter: Record<string, any> = {}
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      const oModel = this.getODataModel() as ODataModel;
      oModel.callFunction(sEntityName, {
        method: "POST",
        urlParameters: urlParamter,
        success: (data: any) => {
          resolve(data)
        },
        error: (error: any) => {
          reject(error)
        },
      })
    });
  };

}