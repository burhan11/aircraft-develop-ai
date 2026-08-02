import Dialog from "sap/m/Dialog";
import Event from "sap/ui/base/Event";
import BaseController from "./Base.Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import SmartForm from "sap/ui/comp/smartform/SmartForm";
import MessageBox from "sap/m/MessageBox";
import { UUID } from "node:crypto";
import JSONModel from "sap/ui/model/json/JSONModel";
import Button from "sap/m/Button";
import Table from "sap/m/Table";
import { default as UITable } from "sap/ui/table/Table";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace com.valantic.preorder.planning.controller
 */
export default class Main extends BaseController {
  planningCreationCanceled: boolean = false;
  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    const viewModel = new JSONModel();
    this.getView()?.setModel(viewModel, "viewModel");
  }


  public async onNewBtnPress(event: Event): Promise<void> {
    try {
      const newTempPlanningData: any = await this.createNewTempPlanning();
      const newPlanningTempPath: string =
        newTempPlanningData?.planning?.planningPath;

      await this.onCreatePlanningDialogOpen(newPlanningTempPath);

      await (this.getView()?.getModel() as ODataModel).resetChanges(
        [newPlanningTempPath],
        false,
        true,
      );
    } catch (error: any) {
      (this.getView()?.getModel() as ODataModel).resetChanges();
    }
  }

  public onDeleteSelectedOrders(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    const smartTable = this.byId("smartTable") as SmartTable;
    const table = smartTable?.getTable() as Table;
    if (!table) {
      return;
    }

    const selectedItems = table.getSelectedItems();

    MessageBox.confirm(this.getText("deleteDescription"), {
      title: this.getText("deleteConfirmation"),
      onClose: (action: string) => {
        if (action === MessageBox.Action.OK) {
          const sGroupId = Math.random().toString(36).substring(2);
          const mParameters = {
            groupId: sGroupId,
          };
          oModel.setDeferredGroups([sGroupId]);
          selectedItems.forEach((item) => {
            const context = item.getBindingContext();
            if (context) {
              oModel.remove(context.getPath(), { groupId: sGroupId });
            }
          });
          oModel.submitChanges(mParameters);
          smartTable.rebindTable(true);
        }
      },
    });
  }

  public async onCreatePlanningDialogOpen(
    newProductPath: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // Build dialog using fragment
      const newProductDialog = (await this.loadFragment({
        name: "com.valantic.preorder.planning.view.fragments.CreatePlanning",
      })) as Dialog;

      // Get Smartform and bind contect
      const smartFormProductParams = this?.byId(
        "smartFormNewPlanningData",
      ) as SmartForm;
      smartFormProductParams.bindElement(newProductPath);

      newProductDialog.attachAfterClose((event: Event) => {
        const smartFormData = smartFormProductParams
          ?.getBindingContext()
          ?.getObject();
        if (smartFormData) {
          resolve(smartFormData);
        } else {
          reject();
        }
        // Reset global object to prevent errors

        event.getSource().destroy();
      });
      newProductDialog.open();
    });
  }

  public async onSelecteArticleDialog(planningID: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // Build dialog using fragment
      const newArticleSelectionDialog = (await this.loadFragment({
        name: "com.valantic.preorder.planning.view.fragments.ArticleSelection",
      })) as Dialog;

      // Get Smartform and bind contect
      const smartFormProductParams = this?.byId(
        "smartFormNewPlanningData",
      ) as SmartForm;
      // smartFormProductParams.bindElement(newProductPath);

      newArticleSelectionDialog.attachAfterClose((event: Event) => {
        // const smartFormData = smartFormProductParams?.getBindingContext()?.getObject();
        // if (smartFormData) {
        //     resolve(smartFormData);
        // } else {
        //     reject();
        // }
        // Reset global object to prevent errors

        event.getSource().destroy();
      });
      newArticleSelectionDialog.open();
    });
  }

  public onPlanningItemPress(oEvent: Event): void {
    const planningID = (oEvent.getSource() as any)
      .getBindingContext()
      .getObject().ID;
    this.navTo("RouteDetails", { id: planningID });
  }

  public onCreatePlanningDialogClose(event: Event) {
    this.planningCreationCanceled = true;

    const newPlanningParamsDialog = (event.getSource() as Button)
      ?.getParent()
      ?.getParent() as Dialog;
    newPlanningParamsDialog.close();
  }

  public onReleaseOrderPress(oEvent: Event): void {
    MessageBox.error("Noch nicht implementiert");
  }

  public onPlanningItemSelect(event: Event): void {
    const selectedItems = (event.getSource() as Table).getSelectedItems();
    const statusButton = this.byId("releaseOrderButton") as Button;
    statusButton?.setEnabled(selectedItems.length > 0);
    const deleteButton = this.byId("deleteOrderButton") as Button;
    deleteButton?.setEnabled(selectedItems.length > 0);
  }

  public async newPlanningParamsAccept(event: Event): Promise<void> {
    this.planningCreationCanceled = false;
    const newPlanningParamsDialog = (event.getSource() as Button)
      ?.getParent()
      ?.getParent() as Dialog;
    const smartForm = this.byId("smartFormNewPlanningData") as SmartForm;
    const checked = await smartForm.check();
    if (checked.length > 0) {
      MessageBox.error("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    const smartFormData: any = smartForm.getBindingContext()?.getObject();

    try {
      const createdPlanning: any = await this.createNewPlanning({
        writingAppointment_ID: smartFormData.writingAppointment_ID,
        supplier_ID: smartFormData.supplier_ID,
        brand_ID: smartFormData.brand_ID,
        consumerTopic_ID: smartFormData.consumerTopic_ID,
        status_ID: "InProgress",
        purchaseVolume: 0,
        name: smartFormData.name,
        date: smartFormData.date,
        isArchived: false,
      });

      const viewModel = this.getView()?.getModel("viewModel") as JSONModel;
      viewModel.setProperty("/createdPlanning", createdPlanning);
      const planning: any = await this.readOData(
        "/Planning(" + createdPlanning.planningID + ")",
      );

      newPlanningParamsDialog.close();

      (this.getOwnerComponent() as any)
        .getEventBus()
        .publish("planning", "newPlanningCreated");
      this.navTo("RouteDetails", { id: planning.ID });
    } catch (error: any) {
      const errorMessage = error?.responseText
        ? JSON.parse(error.responseText)?.error?.message?.value
        : "Unknown error";
      (this.byId("smartTable") as SmartTable).rebindTable(true);
      MessageBox.error(`${errorMessage}`);
    }
  }

  public createNewTempPlanning(): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const v2ODataModel = this.getView()?.getModel() as ODataModel;
      var oResponse: any = {
        planning: {},
      };

      try {
        oResponse.planning = await this.createNewTempPlanningElements(
          v2ODataModel,
          "/Planning",
        );

        resolve(oResponse);
      } catch (error) {
        reject(error);
        // ToDo
      }
    });
  }

  public createNewTempPlanningElements(
    v2ODataModel: ODataModel,
    entityPath: string,
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      v2ODataModel.createEntry(entityPath, {
        created: (success: any) => {
          var planningPath: string = success.getPath();
          var planningID: string = planningPath.split("'")[1];

          resolve({
            data: success,
            planningID: planningID,
            planningPath: planningPath,
          });
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  public createNewPlanning(body: Object): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const v2ODataModel = this.getView()?.getModel() as ODataModel;
      // var oResponse: any = { product: {}, productToPurch: {}, productToSales: {} };

      try {
        v2ODataModel.create("/Planning", body, {
          success: (success: any, response: any) => {
            var planningID: UUID = success.ID;
            var planningPath: string = v2ODataModel.createKey("/Planning", {
              ID: success.ID,
            });

            resolve({
              data: success,
              planningID: planningID,
              planningPath: planningPath,
            });
          },
          error: (error: any) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
        // ToDo
      }
    });
  }

  public readOData(entityPath: string, urlParameters?: any): Promise<Object> {
    return new Promise((resolve, reject) => {
      const v2ODataModel = this.getView()?.getModel() as ODataModel;
      v2ODataModel.read(entityPath, {
        success: (data: any) => {
          resolve(data);
        },
        error: (error: any) => {
          reject(error);
        },
        urlParameters: urlParameters,
      });
    });
  }

  public createODataEntry(entityPath: string, data: Object): Promise<Object> {
    return new Promise((resolve, reject) => {
      const v2ODataModel = this.getView()?.getModel() as ODataModel;
      v2ODataModel.create(entityPath, data, {
        success: (data: any) => {
          resolve(data);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  public onBeforeRebindArticleSelectionTable(oEvent: any) {
    var mBindingParams = oEvent.getParameter("bindingParams");
    const viewModel = this.getView()?.getModel("viewModel") as JSONModel;

    mBindingParams.filters = [
      new Filter(
        "supplier_ID",
        FilterOperator.EQ,
        viewModel.getProperty("/createdPlanning/data/supplier_ID"),
      ),
      new Filter(
        "consumerTopic_ID",
        FilterOperator.EQ,
        viewModel.getProperty("/createdPlanning/data/consumerTopic_ID"),
      ),
      new Filter(
        "brand_ID",
        FilterOperator.EQ,
        viewModel.getProperty("/createdPlanning/data/brand_ID"),
      ),
    ];
  }

  public async onAddProductsToPlanning() {
    const selectDeliveryDate = (await this.loadFragment({
      name: "com.valantic.preorder.planning.view.fragments.CreateDeliveryDate",
    })) as Dialog;

    const table = this.byId("LineItemsSmartTable") as SmartTable;
    const selectedIndices = (table.getTable() as UITable).getSelectedIndices();
    const selectedItems = selectedIndices.map((index) =>
      (table.getTable() as UITable).getContextByIndex(index)?.getObject(),
    );

    const viewModel = this.getView()?.getModel("viewModel") as JSONModel;
    const planningID = viewModel.getProperty("/createdPlanning/ID");

    const oModel = this.getView()?.getModel() as ODataModel;

    for await (const element of selectedItems) {
    }
  }
  private saveChangesImmediately(): Promise<void> {
    return new Promise((resolve, reject) => {
      const oModel = this.getView()?.getModel() as ODataModel;

      oModel.submitChanges({
        success: () => {
          MessageToast.show("Changes saved");
          resolve();
        },
        error: (oError: any) => {
          MessageBox.error(`Save failed: ${oError.message || "Unknown error"}`);
          reject(oError);
        },
      });
    });
  }
}
