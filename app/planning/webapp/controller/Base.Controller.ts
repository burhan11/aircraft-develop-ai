import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import AppComponent from "../Component";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import History from "sap/ui/core/routing/History";
import JSONModel from "sap/ui/model/json/JSONModel";

import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Filter from "sap/ui/model/Filter";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import Event from "sap/ui/base/Event";
import SmartForm from "sap/ui/comp/smartform/SmartForm";
import { UUID } from "crypto";
import MessageBox from "sap/m/MessageBox";
import Message from "sap/ui/core/message/Message";
import Messaging from "sap/ui/core/Messaging";

/**
 * @namespace com.valantic.preorder.products.controller
 */
export default abstract class BaseController extends Controller {
  /**
   * Convenience method for accessing the component of the controller's view.
   * @returns The component of the controller's view
   */
  public getOwnerComponent(): AppComponent {
    return super.getOwnerComponent() as AppComponent;
  }

  /**
   * Convenience method to get the components' router instance.
   * @returns The router instance
   */
  public getRouter(): Router {
    return UIComponent.getRouterFor(this);
  }

  /**
   * Convenience method for getting the i18n resource bundle of the component.
   * @returns The i18n resource bundle of the component
   */
  public getResourceBundle(): ResourceBundle | Promise<ResourceBundle> {
    const oModel = this.getOwnerComponent().getModel("i18n") as ResourceModel;
    return oModel.getResourceBundle();
  }

  /**
   * Convenience method for getting the view model by name in every controller of the application.
   * @param [sName] The model name
   * @returns The model instance
   */
  public getModel(sName?: string): JSONModel {
    return this?.getView()?.getModel(sName) as JSONModel;
  }

  /**
   * Convenience method for setting the view model in every controller of the application.
   * @param oModel The model instance
   * @param [sName] The model name
   * @returns The current base controller instance
   */
  public setModel(oModel: Model, sName?: string): BaseController {
    this?.getView()?.setModel(oModel, sName);
    return this;
  }

  /**
   * Convenience method for getting the view model by name in every controller of the application.
   * @param [sName] The model name
   * @returns The model instance
   */
  public getODataModel(sName?: string): V2ODataModel {
    return this?.getView()?.getModel(sName) as V2ODataModel;
  }

  /**
   * Convenience method for triggering the navigation to a specific target.
   * @public
   * @param sName Target name
   * @param [oParameters] Navigation parameters
   * @param [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
   */
  public navTo(sName: string, oParameters?: any, bReplace?: boolean): void {
    this.getRouter().navTo(sName, oParameters, undefined, bReplace);
  }

  /**
   * Convenience event handler for navigating back.
   * It there is a history entry we go one step back in the browser history
   * If not, it will replace the current entry of the browser history with the main route.
   */
  public onNavBack(): void {
    const sPreviousHash = History.getInstance().getPreviousHash();
    if (sPreviousHash !== undefined) {
      window.history.go(-1);
    } else {
      this.getRouter().navTo("main", {}, undefined, true);
    }
  }

  getText(i18nKey: string): string {
    const oResourceBundle = (
      this.getView()?.getModel("i18n") as ResourceModel
    )?.getResourceBundle();
    if (
      oResourceBundle &&
      typeof (oResourceBundle as any).getText === "function"
    ) {
      return (oResourceBundle as any).getText(i18nKey) || i18nKey;
    }
    return i18nKey;
  }
}
