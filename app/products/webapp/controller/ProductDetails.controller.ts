import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController.controller";
import UIComponent from "sap/ui/core/UIComponent";
import Event from "sap/ui/base/Event";
import SimpleForm from "sap/ui/layout/form/SimpleForm";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import SmartForm from "sap/ui/comp/smartform/SmartForm";
import { ModelNames } from "../utils/enums/ModelNames";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import JSONModel from "sap/ui/model/json/JSONModel";
import { randomUUID, UUID } from "node:crypto";
import { RoutingRoutes } from "../utils/enums/RoutingRoutes";
import { SmartFormIDs } from "../utils/enums/SmartFormIDs";
import { RoutingActions } from "../utils/enums/RoutingActions";
import MessageBox from "sap/m/MessageBox";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import { debug } from "node:console";
import Table from "sap/ui/table/Table";
import Button from "sap/m/Button";
import ColumnListItem from "sap/m/ColumnListItem";
import Dialog from "sap/m/Dialog";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Token from "sap/m/Token";
import ComboBox from "sap/m/ComboBox";
import ListBinding from "sap/ui/model/ListBinding";
import DatePicker from "sap/m/DatePicker";
import Messaging from "sap/ui/core/Messaging";
import View from "sap/ui/core/mvc/View";
import Control from "sap/ui/core/Control";
import {
  MandatoryFields,
  CurrencyDollarMandatoryFields,
  CurrencyEuroMandatoryFields
} from "../utils/enums/mandatoryFields";
import { ValueState } from "sap/ui/core/library";
import InputBase from "sap/m/InputBase";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import VBox from "sap/m/VBox";
import Input from "sap/m/Input";
import MessageToast from "sap/m/MessageToast";
import SmartField from "sap/ui/comp/smartfield/SmartField";
//import ValueState from "sap/ui/core/ValueState";
import MessageType from "sap/ui/core/message/MessageType";
import Message from "sap/ui/core/message/Message";
import { IMandatoryEmptyFields } from "../utils/interfaces/IMandotaryEmptyFields.interface";
import { ProductNonEditableFields } from "../utils/enums/nonEditableFields";
import { resolve } from "node:path";


/**
 * @namespace com.valantic.preorder.products.controller
 */
export default class ProductDetails extends BaseController {
  _pAddDialog: Dialog;
  _sAddDialog: Dialog;
  _wAddDialog: Dialog;
  _dAddDialog: Dialog;
  _sizeAddDialog: Dialog;
  _imageDialog: Dialog;
  private successFlag: boolean = false;
  private _selectedImageData: string = "";
  private currencyValue: string = "";
  private aEmptyMandatoryFields: any = [];
  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    const route = this.getRouter()?.getRoute(RoutingRoutes.ProductDetails);
    route?.attachMatched(this.handleRouteMatched, this);

    this.getView()?.setModel(Messaging.getMessageModel(), "message");

    // activate automatic message generation for complete view
    Messaging.registerObject(this.getView() as View, true);

    const oSmartTableVariant = this.byId(SmartFormIDs.DetailsVariantTableOpt) as SmartTable;
    oSmartTableVariant.attachInitialise(() => {
      const oTable = oSmartTableVariant.getTable() as Table;
      oTable.attachCellClick((oEvent) => {
        const rowBindingContext = oEvent.getParameter("rowBindingContext");
        this.navTo(RoutingRoutes.VariantDetails, {
          id: (rowBindingContext?.getObject() as any).ID,
          query: { action: RoutingActions.VarDetailsDisplay }
        });
      });
    });

    // const objectPageLayout = this?.byId(
    //         SmartFormIDs.DetailsObjectPage
    //     ) as ObjectPageLayout;
    // objectPageLayout?.getBindingContext()?.refresh();
  }

  async onMessagePopoverPress(oEvent: any) {
    const oSourceControl = oEvent.getSource();
    const oMessagePopover = (await this._getMessagePopover()) as any;
    oMessagePopover.openBy(oSourceControl);
  }

  private _addFieldError(
    oControl: Control,
    sMessage: string
  ): void {
    const oMessageManager = sap.ui.getCore().getMessageManager();

    const oBinding = oControl.getBinding("value");

    oMessageManager.addMessages(
      new Message({
        message: sMessage,
        type: MessageType.Error,
        target: oBinding?.getPath() || "",
        processor: oBinding?.getModel(),
        code: "PRODUCT_DATE_VALIDATION"

      })
    );
  }
  private _removeDateValidationMessages(): void {
    const oMM = sap.ui.getCore().getMessageManager();
    const aMsgs = oMM.getMessageModel().getData();

    oMM.removeMessages(
      aMsgs.filter(m => m.code === "PRODUCT_DATE_VALIDATION")
    );
  }

  _getMessagePopover() {
    return this.loadFragment({
      name: "com.valantic.preorder.products.view.fragments.MessagePopover",
    });
  }

  private _getDateFromSmartField(oSmartField: any): Date | null {
    const aInner = oSmartField.getInnerControls?.();
    if (!aInner || !aInner.length) {
      return null;
    }

    const oInner = aInner[0];

    if (oInner.isA("sap.m.DatePicker")) {
      return oInner.getDateValue();
    }

    return null;
  }

  //   public validateProductDates(): boolean {

  //   //  sap.ui.getCore().getMessageManager().removeAllMessages();
  //     this._removeDateValidationMessages(); 


  //   // Retrieve the SmartField control for the "availableFrom" date input
  //   const oFrom = this.byId("availableFrom") as SmartField;
  //   const oUntil = this.byId("availableUntil") as SmartField;
  //   const oEol = this.byId("endOfLifeCycle") as SmartField;
  //   const MAX_DATE = new Date("9999-12-31");

  //  const dFrom  = this._getDateFromSmartField(oFrom);
  // const dUntil = this._getDateFromSmartField(oUntil);
  // const dEol   = this._getDateFromSmartField(oEol);


  //   const today = new Date();
  //   let hasError = false;

  //   // reset states
  //   [oFrom, oUntil, oEol].forEach((f) => {
  //     f?.setValueState(ValueState.None);
  //     f?.setValueStateText("");
  //   });

  //   /* 0️⃣ Available From < Available Until AND End of Life */
  //   if (dFrom && ((dUntil && dFrom >= dUntil) || (dEol && dFrom >= dEol))) {
  //     oFrom.setValueState(ValueState.Error);
  //     oFrom.setValueStateText(
  //       this.getText("Availablefrom.must.be.smaller.than.AvailableuntilandEndoflifecycle")
  //     );
  //      this._addFieldError(
  //     oFrom,
  //     this.getText("Availablefrom.must.be.smaller.than.AvailableuntilandEndoflifecycle")
  //   );
  //     hasError = true;
  //   }

  //   /* 1️⃣ Available From < Available Until */
  //   if (dFrom && dUntil && dFrom >= dUntil) {
  //     oUntil.setValueState(ValueState.Error);
  //     oUntil.setValueStateText(
  //       this.getText("AvailableUntil.must.be.later.than.AvailableFrom")
  //     );
  //      this._addFieldError(
  //     oFrom,
  //     this.getText("AvailableUntil.must.be.later.than.AvailableFrom")
  //   );
  //     hasError = true;
  //   }

  //   /* 2️⃣ End of Life requires From + Until */
  //   if (dEol && (!dFrom || !dUntil)) {
  //     // oEol.setValueState(ValueState.Error);
  //     // oEol.setValueStateText(
  //     //   this.getText("AvailableFrom.and.Untilmustbefilled")
  //     // );

  //     if (!dFrom) {
  //     oFrom.setValueState(ValueState.Error);
  //     oFrom.setValueStateText(this.getText("AvailableFrom.and.UntilmustbefilledFrom"));

  //     this._addFieldError(oFrom, this.getText("AvailableFrom.and.UntilmustbefilledFrom"));
  //   }

  //    if (!dUntil) {
  //     oUntil.setValueState(ValueState.Error);
  //     oUntil.setValueStateText(this.getText("AvailableFrom.and.UntilmustbefilledUntil"));

  //     this._addFieldError(oUntil, this.getText("AvailableFrom.and.UntilmustbefilledUntil"));
  //   }

  //     hasError = true;
  //   }

  //   /* 3️⃣ End of Life > Available Until */
  //   if (
  //   dEol &&
  //   dUntil &&
  //   dEol < dUntil &&
  //   dUntil.getTime() !== MAX_DATE.getTime()
  // ) {
  //     oEol.setValueState(ValueState.Error);
  //     oEol.setValueStateText(
  //       this.getText("EndofLifeCycle.must.be.greater.than.AvailableUntil.or.MaxDate")
  //     );
  //      this._addFieldError(
  //     oFrom,
  //     this.getText("EndofLifeCycle.must.be.greater.than.AvailableUntil.or.MaxDate")
  //   );
  //     hasError = true;
  //   }

  //   /* 4️⃣ End of Life not in past */
  //   if (dEol && dEol < today) {
  //     oEol.setValueState(ValueState.Error);
  //     oEol.setValueStateText(
  //       this.getText("EndofLifeCycle.must.not.beinthepast")
  //     );
  //      this._addFieldError(
  //     oFrom,
  //     this.getText("EndofLifeCycle.must.not.beinthepast")
  //   );
  //     hasError = true;
  //   }

  //   return !hasError;
  // }

  public validateProductDates(): boolean {
    // sap.ui.getCore().getMessageManager().removeAllMessages();
    this._removeDateValidationMessages();

    const oFrom = this.byId("availableFrom") as any;
    const oUntil = this.byId("availableUntil") as any;
    const oEol = this.byId("endOfLifeCycle") as any;

    const oModel = oFrom.getModel();
    const sPath = oFrom.getBinding("value")?.getContext()?.getPath();

    if (!oModel || !sPath) {
      console.log("Model or path missing");
      return true;
    }

    const dFromRaw = oModel.getProperty(sPath + "/availableFrom");
    const dUntilRaw = oModel.getProperty(sPath + "/availableUntil");
    const dEolRaw = oModel.getProperty(sPath + "/endOfLifeCycle");

    // ---- Convert OData values to Date ----
    const toDate = (value: any): Date | null => {
      if (!value) return null;
      if (value instanceof Date) return value;

      const match = /\/Date\((\d+)\)\//.exec(value);
      if (match) {
        return new Date(parseInt(match[1], 10));
      }

      return new Date(value);
    };

    let dFrom = toDate(dFromRaw);
    let dUntil = toDate(dUntilRaw);
    let dEol = toDate(dEolRaw);

    // ---- Delivery fallback ----
    const viewModel = this.getModel(ModelNames.ViewModel);
    const aWritingData = viewModel.getProperty("/productDetails/writingAppointmentData");

    if (!dFrom && aWritingData?.length > 0) {
      const dDelivery = aWritingData[0].deliveryDateVZ;
      if (dDelivery) {
        const newDate = new Date(dDelivery);
        oModel.setProperty(sPath + "/availableFrom", newDate);
        dFrom = newDate;
      }
    }

    // ---- Normalize (avoid time issues) ----
    const normalize = (d: Date): Date => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const normalizeOptional = (d: Date | null): Date | null => {
      if (!d) return null;
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    dFrom = normalizeOptional(dFrom);
    dUntil = normalizeOptional(dUntil);
    dEol = normalizeOptional(dEol);

    const today = normalize(new Date());
    // ---- Reset states ----
    [oFrom, oUntil, oEol].forEach((f) => {
      f?.setValueState(ValueState.None);
      f?.setValueStateText("");
    });

    let hasError = false;

    /* 1️⃣ From < Until */
    if (dFrom && dUntil && dFrom >= dUntil) {
      oUntil.setValueState(ValueState.Error);
      oUntil.setValueStateText(
        this.getText("AvailableUntil.must.be.later.than.AvailableFrom")
      );
      hasError = true;
    }

    /* 2️⃣ From < EOL */
    if (dFrom && dEol && dFrom >= dEol) {
      oEol.setValueState(ValueState.Error);
      oEol.setValueStateText(
        this.getText("Availablefrom.must.be.smaller.than.EndofLifeCycle")
      );
      hasError = true;
    }

    /* 3️⃣ EOL requires From + Until */
    if (dEol && (!dFrom || !dUntil)) {
      oEol.setValueState(ValueState.Error);
      oEol.setValueStateText(
        this.getText("AvailableFrom.and.Untilmustbefilled")
      );
      hasError = true;
    }

    /* 4️⃣ EOL > Until */
    if (dEol && dUntil && dEol <= dUntil) {
      oEol.setValueState(ValueState.Error);
      oEol.setValueStateText(
        this.getText("EndofLifeCycle.must.be.greater.than.AvailableUntil")
      );
      hasError = true;
    }

    /* 5️⃣ EOL not in past */
    if (dEol && dEol < today) {
      oEol.setValueState(ValueState.Error);
      oEol.setValueStateText(
        this.getText("EndofLifeCycle.must.not.beinthepast")
      );
      hasError = true;
    }

    return !hasError;
  }
  public onAfterRendering(): void | void { }

  public async handleRouteMatched(event: Event): Promise<void> {
    const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);

    const routingParameters: any = event.getParameters();
    const currentAction: RoutingActions =
      routingParameters?.arguments["?query"]?.action;
    var currentProductID: UUID = routingParameters?.arguments?.id;
    var currentProductPath = v2ODataModel.createKey("/Products", {
      ID: currentProductID,
    });
    var bIsInEditMode: boolean = false;

    // Apply action
    switch (currentAction) {
      case RoutingActions.ProdDetailsDisplay:
        bIsInEditMode = false;
        break;

      case RoutingActions.ProdDetailsCreate:
        bIsInEditMode = true;
        const messageModel = Messaging.getMessageModel();
        const messages = messageModel.getData();
        if (messages && messages.length > 0) {
          const warning = messages[0];
          MessageBox.warning(warning.message, {
            title: this.getText("warning"),
          });
        }
        break;

      case RoutingActions.ProdDetailsChange:
        bIsInEditMode = true;
        break;

      default:
        break;
    }
    this.getModel(ModelNames.ViewModel).setProperty(
      "/productDetails/isInEditMode",
      bIsInEditMode
    );

    // Set product ID and Path to viewModel
    this.getModel(ModelNames.ViewModel).setProperty(
      "/productDetails/productID",
      currentProductID
    );
    this.getModel(ModelNames.ViewModel).setProperty(
      "/productDetails/productPath",
      currentProductPath
    );

    await this.setupJSONModelsForTables();
    this.validateProductDates();

    // Call async handle route matched
    this.handleRouteMatchedAsync(event, currentProductID, currentProductPath);
  }

  public onDeleteSizeItem() {
    const table = this.byId("sizeTable") as Table;
    const selectedItems = table.getSelectedItems();
    const selectedItemIDs = selectedItems.map((item) =>
      item.getBindingContext(ModelNames.ViewModel)?.getProperty("ID")
    );
    const viewModel = this.getModel(ModelNames.ViewModel);
    const data = viewModel.getData().productDetails.sizeData;
    const upID = viewModel.getProperty("/productDetails/productID");

    const updatedData = data.filter(
      (item: any) => !selectedItemIDs.includes(item.ID)
    );
    viewModel.setProperty("/productDetails/sizeData", updatedData);
    const sizeItemsToDelete = [];

    for (const element of selectedItemIDs) {
      sizeItemsToDelete.push({ product_ID: upID, ID: element });
    }

    viewModel.setProperty(
      "/productDetails/sizeItemsToDelete",
      sizeItemsToDelete
    );
  }

  public onDeleteSalesItem() {
    const table = this.byId("salesTable") as Table;
    const selectedItems = table.getSelectedItems();
    const selectedItemIDs = selectedItems.map((item) =>
      item.getBindingContext(ModelNames.ViewModel)?.getProperty("ID")
    );
    const viewModel = this.getModel(ModelNames.ViewModel);
    const data = viewModel.getData().productDetails.salesData;
    const upID = viewModel.getProperty("/productDetails/productID");

    const updatedData = data.filter(
      (item: any) => !selectedItemIDs.includes(item.ID)
    );
    viewModel.setProperty("/productDetails/salesData", updatedData);
    const salesItemsToDelete = [];

    for (const element of selectedItemIDs) {
      salesItemsToDelete.push({ up__ID: upID, ID: element });
    }

    viewModel.setProperty(
      "/productDetails/salesItemsToDelete",
      salesItemsToDelete
    );
  }

  public onDeletePurchaseItem() {
    const table = this.byId("purchaseTable") as Table;
    const selectedItems = table.getSelectedItems();
    const selectedItemIDs = selectedItems.map((item) =>
      item.getBindingContext(ModelNames.ViewModel)?.getProperty("ID")
    );
    const viewModel = this.getModel(ModelNames.ViewModel);
    const upID = viewModel.getProperty("/productDetails/productID");

    const data = viewModel.getData().productDetails.purchaseData;

    const purchaseItemsToDelete = [];

    const updatedData = data.filter(
      (item: any) => !selectedItemIDs.includes(item.ID)
    );
    viewModel.setProperty("/productDetails/purchaseData", updatedData);

    for (const element of selectedItemIDs) {
      purchaseItemsToDelete.push({ up__ID: upID, ID: element });
    }

    viewModel.setProperty(
      "/productDetails/purchaseItemsToDelete",
      purchaseItemsToDelete
    );
  }

  public onDeleteWritingAppointment() {
    const table = this.byId("writingAppointmentTable") as Table;
    const selectedItems = table.getSelectedItems();
    const selectedItemIDs = selectedItems.map((item) =>
      item
        .getBindingContext(ModelNames.ViewModel)
        ?.getProperty("writingAppointment_ID")
    );
    const viewModel = this.getModel(ModelNames.ViewModel);
    const data = viewModel.getData().productDetails.writingAppointmentData;
    const productID = viewModel.getProperty("/productDetails/productID");

    const writingAppointmentsToDelete = [];

    const updatedData = data.filter(
      (item: any) => !selectedItemIDs.includes(item.writingAppointment_ID)
    );
    viewModel.setProperty(
      "/productDetails/writingAppointmentData",
      updatedData
    );
    this.setMandatoryAvailableFrom();

    for (const element of selectedItemIDs) {
      writingAppointmentsToDelete.push({
        productID: productID,
        writingAppointment_ID: element,
      });
    }

    viewModel.setProperty(
      "/productDetails/writingAppointmentsToDelete",
      writingAppointmentsToDelete
    );
  }

  public onAddSizeItem() {
    if (!this._sizeAddDialog) {
      // Use modern, promise-based fragment loading
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.CreateSize", // Path to your fragment
      }).then((oDialog: any) => {
        // Type the resolved object
        this._sizeAddDialog = oDialog;
        this.getView()!.addDependent(this._sizeAddDialog);
        this._sizeAddDialog.open();
      });
    } else {
      this._sizeAddDialog.open();
    }
  }

  /* GPOPT-1175: Remove valid range in purchase and sales data
  public onAddPurchaseItem() {
    if (!this._pAddDialog) {
      // Use modern, promise-based fragment loading
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.CreatePurchase", // Path to your fragment
      }).then((oDialog: any) => {
        // Type the resolved object
        this._pAddDialog = oDialog;
        this.getView()!.addDependent(this._pAddDialog);
        this._pAddDialog.open();
      });
    } else {
      this._pAddDialog.open();
    }
  }

  public onAddSalesItem() {
    if (!this._sAddDialog) {
      // Use modern, promise-based fragment loading
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.CreateSales", // Path to your fragment
      }).then((oDialog: any) => {
        // Type the resolved object
        this._sAddDialog = oDialog;
        this.getView()!.addDependent(this._sAddDialog);
        this._sAddDialog.open();
      });
    } else {
      this._sAddDialog.open();
    }
  }*/

  public async onSaveSize() {

    const validInput = this.checkFormInput("sizeForm");
    if (!validInput) {
      MessageBox.error(this.getText("save.error.description.checkAgain"), {
        title: this.getText("error"),
      });
      return;
    }
    const viewModel = this.getModel(ModelNames.ViewModel);
    const newSizeData = viewModel.getProperty("/productDetails/newSizeData");
    const sizeData = viewModel.getProperty("/productDetails/sizeData") || [];

    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);

    const exists = await new Promise<any>((resolve, reject) => {
      oDataModel.callFunction("/checkExistingGTINInTool", {
        urlParameters: { GTIN: newSizeData.GTIN },
        method: "GET",
        success: (oData: any) => resolve(oData),
        error: (oError: any) => reject(oError),
      });
    });

    if (exists.checkExistingGTINInTool) {
      MessageBox.error("GTIN existiert bereits", { title: "Fehler" });
      return;
    }

    sizeData.push({ ...newSizeData });
    viewModel.setProperty("/productDetails/sizeData", sizeData);
    const sizeTable = this.byId("sizeTable") as Table;
    sizeTable.getBinding("items")?.refresh(true);

    oDataModel.createEntry(`/ProductSizes`, {
      properties: newSizeData,
    });

    this.resetAllDialogs();
    this._sizeAddDialog.close();
  }

  /* GPOPT-1175: Remove valid range in purchase and sales data
  public onSavePurchase() {
    debugger;
    const validInput = this.checkFormInput("purchaseForm");
    if (!validInput) {
      MessageBox.error(this.getText("save.error.description.checkAgain"), {
        title: this.getText("error"),
      });
      return;
    }
    const viewModel = this.getModel(ModelNames.ViewModel);
    const newPurchaseData = viewModel.getProperty(
      "/productDetails/newPurchaseData"
    );

    const purchaseData =
      viewModel.getProperty("/productDetails/purchaseData") || [];

    purchaseData.push({ ...newPurchaseData });
    const sorted = purchaseData.sort(
      (
        a: { validFrom: string | number | Date },
        b: { validFrom: string | number | Date }
      ) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
    );
    viewModel.setProperty("/productDetails/purchaseData", sorted);
    const purchaseTable = this.byId("purchaseTable") as Table;
    purchaseTable.getBinding("items")?.refresh(true);

    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    oDataModel.createEntry(`/Products_to_Purchase`, {
      properties: newPurchaseData,
    });

    this.resetAllDialogs();

    this._pAddDialog.close();
  }*/

  /*public onSaveSales() {
    const validInput = this.checkFormInput("salesForm");
    if (!validInput) {
      MessageBox.error(this.getText("save.error.description.checkAgain"), {
        title: this.getText("error"),
      });
      return;
    }

    const viewModel = this.getModel(ModelNames.ViewModel);
    const newSalesData = viewModel.getProperty("/productDetails/newSalesData");

    const purchaseData =
      viewModel.getProperty("/productDetails/salesData") || [];

    purchaseData.push({ ...newSalesData });
    const sorted = purchaseData.sort(
      (
        a: { validFrom: string | number | Date },
        b: { validFrom: string | number | Date }
      ) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
    );
    viewModel.setProperty("/productDetails/salesData", sorted);
    const purchaseTable = this.byId("salesTable") as Table;
    purchaseTable.getBinding("items")?.refresh(true);

    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    oDataModel.createEntry(`/Products_to_Sales`, {
      properties: newSalesData,
    });

    this.resetAllDialogs();

    this._sAddDialog.close();
  }*/
  public onSaveWritingAppointment() {
    const validInput = this.checkFormInput("writingAppointmentForm");
    if (!validInput) {
      MessageBox.error(this.getText("save.error.description.checkAgain"), {
        title: this.getText("error"),
      });
      return;
    }

    const viewModel = this.getModel(ModelNames.ViewModel);
    const writingAppointmentComboBox = this.byId(
      "writingAppointmentComboBox"
    ) as ComboBox;
    const selectedKey = writingAppointmentComboBox.getSelectedKey();

    const productID = viewModel.getProperty("/productDetails/productID");
    const writingAppointmentData =
      viewModel.getProperty("/productDetails/writingAppointmentData") || [];

    // Check if writing appointment already exists for this product
    const existingAppointment = writingAppointmentData.find(
      (item: any) => item.writingAppointment_ID === selectedKey
    );

    if (existingAppointment) {
      MessageBox.error(this.getText("error.writingAppointment.duplicate"), {
        title: this.getText("error"),
      });
      return;
    }

    const newWritingAppointmentData = {
      product_ID: productID,
      writingAppointment_ID: selectedKey,
      writingAppointment: {
        name: writingAppointmentComboBox.getSelectedItem()?.getText(),
      },
    };
    writingAppointmentData.push(newWritingAppointmentData);
    viewModel.setProperty(
      "/productDetails/writingAppointmentData",
      writingAppointmentData
    );
    this.setMandatoryAvailableFrom();

    const writingAppointmentTable = this.byId(
      "writingAppointmentTable"
    ) as Table;
    writingAppointmentTable.getBinding("items")?.refresh(true);

    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    oDataModel.createEntry(`/ProductsToWritingAppointments`, {
      properties: {
        product_ID: productID,
        writingAppointment_ID: selectedKey,
      },
    });

    this.resetAllDialogs();
    this._wAddDialog.close();
  }

  private async setupJSONModelsForTables() {
    const viewModel = this.getModel(ModelNames.ViewModel) as JSONModel;
    /* GPOPT-1175: Remove valid range in purchase and sales data
    const data = await this.fetchPurchaseData(viewModel);
    const salesData = await this.fetchSalesData(viewModel);
    */
    const writingAppointments = await this.fetchWritingAppointments(viewModel);
    const sizeData = await this.fetchSizeData(viewModel);
    /* GPOPT-1175: Remove valid range in purchase and sales data
    this._setTableDataset(viewModel, "/productDetails/purchaseData", data);
    this._setTableDataset(viewModel, "/productDetails/salesData", salesData);
    */
    viewModel.setProperty(
      "/productDetails/writingAppointmentData",
      writingAppointments
    );
    this.setMandatoryAvailableFrom();
    viewModel.setProperty("/productDetails/sizeData", sizeData);
    viewModel.setProperty("/productDetails/newPurchaseData", {
      up__ID: viewModel.getProperty("/productDetails/productID"),
      validFrom: null,
      validTo: null,
      currency_ID: null,
      purchasePrice: null,
      purchaseFactor: null,
      purchasePriceUSD: null,
      purchasePriceEURNetto: null,
      productDiscount1: null,
      productDiscount2: null,
      productDiscount3: null,
    });
    viewModel.setProperty("/productDetails/newSalesData", {
      up__ID: viewModel.getProperty("/productDetails/productID"),
      validFrom: null,
      validTo: null,
      retailPrice: null,
      currentPrice: null,
      uvpType_ID: null,
      uvpPrice: null,
    });
    viewModel.setProperty("/productDetails/newSizeData", {
      product_ID: viewModel.getProperty("/productDetails/productID"),
      size_1_CODE: null,
      size_2_CODE: null,
      GTIN: null,
    });
    viewModel.setProperty("/productDetails/newWritingAppointmentData", {
      product_ID: viewModel.getProperty("/productDetails/productID"),
      writingAppointment_ID: null,
    });
  }

  private async fetchSizeData(viewModel: any) {
    const fetchSizeData = await this.readODataWithoutFilterEntites(
      `${viewModel.getData().productDetails.productPath}/to_Size`
    );
    return (fetchSizeData as any).results;
  }

  /* GPOPT-1175: Remove valid range in purchase and sales data
  private async fetchPurchaseData(viewModel: any) {
    const fetchPurchaseData = await this.readODataWithoutFilterEntites(
      `${viewModel.getData().productDetails.productPath}/to_Purchase`,
      {
        $expand: "currency,vat",
      }
    );
    return (fetchPurchaseData as any).results;
  }
  private async fetchSalesData(viewModel: any) {
    const fetchSalesData = await this.readODataWithoutFilterEntites(
      `${viewModel.getData().productDetails.productPath}/to_Sales`,
      {
        $expand: "uvpType",
      }
    );
    return (fetchSalesData as any).results;
  }*/

  private async fetchWritingAppointments(viewModel: any) {
    const fetchWritingAppointments = await this.readODataWithoutFilterEntites(
      `${viewModel.getData().productDetails.productPath}/to_WritingAppointments`,
      {
        $expand: "writingAppointment",
      }
    );
    return (fetchWritingAppointments as any).results;
  }

  public onAddWritingAppointment() {
    const detailsGeneral = this?.byId(SmartFormIDs.DetailsGeneral);
    const bindingContext = detailsGeneral?.getBindingContext();
    const productEntity = bindingContext?.getObject() as any;

    if (!this._wAddDialog) {
      // Use modern, promise-based fragment loading
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.CreateWritingAppointment", // Path to your fragment
      }).then((oDialog: any) => {
        // Type the resolved object
        this._wAddDialog = oDialog;
        this.getView()!.addDependent(this._wAddDialog);
        this._wAddDialog.open();
        const viewModel = this.getModel(ModelNames.ViewModel);
        const writingAppointmentComboBox = this.byId(
          "writingAppointmentComboBox"
        ) as ComboBox;
        const oBinding = writingAppointmentComboBox.getBinding(
          "items"
        ) as ListBinding;

        var aFilters = [
          new Filter("consumerTopic_ID", FilterOperator.EQ, productEntity?.consumerTopic_ID),
          new Filter("brand_ID", FilterOperator.EQ, productEntity?.brand_ID),
          new Filter("supplier_ID", FilterOperator.EQ, productEntity?.supplier_ID)
        ];

        oBinding?.filter(aFilters);
      });
    } else {
      const viewModel = this.getModel(ModelNames.ViewModel);
      const writingAppointmentComboBox = this.byId(
        "writingAppointmentComboBox"
      ) as ComboBox;
      const oBinding = writingAppointmentComboBox.getBinding(
        "items"
      ) as ListBinding;

      var aFilters = [
        new Filter("consumerTopic_ID", FilterOperator.EQ, productEntity?.consumerTopic_ID),
        new Filter("brand_ID", FilterOperator.EQ, productEntity?.brand_ID),
        new Filter("supplier_ID", FilterOperator.EQ, productEntity?.supplier_ID)
      ];

      oBinding?.filter(aFilters);
      this._wAddDialog.open();
    }
  }

  public async handleRouteMatchedAsync(
    event: Event,
    currentProductID: string,
    currentProductPath: string
  ): Promise<void> {
    try {
      var currentProductToPurchPath = "";
      var currentProductToSalesPath = "";

      this.initBindings(currentProductID, currentProductPath, "", ""); //productDeepIDs?.productToPurchaseID, productDeepIDs?.productToSalesID);
    } catch (error) {
      // ToDo

      this.navTo(RoutingRoutes.Main);
    }
  }

  /* GPOPT-1175: Remove valid range in purchase and sales data
  public async getDeepEntityIDs(currentProductPath: string): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get current to_Purchase ID
        const productToPurchaseData: any = await this.readODataEntites(
          `${currentProductPath}/to_Purchase`,
          [
            new Filter({
              filters: [
                new Filter({
                  path: "validFrom",
                  operator: FilterOperator.LE,
                  value1: new Date(),
                }),
                new Filter({
                  path: "validTo",
                  operator: FilterOperator.GE,
                  value1: new Date(),
                }),
              ],
              and: true,
            }),
          ],
          { $select: "ID" }
        );

        // Get current to_Sales ID
        const productToSalesData: any = await this.readODataEntites(
          `${currentProductPath}/to_Sales`,
          [
            new Filter({
              filters: [
                new Filter({
                  path: "validFrom",
                  operator: FilterOperator.LE,
                  value1: new Date(),
                }),
                new Filter({
                  path: "validTo",
                  operator: FilterOperator.GE,
                  value1: new Date(),
                }),
              ],
              and: true,
            }),
          ],
          { $select: "ID" }
        );
        resolve({
          productToPurchaseID: productToPurchaseData.results[0].ID,
          productToSalesID: productToPurchaseData.results[0].ID,
        });
      } catch (error) {
        reject();
        // ToDo
      }
    });
  }*/

  public initBindings(
    currentProductID: string,
    currentProductPath: string,
    currentProductToPurchPath: string,
    currentProductToSalesPath: string
  ): void {
    // Product details general
    const objectPageLayout = this?.byId(
      SmartFormIDs.DetailsObjectPage
    ) as ObjectPageLayout;
    objectPageLayout.bindElement(currentProductPath, {
      expand: "supplier,brand",
    });

    // Set binding to SmartForms
    const smartFormGeneral = this?.byId(
      SmartFormIDs.DetailsGeneral
    ) as SmartForm;
    smartFormGeneral.bindElement(currentProductPath, {
      expand:
        "supplier,consumerTopic,brand,topicComponent,assortmentModule,productGroup,targetGroup,module,baseUnitOfMeasure,houseGroup",
    });

    const smartFormArticleIdent = this?.byId(
      SmartFormIDs.DetailsIdent
    ) as SmartForm;
    smartFormArticleIdent.bindElement(currentProductPath, {
      expand:
        // "evaluationColor,sizeSystem,size1,size2,supplyType,seasonType,presentationType",
        "evaluationColor,sizeSystem,supplyType,seasonType,presentationType",
    });

    const smartFormArticlePurchase = this?.byId(
      SmartFormIDs.DetailsPurchase,
    ) as SmartForm;
    smartFormArticlePurchase.bindElement(currentProductPath, {
      expand:
        "vat,currency",
    });

    const smartFormArticleSales = this?.byId(
      SmartFormIDs.DetailsSales,
    ) as SmartForm;
    smartFormArticleSales.bindElement(currentProductPath, {
      expand:
        "merchandiseSecurityMethod,priceLabelMethod,hangerMethod",
    });

    // const smartFormPurchase = (this?.byId(SmartFormIDs.DetailsToPurchase) as SmartForm);
    // smartFormPurchase.bindElement(`${currentProductToPurchPath}`); //, { expand: "currency,vat" });

    // const smartFormSales = (this?.byId(SmartFormIDs.DetailsToSales) as SmartForm);
    // smartFormSales.bindElement(`${currentProductToSalesPath}`); //, { expand: "uvpType" });

    // const smartTablePurchase = (this?.byId("smartTablePurchase") as SmartTable);
    // smartTablePurchase.bindElement(`${currentProductPath}/Products_to_Purchase`); //, { expand: "currency,vat" });

    // const smartTableSales = (this?.byId("smartTableSales") as SmartTable);
    // smartTableSales.bindElement(`${currentProductPath}/Products_to_Sales`); //, { expand: "currency,vat" });

    const smartFormClassification = this?.byId(
      SmartFormIDs.DetailsClassification
    ) as SmartForm;
    smartFormClassification.bindElement(currentProductPath, {
      //expand: "pricatCatalog,productType,ownershipStatus,gridBox,priceLevel",
      expand: "pricatCatalog,productType,ownershipStatus,gridBox,omnichannel,series,license,program,occasion,property,quality,pattern,specialProduct,surfaceWashing,mainForm,stockingThickness",
    });

    const smartFormDelivery = this?.byId(SmartFormIDs.DetailssmartFormDelivery) as SmartForm;
    smartFormDelivery.bindElement(currentProductPath, {
      expand:
        "shippingInstruction,loadingGroup,transportChain,productionPlant,storageLocation",
    });

    const smartFormMaterialComposition = this?.byId(SmartFormIDs.DetailssmartFormMaterialComposition) as SmartForm;
    smartFormMaterialComposition.bindElement(currentProductPath, {
      expand:
        "material1,material2,material3,material4,material5",
    });

    const smartFormSalesPrice = this?.byId(SmartFormIDs.DetailssmartFormSalesPrice) as SmartForm;
    smartFormSalesPrice.bindElement(currentProductPath, {
      expand:
        "uvpType"
    });

    const smartFormSustainability = this?.byId(SmartFormIDs.DetailssmartFormSustainability) as SmartForm;
    if (smartFormSustainability) {
      smartFormSustainability.bindElement(currentProductPath, {
        expand: "sustainabilitySealOfApproval"
      });
    }

    const smartFormCare = this?.byId(SmartFormIDs.DetailssmartFormCare) as SmartForm;
    if (smartFormCare) {
      smartFormCare.bindElement(currentProductPath, {
        expand: "washing,bleaching,ironing,cleaning,drying"
      });
    }

    const smartFormLabel = this?.byId(SmartFormIDs.DetailsLabel) as SmartForm;
    smartFormLabel.bindElement(currentProductPath, {
      expand:
        "mainLabel,subLabel,sizeLabel,sizeCode,hangTag,stringWithSeal,priceSticker,careLabel,addHangTag",
    });

    const smartFormUnitsOfMeasure = this?.byId(SmartFormIDs.DetailsUnitsOfMeasure) as SmartForm;
    smartFormUnitsOfMeasure.bindElement(currentProductPath, {
        expand:
            "baseUnitOfMeasure,storageUnit",
    });

    const smartTableVariantTable = this?.byId(SmartFormIDs.DetailsVariantTableOpt) as SmartTable;
    smartTableVariantTable.rebindTable(true);
  }

  public onBeforeVariantRebindTable(oEvent: any): void {
    const bindingParams = oEvent.getParameter("bindingParams");
    const currentVariantID = this.getModel(
      ModelNames.ViewModel).getProperty("/productDetails/productID");

    const oFilter = new Filter(
      "product_ID",
      FilterOperator.EQ,
      `${currentVariantID}`
    );
    bindingParams.filters.push(oFilter);
  }

  public onCopyBtnPress(event: Event): void { }

  public onEditBtnPress(event: Event): void {
    const currentProductID: UUID = this.getModel(
      ModelNames.ViewModel
    ).getProperty("/productDetails/productID");
    this.navTo(RoutingRoutes.ProductDetails, {
      id: currentProductID,
      query: { action: RoutingActions.ProdDetailsChange },
    });
  }

  public onBeforeRebindTable(oSource: any) {
    const currentProductID: UUID = this.getModel(
      ModelNames.ViewModel
    ).getProperty("/productDetails/productID");

    var binding = oSource.getParameter("bindingParams");
    var oFilter = new Filter(
      "up__ID",
      FilterOperator.EQ,
      `${currentProductID}`
    );
    binding.filters.push(oFilter);
  }

  public async onSaveBtnPress(event: Event): Promise<void> {
    
    let oResult: IMandatoryEmptyFields;
    try {
      const productID = this.getModel(ModelNames.ViewModel).getProperty(
        "/productDetails/productID"
      );
      const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
      v2ODataModel.setDeferredGroups(["updateProduct"]);
      const objectPageLayout = this.byId(
        "ObjectPageLayout"
      ) as ObjectPageLayout;
      //const currentAvailableFrom = viewModelUI.getProperty("/productDetails/availableFrom");
      const oFrom = this.byId("availableFrom") as SmartField;
      const dFrom = this._getDateFromSmartField(oFrom);
      const bindingContext = objectPageLayout.getBindingContext();
      const currentStatus = bindingContext?.getProperty("status_ID");

      // Handle writing appointment delivery date updates
      const writingAppointmentData = this.getModel(
        ModelNames.ViewModel
      ).getProperty("/productDetails/writingAppointmentData");
      if (currentStatus !== "CreatedInSAP") {
        if (
          //!currentAvailableFrom &&
          (!dFrom) &&
          writingAppointmentData &&
          Array.isArray(writingAppointmentData)
        ) {
          const deliveryDates = writingAppointmentData
            .map((appointment: any) => appointment.deliveryDateVZ)
            .filter((date: any) => date !== null && date !== undefined);

          if (deliveryDates.length > 0) {
            // Find the earliest date
            const earliestDate = deliveryDates.reduce(
              (earliest: Date, current: Date) => {
                const currentDate = new Date(current);
                const earliestDate = new Date(earliest);
                return currentDate < earliestDate ? current : earliest;
              }
            );
            // Update the product with the earliest availableFrom date
            v2ODataModel.update(
              `/Products(ID='${productID}')`,
              {
                status_ID: "InProgress",
                availableFrom: earliestDate,
              },
              {
                groupId: "updateProduct",
              }
            );
          } else {
            // No delivery dates found, just update status
            v2ODataModel.update(
              `/Products(ID='${productID}')`,
              { status_ID: "InProgress" },
              {
                groupId: "updateProduct",
              }
            );
          }
        } else {
          // availableFrom already set, just update status
          v2ODataModel.update(
            `/Products(ID='${productID}')`,
            { status_ID: "InProgress" },
            {
              groupId: "updateProduct",
            }
          );
        }
      }
      const isDateValid = this.validateProductDates();
      if (!isDateValid) {
        MessageBox.error(this.getText("save.error.description.checkAgain"), {
          title: this.getText("error"),
        });
        return;
      }
      const isValid = await this.checkInputData();
      if (!isValid) {
        MessageBox.error(this.getText("save.error.description.checkAgain"), {
          title: this.getText("error"),
        });
        return;
      }
      v2ODataModel.submitChanges({
        groupId: "updateProduct",
      });
      const viewModel = this.getModel(ModelNames.ViewModel) as JSONModel;

      const purchaseItemsToDelete = this.getModel(
        ModelNames.ViewModel
      ).getProperty("/productDetails/purchaseItemsToDelete");
      const salesItemsToDelete = this.getModel(
        ModelNames.ViewModel
      ).getProperty("/productDetails/salesItemsToDelete");
      const writingAppointmentsToDelete = this.getModel(
        ModelNames.ViewModel
      ).getProperty("/productDetails/writingAppointmentsToDelete");
      const sizeItemsToDelete = this.getModel(ModelNames.ViewModel).getProperty(
        "/productDetails/sizeItemsToDelete"
      );

      if (sizeItemsToDelete) {
        for (const element of sizeItemsToDelete) {
          v2ODataModel.remove(
            `/ProductSizes(product_ID='${element.product_ID}',ID='${element.ID}')`,
            {
              groupId: "deleteSizes",
            }
          );
        }
      }

      if (writingAppointmentsToDelete) {
        for (const element of writingAppointmentsToDelete) {
          v2ODataModel.remove(
            `/ProductsToWritingAppointments(product_ID='${element.productID}',writingAppointment_ID='${element.writingAppointment_ID}')`,
            {
              groupId: "deleteWritingAppointments",
            }
          );
        }
      }

      if (writingAppointmentData && Array.isArray(writingAppointmentData)) {
        for (const appointment of writingAppointmentData) {
          const updateData: any = {};

          // Check if delivery dates have been modified
          if (appointment.deliveryDateVZ !== undefined) {
            updateData.deliveryDateVZ = appointment.deliveryDateVZ;
          }

          if (appointment.deliveryDateShop !== undefined) {
            updateData.deliveryDateShop = appointment.deliveryDateShop;
          }

          // Only update if there are changes
          if (Object.keys(updateData).length > 0) {
            v2ODataModel.update(
              `/ProductsToWritingAppointments(product_ID='${appointment.product_ID}',writingAppointment_ID='${appointment.writingAppointment_ID}')`,
              updateData,
              {
                groupId: "updateWritingAppointments",
              }
            );
          }
        }
      }
      this.currencyValue = bindingContext?.getProperty("currency_ID");
      this.aEmptyMandatoryFields = [];
      oResult = this.getEmptyMandatoryFields();

      if (Object.keys(v2ODataModel.getPendingChanges())?.length) {
        const productResponse: any = await this.submitProductChanges();
        v2ODataModel.refresh(true);
        await this.setupJSONModelsForTables();
        this._resetTableChangeBuffers(viewModel);
        /* GPOPT-1175: Remove valid range in purchase and sales data
        const newProductStatusCode =
          productResponse.__batchResponses[0].__changeResponses[0].statusCode;
        const newProductID =
          productResponse.__batchResponses[0].__changeResponses[0].data.ID;
          */
        const smartTableVariantTable = this?.byId(SmartFormIDs.DetailsVariantTableOpt) as SmartTable;
        smartTableVariantTable.rebindTable(true);
        // MessageBox.success(this.getText("save.success.description"), {
        //   title: this.getText("save.success.title"),
        // });
        // this.getRouter().navTo(RoutingRoutes.Main, {}, true);
        this.successFlag = true;
      } else {
        v2ODataModel.refresh(true);

        await this.setupJSONModelsForTables();
        this._resetTableChangeBuffers(viewModel);
        const smartTableVariantTable = this?.byId(SmartFormIDs.DetailsVariantTableOpt) as SmartTable;
        smartTableVariantTable.rebindTable(true);
        // MessageBox.success(this.getText("save.success.description"), {
        //   title: this.getText("save.success.title"),
        // });
        // this.getRouter().navTo(RoutingRoutes.Main, {}, true);
        this.successFlag = true;
      }
    } catch (error) {
      // ToDo
      MessageBox.error(this.getText("save.error.description.tryAgain"), {
        title: this.getText("error"),
      });
      console.log(error);
      return;
    }

    const that = this;
    const oResourceBundle = this.getResourceBundle();
    if (oResult.hasEmpty) {
      MessageBox.warning(oResourceBundle.getText("mandatory.fields.warning"), {
        actions: [
          MessageBox.Action.YES,
          MessageBox.Action.NO
        ],
        emphasizedAction: MessageBox.Action.YES,
        onClose: function (oAction: any) {
          if (oAction === MessageBox.Action.NO) {
            if (that.successFlag) {
              MessageBox.success(that.getText("save.success.description"), {
                title: that.getText("save.success.title"),
              });
            }
            that.successFlag = false;
            const currentProductID: UUID = that.getModel(
              ModelNames.ViewModel
            ).getProperty("/productDetails/productID");
            that.navTo(RoutingRoutes.ProductDetails, {
              id: currentProductID,
              query: { action: RoutingActions.ProdDetailsDisplay },
            });
          }
        }
      })
    } else {
      if (this.successFlag) {
        MessageBox.success(this.getText("save.success.description"), {
          title: this.getText("save.success.title"),
        });
      }
      this.successFlag = false;
      const currentProductID: UUID = this.getModel(
        ModelNames.ViewModel
      ).getProperty("/productDetails/productID");
      this.navTo(RoutingRoutes.ProductDetails, {
        id: currentProductID,
        query: { action: RoutingActions.ProdDetailsDisplay },
      });
    }
    
  }

  private getEmptyMandatoryFields(): IMandatoryEmptyFields {
    const objectPageLayout = this.byId("ObjectPageLayout") as ObjectPageLayout;
    this.setValueState(MandatoryFields, objectPageLayout);
    if (this.currencyValue === 'EUR') {
      this.unSetValueState(CurrencyDollarMandatoryFields, objectPageLayout)
      this.setValueState(CurrencyEuroMandatoryFields, objectPageLayout);
    } else if (this.currencyValue === 'USD') {
      this.unSetValueState(CurrencyEuroMandatoryFields, objectPageLayout);
      this.setValueState(CurrencyDollarMandatoryFields, objectPageLayout);
    }
    return {
      hasEmpty: this.aEmptyMandatoryFields.length > 0,
      aEmptyFields: this.aEmptyMandatoryFields
    }
  }

  private setValueState(mandatoryFields: any[], objectPageLayout: ObjectPageLayout): void {
    mandatoryFields.forEach((sFieldName) => {
      const oControl = this.getSmartFieldByBinding(objectPageLayout, sFieldName);
      if (!oControl) return;
      const sValue = oControl.getProperty("value");
      const bEmpty = (
        sValue === null ||
        sValue === undefined ||
        sValue === ""
      );
      if (bEmpty) {
        oControl.setValueState(ValueState.Error);
        this.aEmptyMandatoryFields.push(sFieldName);
      } else {
        oControl.setValueState(ValueState.None);
      }
    });
  }

  private unSetValueState(mandatoryFields: any[], objectPageLayout: ObjectPageLayout): void {
    mandatoryFields.forEach((sFieldName) => {
      const oControl = this.getSmartFieldByBinding(objectPageLayout, sFieldName);
      if (!oControl) return;
      oControl.setValueState(ValueState.None);
    });
  }

  private getSmartFieldByBinding(objectPageLayout: ObjectPageLayout, sFieldName: String): SmartField | undefined {
    let oFoundControl: SmartField | undefined;
    const SmartFields = objectPageLayout.findAggregatedObjects(true, (oControl) => {
      return oControl.isA("sap.ui.comp.smartfield.SmartField");
    });

    SmartFields.forEach((smartField) => {
      const oSF = smartField as SmartField;
      const oBindingInfo = oSF.getBindingInfo("value");
      if (oBindingInfo && oBindingInfo?.binding?.sPath === sFieldName) {
        oFoundControl = oSF;
      }
    });
    return oFoundControl;
  }

  private async checkInputData() {
    const generalChecked = await (
      this.byId("smartFormGeneralData") as SmartForm
    ).check();
    const identificationChecked = await (
      this.byId("smartFormArticleIdentlData") as SmartForm
    ).check();
    const classificationChecked = await (
      this.byId("smartFormArticleClassificationData") as SmartForm
    ).check();
    const otherChecked = await (
      this.byId("smartFormArticleOtherData") as SmartForm
    ).check();
    const labelChecked = await (
      this.byId("smartFormArticleLabelData") as SmartForm
    ).check();
    const purchaseChecked = await (
      this.byId("smartFormPurchase") as SmartForm
    ).check();
    const onlineChecked = await (
      this.byId("smartFormOnline") as SmartForm
    ).check();
    const deliveryChecked = await (
      this.byId("smartFormDelivery") as SmartForm
    ).check();
    const sustainabilityChecked = await (
      this.byId("smartFormSustainability") as SmartForm
    ).check();
    const careChecked = await (this.byId("smartFormCare") as SmartForm).check();
    const materialCompositionChecked = await (
      this.byId("smartFormMaterialComposition") as SmartForm
    ).check();
    return (
      generalChecked.length === 0 &&
      identificationChecked.length === 0 &&
      classificationChecked.length === 0 &&
      otherChecked &&
      labelChecked.length === 0 &&
      purchaseChecked.length === 0 &&
      onlineChecked.length === 0 &&
      deliveryChecked.length === 0 &&
      sustainabilityChecked.length === 0 &&
      careChecked.length === 0 &&
      materialCompositionChecked.length === 0
    );
  }

  public async onCancelBtnPress(event: Event): Promise<void> {
    const currentProductID: UUID = this.getModel(
      ModelNames.ViewModel
    ).getProperty("/productDetails/productID");
    const oDataV2 = this.getODataModel(ModelNames.ODataV2Model);
    await oDataV2.resetChanges();
    oDataV2.updateBindings(true);
    this.navTo(RoutingRoutes.ProductDetails, {
      id: currentProductID,
      query: { action: RoutingActions.ProdDetailsDisplay },
    });
  }
  public onDialogCancel(event: any) {
    this.resetAllDialogs();
    event.getSource().getParent().close();
  }

  private resetAllDialogs() {
    const viewModel = this.getODataModel(ModelNames.ViewModel);

    viewModel.setProperty("/productDetails/newPurchaseData", {
      up__ID: viewModel.getProperty("/productDetails/productID"),
      validFrom: null,
      validTo: null,
      currency_ID: null,
      purchasePrice: null,
      purchaseFactor: null,
      purchasePriceUSD: null,
      purchasePriceEURNetto: null,
      productDiscount1: null,
      productDiscount2: null,
      productDiscount3: null,
    });
    viewModel.setProperty("/productDetails/newSalesData", {
      up__ID: viewModel.getProperty("/productDetails/productID"),
      validFrom: null,
      validTo: null,
      retailPrice: null,
      currentPrice: null,
      uvpType_ID: null,
      uvpPrice: null,
    });
    viewModel.setProperty("/productDetails/newSizeData", {
      product_ID: viewModel.getProperty("/productDetails/productID"),
      size_1_CODE: null,
      size_2_CODE: null,
      GTIN: null,
    });
    viewModel.setProperty("/productDetails/newWritingAppointmentData", {
      product_ID: viewModel.getProperty("/productDetails/productID"),
      writingAppointment_ID: null,
    });
    viewModel.setProperty("/productDetails/selectedDeliveryDate", null);

    if (this.byId("writingAppointmentComboBox"))
      (this.byId("writingAppointmentComboBox") as ComboBox).setSelectedKey("");
  }

  public onInnerControlsCreated(oEvent: any) { }

  public onSmartFieldInitialise(oEvent: any) {
    const oSmartfield = oEvent.getSource();
    const sFieldName = oSmartfield.getBindingPath("value");
    if (ProductNonEditableFields.includes(sFieldName)) {
      oSmartfield.setEditable(false);
    }
  }

  public handleValidation(oEvent: any) {
    const oControl = oEvent.getSource();
    const sValue = oControl.getValue();
    let validValue = true;

    // Only apply ComboBox-specific logic if it's a ComboBox
    if (oControl instanceof ComboBox) {
      const sSelectedKey = oControl.getSelectedKey();

      if (!sSelectedKey && sValue) {
        validValue = false;
      }
    }

    if (!validValue) {
      oControl.setValueState(ValueState.Error);
      oControl.setValueStateText("Ungültiger Wert!");
    } else {
      oControl.setValueState(ValueState.None);
    }
  }

  private checkFormInput(formId: string): boolean {
    const form = this.byId(formId) as SimpleForm;
    if (form) {
      const formControls = form.getContent();
      let hasErrors = false;

      for (const control of formControls) {
        if (control instanceof InputBase) {
          const sValue = control.getValue();
          const required = control.getProperty("required");
          const valueState = (control as any).getValueState();
          if (valueState === ValueState.Error) {
            hasErrors = true;
          } else if (required && !sValue) {
            control.setValueState(ValueState.Error);
            control.setValueStateText(this.getText("state.value.notValid"));
            hasErrors = true;
          }
        }
      }
      return !hasErrors;
    }
    return true;
  }

  public formatWritingAppointmentNames(writingAppointments: any[]): string {
    if (
      !writingAppointments ||
      !Array.isArray(writingAppointments) ||
      writingAppointments.length === 0
    ) {
      return "";
    }
    console.log(writingAppointments);

    return writingAppointments
      .filter((appointment) => appointment && appointment.name)
      .map((appointment) => appointment.name)
      .join(", ");
  }
  public onImagePress(): void {
    if (!this._imageDialog) {
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.ImageDialog",
      }).then((oDialog: any) => {
        this._imageDialog = oDialog;
        this.getView()!.addDependent(this._imageDialog);
        this._imageDialog.open();
      });
    } else {
      this._imageDialog.open();
    }
  }

  /**
   * Close image dialog
   */
  public onCloseImageDialog(): void {
    if (this._imageDialog) {
      this._imageDialog.close();
    }
  }

  public onUploadMethodChange(oEvent: any): void {
    const selectedIndex = oEvent.getParameter("selectedIndex");
    const fileSection = this.byId("fileUploadSection") as VBox;
    const urlSection = this.byId("urlInputSection") as VBox;

    if (selectedIndex === 0) {
      // File upload
      fileSection.setVisible(true);
      urlSection.setVisible(false);
    } else {
      // URL input
      fileSection.setVisible(false);
      urlSection.setVisible(true);
    }
  }

  private _isValidImageUrl(url: string): boolean {
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(url);
  }

  /**
   * Enable upload button
   */
  private _enableUploadButton(): void {
    const uploadButton = this.byId("uploadButton") as Button;
    uploadButton.setEnabled(true);
  }

  /**
   * Disable upload button
   */
  private _disableUploadButton(): void {
    const uploadButton = this.byId("uploadButton") as Button;
    uploadButton.setEnabled(false);
  }

  private _convertFileToBase64(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      this._selectedImageData = reader.result as string;
      this._enableUploadButton();
    };

    reader.readAsDataURL(file);
  }

  public onFileChange(oEvent: any): void {
    const file = oEvent.getParameter("files")[0];

    if (file) {
      this._convertFileToBase64(file);
    }
  }
  public onUrlChange(oEvent: any): void {
    const input = oEvent.getSource() as Input;
    const url = input.getValue().trim();

    if (this._isValidImageUrl(url)) {
      this._selectedImageData = url;
      this._enableUploadButton();
    } else {
      this._selectedImageData = "";
      this._disableUploadButton();
    }
  }

  public async onUploadImage(): Promise<void> {
    try {
      const productID = this.getModel(ModelNames.ViewModel).getProperty(
        "/productDetails/productID"
      );

      await this._saveImageToBackend(productID, this._selectedImageData);

      MessageToast.show(this.getText("image.upload.success"));
      this.onCloseImageDialog();
    } catch (error) {
      MessageToast.show(this.getText("image.upload.failed"));
    }
  }

  private async _saveImageToBackend(
    productID: string,
    imageData: string
  ): Promise<void> {
    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    const isUrl = imageData.startsWith("http");

    return new Promise((resolve, reject) => {
      // Prepare parameters for the changeImage action
      const parameters = {
        ID: productID,
        imageUrl: isUrl ? imageData : "", // URL if it's a URL, empty if base64
        imageBase64: isUrl ? "" : imageData, // base64 if it's a file, empty if URL
      };

      // Call the bound action on the specific product
      const actionPath = `/Products_changeImage`;

      oDataModel.callFunction(actionPath, {
        method: "POST",
        urlParameters: parameters,
        success: (data: any) => {
          oDataModel.refresh();

          resolve(data);
        },
        error: (error: any) => {
          console.error("Error updating image:", error);
          reject(error);
        },
      });
    });
  }
  formatStatusIcon(status: string): string {
    switch (status) {
      case "InProgress":
        return "sap-icon://information";
      case "ToCheck":
        return "sap-icon://alert";
      case "RequestedToSAP":
        return "sap-icon://information";
      case "CreationFailed":
        return "sap-icon://error";
      case "CreatedInSAP":
        return "sap-icon://sys-enter-2";
      case "NewSupplierProduct":
        return "sap-icon://information";
      case "PartiallyCreatedInSAP":
        return "sap-icon://information";
      default:
        return "None";
    }
  }

  formatStatusState(status: string): string {
    switch (status) {
      case "InProgress":
        return "Warning";
      case "ToCheck":
        return "Warning";
      case "RequestedToSAP":
        return "Information";
      case "CreationFailed":
        return "Error";
      case "MarkedForDeletion":
        return "Error";
      case "CreatedInSAP":
        return "None";
      case "ReleasedForSupplier":
        return "Warning";
      case "NewSupplierProduct":
        return "Information";
      case "PartiallyCreatedInSAP":
        return "Information";
      default:
        return "None";
    }
  }

  formatStatusName(status: string): string {
    switch (status) {
      case "InProgress":
        return "In Bearbeitung";
      case "ToCheck":
        return "Artikel prüfen";
      case "RequestedToSAP":
        return "Anfrage SAP-Anlage";
      case "CreationFailed":
        return "Artikelanlage fehlgeschlagen";
      case "MarkedForDeletion":
        return "Zur Löschung markiert";
      case "CreatedInSAP":
        return "Artikel in SAP angelegt";
      case "ReleasedForSupplier":
        return "Artikel für Lieferanten freigegeben";
      case "NewSupplierProduct":
        return "Neuer Lieferantenartikel";
      case "PartiallyCreatedInSAP":
        return "Nicht vollständig in ERP erstellt";
      default:
        return "None";
    }
  }
  public async onConfirmSAPCreation(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("ObjectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("Kein Produkt ausgewählt");
      return;
    }

    if (Object.keys(oModel.hasPendingChanges())) {
      const oResponse = this.submitProductChanges();
    }
    const productID = bindingContext.getProperty("ID");
    const existence = await this.validateChildExistence(oModel, productID, '2');
    if (!existence) return

    MessageBox.confirm(this.getText("sapCreation.confirmation"), {
      title: this.getText("sapCreation.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            // const productID = bindingContext.getProperty("ID");

            await new Promise<void>((resolve, reject) => {
              oModel.callFunction("/createSAPProduct", {
                method: "POST",
                urlParameters: {
                  product_ID: productID,
                  level: '2'
                },
                success: () => {
                  MessageToast.show(this.getText("sapCreation.success"));
                  oModel.refresh();
                  resolve();
                },
                error: (error: any) => {
                  const errorMessage = error?.responseText
                    ? JSON.parse(error.responseText)?.error?.message?.value
                    : this.getText("sapCreation.error");
                  MessageBox.error(errorMessage);
                  console.error("Error creating in SAP:", error);
                  oModel.refresh();
                  reject(error);
                },
              });
            });
          } catch (error) {
            console.error("Error in SAP creation process:", error);
          }
        }
      },
    });
  }

  async onRelease(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("ObjectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("Kein Produkt ausgewählt");
      return;
    }
    MessageBox.confirm(this.getText("release.confirmation"), {
      title: this.getText("release.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const productPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                productPath,
                { status_ID: "ToCheck" },
                {
                  success: () => {
                    MessageToast.show(this.getText("release.success"));
                    oModel.refresh();
                    resolve();
                  },
                  error: (error: any) => {
                    const errorMessage = error?.responseText
                      ? JSON.parse(error.responseText)?.error?.message?.value
                      : this.getText("release.error");
                    MessageBox.error(errorMessage);
                    console.error("Error releasing planning:", error);
                    reject(error);
                  },
                }
              );
            });
          } catch (error) {
            console.error("Error in release process:", error);
          }
        }
      },
    });
  }

  async onMarkForDeletion(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("ObjectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("Kein Produkt ausgewählt");
      return;
    }
    MessageBox.confirm(this.getText("deletion.confirmation.option"), {
      title: this.getText("deletion.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            // await new Promise<void>((resolve, reject) => {
            //   oModel.update(
            //     planningPath,
            //     { status_ID: "MarkedForDeletion" },
            //     {
            //       success: () => {
            //         MessageToast.show(this.getText("deletion.success"));
            //         oModel.refresh();
            //         resolve();
            //       },
            //       error: (error: any) => {
            //         const errorMessage = error?.responseText
            //           ? JSON.parse(error.responseText)?.error?.message?.value
            //           : this.getText("deletion.error");
            //         MessageBox.error(errorMessage);
            //         console.error(
            //           "Error marking planning for deletion:",
            //           error
            //         );
            //         reject(error);
            //       },
            //     }
            //   );
            // });
            await new Promise<void>((resolve, reject) => {
              const productId = this.getModel(
                ModelNames.ViewModel).getProperty("/productDetails/productID")

              const parameters = {
                ID: productId,
              }
              const sActionPath = "/Products_markForDeletion";
              oModel.callFunction(sActionPath, {
                method: "POST",
                urlParameters: parameters,
                success: (data: any) => {
                  MessageToast.show(this.getText("deletion.success"));
                  oModel.refresh();
                  resolve(data);
                },
                error: (error: any) => {
                  const errorMessage = error?.responseText
                    ? JSON.parse(error.responseText)?.error?.message?.value
                    : this.getText("deletion.error");
                  MessageBox.error(errorMessage);
                  console.error("Error marking for deletion:", error);
                  reject(error);
                }
              })
            })
          } catch (error) {
            console.error("Error in deletion process:", error);
          }
        }
      },
    });
  }
  public async onReleasedForSupplier(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("ObjectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("Kein Produkt ausgewählt");
      return;
    }
    MessageBox.confirm(this.getText("releasedForSupplier.confirmation"), {
      title: this.getText("releasedForSupplier.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                planningPath,
                {
                  status_ID: "ReleasedForSupplier",
                },
                {
                  success: () => {
                    MessageToast.show(
                      this.getText("releasedForSupplier.success")
                    );
                    oModel.refresh();
                    resolve();
                  },
                  error: (error: any) => {
                    const errorMessage = error?.responseText
                      ? JSON.parse(error.responseText)?.error?.message?.value
                      : this.getText("releasedForSupplier.error");
                    MessageBox.error(errorMessage);
                    console.error("Error releasing for Supplier:", error);
                    oModel.refresh();
                    reject(error);
                  },
                }
              );
            });
          } catch (error) {
            console.error("Error in releasing for Supplier:", error);
          }
        }
      },
    });
  }
  private readonly _purchaseUpdateFields = [
    "validFrom",
    "validTo",
    "currency_ID",
    "vat_ID",
    "purchasePrice",
    "purchaseFactor",
    "purchasePriceUSD",
    "purchasePriceEURNetto",
    "",
    "productDproductDiscount1iscount2",
    "productDiscount3",
  ];
  private readonly _salesUpdateFields = [
    "validFrom",
    "validTo",
    "retailPrice",
    "currentPrice",
    "uvpType_ID",
    "uvpPrice",
  ];

  private _collectChangedItems(
    current: any[] = [],
    original: any[] = [],
    relevantFields: string[]
  ): Array<{ entity: any; payload: Record<string, any> }> {
    const originalMap = new Map(
      original
        .filter((item: any) => item?.ID)
        .map((item: any) => [item.ID, item])
    );

    return current
      .filter((item: any) => item?.ID && originalMap.has(item.ID))
      .map((item: any) => {
        const patch = this._buildPatch(
          item,
          originalMap.get(item.ID),
          relevantFields
        );
        return patch ? { entity: item, payload: patch } : null;
      })
      .filter(
        (item): item is { entity: any; payload: Record<string, any> } =>
          item !== null
      );
  }

  private _buildPatch(
    updated: any,
    original: any,
    relevantFields: string[]
  ): Record<string, any> | null {
    if (!updated || !original) {
      return null;
    }

    const payload: Record<string, any> = {};
    let hasChanges = false;

    relevantFields.forEach((field) => {
      if (updated[field] !== original[field]) {
        payload[field] = updated[field];
        hasChanges = true;
      }
    });

    return hasChanges ? payload : null;
  }

  private _resetTableChangeBuffers(viewModel: JSONModel): void {
    viewModel.setProperty("/productDetails/purchaseItemsToDelete", []);
    viewModel.setProperty("/productDetails/salesItemsToDelete", []);
    viewModel.setProperty("/productDetails/writingAppointmentsToDelete", []);
    viewModel.setProperty("/productDetails/sizeItemsToDelete", []);
  }

  private _setTableDataset(
    viewModel: JSONModel,
    dataPath: string,
    data: any[] = []
  ): void {
    viewModel.setProperty(dataPath, data);
    viewModel.setProperty(
      `${dataPath}Original`,
      JSON.parse(JSON.stringify(data ?? []))
    );
  }
  setMandatoryAvailableFrom(): void {
    const availableFromField = this.byId("availableFrom") as SmartField;
    const writingAppointmentData = this.getModel(
      ModelNames.ViewModel
    ).getProperty("/productDetails/writingAppointmentData");

    const deliveryDates = writingAppointmentData
      .map((appointment: any) => appointment.deliveryDateVZ)
      .filter((date: any) => date !== null && date !== undefined);

    if (deliveryDates.length > 0) {
      // availableFromField.setMandatory(false);
    } else {
      // availableFromField.setMandatory(true);
    }
  }
}
