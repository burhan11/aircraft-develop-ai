import Controller from "sap/ui/core/mvc/Controller";
import BaseController from "./BaseController.controller";
import UIComponent from "sap/ui/core/UIComponent";
import Event from "sap/ui/base/Event";
import SimpleForm from "sap/ui/layout/form/SimpleForm";
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
  VariantMandatoryFields,
  CurrencyEuroMandatoryFields,
  CurrencyDollarMandatoryFields
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
import * as path from "node:path";
import { actions } from "sap/fe/test/ListReport";
import { IMandatoryEmptyFields } from "../utils/interfaces/IMandotaryEmptyFields.interface";
import { VariantNonEditableFields } from "../utils/enums/nonEditableFields";


/**
 * @namespace com.valantic.preorder.products.controller
 */
export default class VariantDetails extends BaseController {
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
    const route = this.getRouter()?.getRoute(RoutingRoutes.VariantDetails);
    route?.attachMatched(this.handleRouteMatched, this);

    this.getView()?.setModel(Messaging.getMessageModel(), "message");

    // activate automatic message generation for complete view
    Messaging.registerObject(this.getView() as View, true);

    // const objectPageLayout = this?.byId(
    //         SmartFormIDs.DetailsObjectPageVar
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

  public validateProductDates(): boolean {
    // sap.ui.getCore().getMessageManager().removeAllMessages();
    this._removeDateValidationMessages();

    const oFrom = this.byId("availableFromVar") as any;
    const oUntil = this.byId("availableUntilVar") as any;
    const oEol = this.byId("endOfLifeCycleVar") as any;

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
    const viewModel = this.getModel(ModelNames.ViewModelVariant);
    const aWritingData = viewModel.getProperty("/variantDetails/writingAppointmentData");

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
    var currentVariantID: UUID = routingParameters?.arguments?.id;
    var currentVariantPath = v2ODataModel.createKey("/ProductSizes", {
      ID: currentVariantID,
    });
    var bIsInEditMode: boolean = false;

    // Apply action
    switch (currentAction) {
      case RoutingActions.VarDetailsDisplay:
        bIsInEditMode = false;
        break;

      case RoutingActions.VarDetailsCreate:
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

      case RoutingActions.VarDetailsChange:
        bIsInEditMode = true;
        break;

      default:
        break;
    }
    this.getModel(ModelNames.ViewModelVariant).setProperty(
      "/variantDetails/isInEditMode",
      bIsInEditMode
    );

    // Set product ID and Path to viewModel
    this.getModel(ModelNames.ViewModelVariant).setProperty(
      "/variantDetails/variantID",
      currentVariantID
    );
    this.getModel(ModelNames.ViewModelVariant).setProperty(
      "/variantDetails/variantPath",
      currentVariantPath
    );

    await this.setupJSONModelsForTables();
    this.validateProductDates();
    const SAPCreationButtonVisibilty = await new Promise<any>((resolve, reject) => {
      try {
        v2ODataModel.callFunction("/checkHigherLevelStatus", {
          method: "GET",
          urlParameters: { variant_ID: currentVariantID },
          success: (response: any) => resolve(response.checkHigherLevelStatus),
          error: (error: any) => reject(error)
        })
      } catch (error) {
        console.log(error);
      }
    })

    //Check if article parent is already created in SAP
    let isArticleInSAP = false;

    const variantData = await new Promise<any>((resolve) => {
      v2ODataModel.read(currentVariantPath, {
        urlParameters: { "$expand": "article" },
        success: (data: any) => resolve(data),
        error: () => resolve({})
      });
    });

    const articleStatus = variantData?.article?.status_ID;
    if (articleStatus === "CreatedInSAP") {
      isArticleInSAP = true;
    }

    const isVariantCreated = variantData?.status_ID === "CreatedInSAP";

    const finalVisibility = !isVariantCreated && (SAPCreationButtonVisibilty === true || isArticleInSAP === true);

    this.byId("idSAPCreationButton")?.setVisible(finalVisibility);

    // Call async handle route matched
    this.handleRouteMatchedAsync(event, currentVariantID, currentVariantPath);
  }

  private _callODataV2Function<T>(
    oModel: ODataModel,
    sFunctionName: string,
    urlParameters: any,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      oModel.callFunction(sFunctionName, {
        urlParameters: urlParameters,
        method: "GET",
        success: (data: any) => {
          resolve(data as any as T);
        },
        error: (oError: any) => {
          console.log(oError);
          reject(oError);
        },
      });
    });
  }

  public onSaveWritingAppointment() {
    const validInput = this.checkFormInput("writingAppointmentForm");
    if (!validInput) {
      MessageBox.error(this.getText("save.error.description.checkAgain"), {
        title: this.getText("error"),
      });
      return;
    }

    const viewModel = this.getModel(ModelNames.ViewModelVariant);
    const writingAppointmentComboBox = this.byId(
      "writingAppointmentComboBox"
    ) as ComboBox;
    const selectedKey = writingAppointmentComboBox.getSelectedKey();

    const variantID = viewModel.getProperty("/variantDetails/variantID");
    const writingAppointmentData =
      viewModel.getProperty("/variantDetails/writingAppointmentData") || [];

    // Check if writing appointment already exists for this variant
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
      productSize_ID: variantID,
      writingAppointment_ID: selectedKey,
      writingAppointment: {
        name: writingAppointmentComboBox.getSelectedItem()?.getText(),
      },
    };
    writingAppointmentData.push(newWritingAppointmentData);
    viewModel.setProperty(
      "/variantDetails/writingAppointmentData",
      writingAppointmentData
    );
    this.setMandatoryAvailableFrom();

    const writingAppointmentTable = this.byId(
      "writingAppointmentTableVar"
    ) as Table;
    writingAppointmentTable.getBinding("items")?.refresh(true);

    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    oDataModel.createEntry(`/ProductSizesToWritingAppointments`, {
      properties: {
        productSize_ID: variantID,
        writingAppointment_ID: selectedKey,
      },
    });

    this.resetAllDialogs();
    this._wAddDialog.close();
  }

  private async setupJSONModelsForTables() {
    const viewModel = this.getModel(ModelNames.ViewModelVariant) as JSONModel;
    const writingAppointments = await this.fetchWritingAppointments(viewModel);

    viewModel.setProperty(
      "/variantDetails/writingAppointmentData",
      writingAppointments
    );
    this.setMandatoryAvailableFrom();

    viewModel.setProperty("/variantDetails/newPurchaseData", {
      up__ID: viewModel.getProperty("/variantDetails/variantID"),
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
    viewModel.setProperty("/variantDetails/newSalesData", {
      up__ID: viewModel.getProperty("/variantDetails/variantID"),
      validFrom: null,
      validTo: null,
      retailPrice: null,
      currentPrice: null,
      uvpType_ID: null,
      uvpPrice: null,
    });
    viewModel.setProperty("/variantDetails/newWritingAppointmentData", {
      productSize_ID: viewModel.getProperty("/variantDetails/variantID"),
      writingAppointment_ID: null,
    });
  }

  private async fetchWritingAppointments(viewModel: any) {
    const fetchWritingAppointments = await this.readODataWithoutFilterEntites(
      `${viewModel.getData().variantDetails.variantPath}/to_WritingAppointments`,
      {
        $expand: "writingAppointment",
      }
    );
    return (fetchWritingAppointments as any).results;
  }

  public onAddWritingAppointment() {
    const detailsGeneral = this?.byId(SmartFormIDs.DetailsGeneralVar);
    const bindingContext = detailsGeneral?.getBindingContext();
    const variantEntity = bindingContext?.getObject() as any;

    if (!this._wAddDialog) {
      // Use modern, promise-based fragment loading
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.CreateWritingAppointment", // Path to your fragment
      }).then((oDialog: any) => {
        // Type the resolved object
        this._wAddDialog = oDialog;
        this.getView()!.addDependent(this._wAddDialog);
        this._wAddDialog.open();
        const viewModel = this.getModel(ModelNames.ViewModelVariant);
        const writingAppointmentComboBox = this.byId(
          "writingAppointmentComboBox"
        ) as ComboBox;
        const oBinding = writingAppointmentComboBox.getBinding(
          "items"
        ) as ListBinding;

        var aFilters = [
          new Filter("consumerTopic_ID", FilterOperator.EQ, variantEntity?.consumerTopic_ID),
          new Filter("brand_ID", FilterOperator.EQ, variantEntity?.brand_ID),
          new Filter("supplier_ID", FilterOperator.EQ, variantEntity?.supplier_ID)
        ];

        oBinding?.filter(aFilters);
      });
    } else {
      const viewModel = this.getModel(ModelNames.ViewModelVariant);
      const writingAppointmentComboBox = this.byId(
        "writingAppointmentComboBox"
      ) as ComboBox;
      const oBinding = writingAppointmentComboBox.getBinding(
        "items"
      ) as ListBinding;

      var aFilters = [
        new Filter("consumerTopic_ID", FilterOperator.EQ, variantEntity?.consumerTopic_ID),
        new Filter("brand_ID", FilterOperator.EQ, variantEntity?.brand_ID),
        new Filter("supplier_ID", FilterOperator.EQ, variantEntity?.supplier_ID)
      ];

      oBinding?.filter(aFilters);
      this._wAddDialog.open();
    }
  }

  public async handleRouteMatchedAsync(
    event: Event,
    currentVariantID: string,
    currentVariantPath: string
  ): Promise<void> {
    try {
      var currentVariantToPurchPath = "";
      var currentVariantToSalesPath = "";

      this.initBindings(currentVariantID, currentVariantPath);
    } catch (error) {
      // ToDo

      this.navTo(RoutingRoutes.Main);
    }
  }

  public initBindings(
    currentVariantID: string,
    currentVariantPath: string
  ): void {
    // Product details general
    const objectPageLayout = this?.byId(
      SmartFormIDs.DetailsObjectPageVar
    ) as ObjectPageLayout;
    objectPageLayout.bindElement(currentVariantPath, {
      expand: "supplier,brand",
    });

    // Set binding to SmartForms
    const smartFormGeneral = this?.byId(
      SmartFormIDs.DetailsGeneralVar
    ) as SmartForm;
    smartFormGeneral.bindElement(currentVariantPath, {
      expand:
        "supplier,consumerTopic,brand,topicComponent,assortmentModule,productGroup,targetGroup,module,baseUnitOfMeasure,houseGroup",
    });

    const smartFormArticleIdent = this?.byId(
      SmartFormIDs.DetailsIdentVar
    ) as SmartForm;
    smartFormArticleIdent.bindElement(currentVariantPath, {
      expand:
        "evaluationColor,sizeSystem,size_1,size_2,supplyType,seasonType,presentationType",
    });

    const smartFormArticlePurchase = this?.byId(
      SmartFormIDs.DetailsPurchaseVar,
    ) as SmartForm;
    smartFormArticlePurchase.bindElement(currentVariantPath, {
      expand:
        "vat,currency",
    });

    const smartFormArticleSales = this?.byId(
      SmartFormIDs.DetailsSalesVar,
    ) as SmartForm;
    smartFormArticleSales.bindElement(currentVariantPath, {
      expand:
        "merchandiseSecurityMethod,priceLabelMethod,hangerMethod",
    });

    const smartFormClassification = this?.byId(
      SmartFormIDs.DetailsClassificationVar
    ) as SmartForm;
    smartFormClassification.bindElement(currentVariantPath, {
      expand: "pricatCatalog,productType,ownershipStatus,gridBox,omnichannel,series,license,program,occasion,property,quality,pattern,specialProduct,surfaceWashing,mainForm,stockingThickness",
    });

    const smartFormDelivery = this?.byId(SmartFormIDs.DetailssmartFormDeliveryVar) as SmartForm;
    smartFormDelivery.bindElement(currentVariantPath, {
      expand:
        "shippingInstruction,loadingGroup,transportChain,productionPlant,storageLocation",
    });

    const smartFormMaterialComposition = this?.byId(SmartFormIDs.DetailssmartFormMaterialCompositionVar) as SmartForm;
    smartFormMaterialComposition.bindElement(currentVariantPath, {
      expand:
        "material1,material2,material3,material4,material5",
    });

    const smartFormSalesPrice = this?.byId(SmartFormIDs.DetailssmartFormSalesPriceVar) as SmartForm;
    smartFormSalesPrice.bindElement(currentVariantPath, {
      expand:
        "uvpType"
    });

    const smartFormSustainability = this?.byId(SmartFormIDs.DetailssmartFormSustainabilityVar) as SmartForm;
    if (smartFormSustainability) {
      smartFormSustainability.bindElement(currentVariantPath, {
        expand: "sustainabilitySealOfApproval"
      });
    }

    const smartFormCare = this?.byId(SmartFormIDs.DetailssmartFormCareVar) as SmartForm;
    if (smartFormCare) {
      smartFormCare.bindElement(currentVariantPath, {
        expand: "washing,bleaching,ironing,cleaning,drying"
      });
    }

    const smartFormLabel = this?.byId(SmartFormIDs.DetailsLabelVar) as SmartForm;
    smartFormLabel.bindElement(currentVariantPath, {
      expand:
        "mainLabel,subLabel,sizeLabel,sizeCode,hangTag,stringWithSeal,priceSticker,careLabel,addHangTag",
    });

    const smartFormUnitsOfMeasure = this?.byId(SmartFormIDs.DetailsUnitsOfMeasureVar) as SmartForm;
    smartFormUnitsOfMeasure.bindElement(currentVariantPath, {
      expand:
        "baseUnitOfMeasure,storageUnit",
    });

  }

  public onEditBtnPress(event: Event): void {
    const currentVariantID: UUID = this.getModel(
      ModelNames.ViewModelVariant
    ).getProperty("/variantDetails/variantID");
    this.navTo(RoutingRoutes.VariantDetails, {
      id: currentVariantID,
      query: { action: RoutingActions.VarDetailsChange },
    });
  }

  public onBeforeRebindTable(oSource: any) {
    const currentVariantID: UUID = this.getModel(
      ModelNames.ViewModelVariant
    ).getProperty("/variantDetails/variantID");

    var binding = oSource.getParameter("bindingParams");
    var oFilter = new Filter(
      "up__ID",
      FilterOperator.EQ,
      `${currentVariantID}`
    );
    binding.filters.push(oFilter);
  }

  public onDeleteWritingAppointment() {
    const table = this.byId("writingAppointmentTableVar") as Table;
    const selectedItems = table.getSelectedItems();
    const selectedItemIDs = selectedItems.map((item) =>
      item
        .getBindingContext(ModelNames.ViewModelVariant)
        ?.getProperty("writingAppointment_ID")
    );
    const viewModel = this.getModel(ModelNames.ViewModelVariant);
    const data = viewModel.getData().variantDetails.writingAppointmentData;
    const variantID = viewModel.getProperty("/variantDetails/variantID");

    const writingAppointmentsToDelete = [];

    const updatedData = data.filter(
      (item: any) => !selectedItemIDs.includes(item.writingAppointment_ID)
    );
    viewModel.setProperty(
      "/variantDetails/writingAppointmentData",
      updatedData
    );
    this.setMandatoryAvailableFrom();

    for (const element of selectedItemIDs) {
      writingAppointmentsToDelete.push({
        productSizeID: variantID,
        writingAppointment_ID: element,
      });
    }

    viewModel.setProperty(
      "/variantDetails/writingAppointmentsToDelete",
      writingAppointmentsToDelete
    );
  }

  public async onSaveBtnPress(event: Event): Promise<void> {
    let oResult: IMandatoryEmptyFields;
    try {
      const variantID = this.getModel(ModelNames.ViewModelVariant).getProperty(
        "/variantDetails/variantID"
      );
      const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
      v2ODataModel.setDeferredGroups(["updateVariant"]);
      const objectPageLayout = this.byId(
        "ObjectPageLayoutVar"
      ) as ObjectPageLayout;
      const viewModelUI = this.getModel(ModelNames.ViewModelVariant);
      //const currentAvailableFrom = viewModelUI.getProperty("/variantDetails/availableFrom");
      const oFrom = this.byId("availableFromVar") as SmartField;
      const dFrom = this._getDateFromSmartField(oFrom);
      const bindingContext = objectPageLayout.getBindingContext();
      const currentAvailableFrom = bindingContext?.getProperty("availableFrom");
      const currentStatus = bindingContext?.getProperty("status_ID");

      // Handle writing appointment delivery date updates
      const writingAppointmentData = this.getModel(
        ModelNames.ViewModelVariant
      ).getProperty("/variantDetails/writingAppointmentData");
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
              `/ProductSizes(ID='${variantID}')`,
              {
                status_ID: "InProgress",
                availableFrom: earliestDate,
              },
              {
                groupId: "updateVariant",
              }
            );
          } else {
            // No delivery dates found, just update status
            v2ODataModel.update(
              `/ProductSizes(ID='${variantID}')`,
              { status_ID: "InProgress" },
              {
                groupId: "updateVariant",
              }
            );
          }
        } else {
          // availableFrom already set, just update status
          v2ODataModel.update(
            `/ProductSizes(ID='${variantID}')`,
            { status_ID: "InProgress" },
            {
              groupId: "updateVariant",
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
        groupId: "updateVariant",
      });
      const viewModel = this.getModel(ModelNames.ViewModelVariant) as JSONModel;

      // const purchaseItemsToDelete = this.getModel(
      //     ModelNames.ViewModelVariant
      // ).getProperty("/variantDetails/purchaseItemsToDelete");
      // const salesItemsToDelete = this.getModel(
      //     ModelNames.ViewModelVariant
      // ).getProperty("/variantDetails/salesItemsToDelete");
      const writingAppointmentsToDelete = this.getModel(
        ModelNames.ViewModelVariant
      ).getProperty("/variantDetails/writingAppointmentsToDelete");
      // const sizeItemsToDelete = this.getModel(ModelNames.ViewModelVariant).getProperty(
      //     "/variantDetails/sizeItemsToDelete"
      // );

      // if (sizeItemsToDelete) {
      //     for (const element of sizeItemsToDelete) {
      //         v2ODataModel.remove(
      //             `/ProductSizes(product_ID='${element.product_ID}',ID='${element.ID}')`,
      //             {
      //                 groupId: "deleteSizes",
      //             }
      //         );
      //     }
      // }

      if (writingAppointmentsToDelete) {
        for (const element of writingAppointmentsToDelete) {
          v2ODataModel.remove(
            `/ProductSizesToWritingAppointments(productSize_ID='${element.productSizeID}',writingAppointment_ID='${element.writingAppointment_ID}')`,
            {
              groupId: "deleteWritingAppointments",
            }
          );
        }
      }

      /* GPOPT-1175: Remove valid range in purchase and sales data
      if (purchaseItemsToDelete) {
        for (const element of purchaseItemsToDelete) {
          v2ODataModel.remove(
            `/Products_to_Purchase(up__ID='${element.up__ID}',ID='${element.ID}')`,
            {
              groupId: "deletePurchase",
            }
          );
        }
      }
 
      if (salesItemsToDelete) {
        for (const element of salesItemsToDelete) {
          v2ODataModel.remove(
            `/Products_to_Sales(up__ID='${element.up__ID}',ID='${element.ID}')`,
            {
              groupId: "deleteSales",
            }
          );
        }
      }
 
      const purchaseItemsToUpdate = this._collectChangedItems(
        viewModel.getProperty("/variantDetails/purchaseData"),
        viewModel.getProperty("/variantDetails/purchaseDataOriginal"),
        this._purchaseUpdateFields
      );
      purchaseItemsToUpdate.forEach(({ entity, payload }) => {
        v2ODataModel.update(
          `/Products_to_Purchase(up__ID='${entity.up__ID}',ID='${entity.ID}')`,
          payload,
          { groupId: "updatePurchase" }
        );
      });
 
      const salesItemsToUpdate = this._collectChangedItems(
        viewModel.getProperty("/variantDetails/salesData"),
        viewModel.getProperty("/variantDetails/salesDataOriginal"),
        this._salesUpdateFields
      );
      salesItemsToUpdate.forEach(({ entity, payload }) => {
        v2ODataModel.update(
          `/Products_to_Sales(up__ID='${entity.up__ID}',ID='${entity.ID}')`,
          payload,
          { groupId: "updateSales" }
        );
      });*/

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
              `/ProductSizesToWritingAppointments(productSize_ID='${appointment.productSize_ID}',writingAppointment_ID='${appointment.writingAppointment_ID}')`,
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

        // MessageBox.success(this.getText("save.success.description"), {
        //   title: this.getText("save.success.title"),
        // });
        // this.getRouter().navTo(RoutingRoutes.Main, {}, true);
        this.successFlag = true;
      } else {
        v2ODataModel.refresh(true);

        await this.setupJSONModelsForTables();
        this._resetTableChangeBuffers(viewModel);

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
            const currentVariantID: UUID = that.getModel(
              ModelNames.ViewModelVariant
            ).getProperty("/variantDetails/variantID");
            that.navTo(RoutingRoutes.VariantDetails, {
              id: currentVariantID,
              query: { action: RoutingActions.VarDetailsDisplay },
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
      const currentVariantID: UUID = this.getModel(
        ModelNames.ViewModelVariant
      ).getProperty("/variantDetails/variantID");
      this.navTo(RoutingRoutes.VariantDetails, {
        id: currentVariantID,
        query: { action: RoutingActions.VarDetailsDisplay },
      });
    }
  }

  private getEmptyMandatoryFields(): IMandatoryEmptyFields {
    const objectPageLayout = this.byId("ObjectPageLayoutVar") as ObjectPageLayout;
    this.setValueState(VariantMandatoryFields, objectPageLayout);
    if (this.currencyValue === 'EUR') {
      this.unSetValueState(CurrencyDollarMandatoryFields, objectPageLayout);
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
      this.byId("smartFormGeneralDataVar") as SmartForm
    ).check();
    const identificationChecked = await (
      this.byId("smartFormArticleIdentlDataVar") as SmartForm
    ).check();
    const classificationChecked = await (
      this.byId("smartFormArticleClassificationDataVar") as SmartForm
    ).check();
    const otherChecked = await (
      this.byId("smartFormArticleOtherDataVar") as SmartForm
    ).check();
    const labelChecked = await (
      this.byId("smartFormArticleLabelDataVar") as SmartForm
    ).check();
    const purchaseChecked = await (
      this.byId("smartFormPurchaseVar") as SmartForm
    ).check();
    const onlineChecked = await (
      this.byId("smartFormOnlineVar") as SmartForm
    ).check();
    const deliveryChecked = await (
      this.byId("smartFormDeliveryVar") as SmartForm
    ).check();
    const sustainabilityChecked = await (
      this.byId("smartFormSustainabilityVar") as SmartForm
    ).check();
    const careChecked = await (this.byId("smartFormCareVar") as SmartForm).check();
    const materialCompositionChecked = await (
      this.byId("smartFormMaterialCompositionVar") as SmartForm
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
      ModelNames.ViewModelVariant
    ).getProperty("/variantDetails/variantID");
    const oDataV2 = this.getODataModel(ModelNames.ODataV2Model);
    await oDataV2.resetChanges();
    oDataV2.updateBindings(true);
    this.navTo(RoutingRoutes.VariantDetails, {
      id: currentProductID,
      query: { action: RoutingActions.VarDetailsDisplay },
    });
  }

  public onDialogCancel(event: any) {
    this.resetAllDialogs();
    event.getSource().getParent().close();
  }

  private resetAllDialogs() {
    const viewModel = this.getODataModel(ModelNames.ViewModelVariant);

    viewModel.setProperty("/variantDetails/newPurchaseData", {
      up__ID: viewModel.getProperty("/variantDetails/variantID"),
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
    viewModel.setProperty("/variantDetails/newSalesData", {
      up__ID: viewModel.getProperty("/variantDetails/variantID"),
      validFrom: null,
      validTo: null,
      retailPrice: null,
      currentPrice: null,
      uvpType_ID: null,
      uvpPrice: null,
    });
    // viewModel.setProperty("/variantDetails/newSizeData", {
    //     product_ID: viewModel.getProperty("/variantDetails/variantID"),
    //     size_1_CODE: null,
    //     size_2_CODE: null,
    //     GTIN: null,
    // });
    viewModel.setProperty("/variantDetails/newWritingAppointmentData", {
      productSize_ID: viewModel.getProperty("/variantDetails/variantID"),
      writingAppointment_ID: null,
    });
    viewModel.setProperty("/variantDetails/selectedDeliveryDate", null);

    if (this.byId("writingAppointmentComboBox"))
      (this.byId("writingAppointmentComboBox") as ComboBox).setSelectedKey("");
  }

  public onInnerControlsCreated(oEvent: any) { }

  public onSmartFieldInitialise(oEvent: any) {
    const oSmartfield = oEvent.getSource();
    const sFieldName = oSmartfield.getBindingPath("value");
    if (VariantNonEditableFields.includes(sFieldName)) {
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

  // public onImagePress(): void {
  //     if (!this._imageDialog) {
  //         this.loadFragment({
  //             name: "com.valantic.preorder.products.view.fragments.ImageDialog",
  //         }).then((oDialog: any) => {
  //             this._imageDialog = oDialog;
  //             this.getView()!.addDependent(this._imageDialog);
  //             this._imageDialog.open();
  //         });
  //     } else {
  //         this._imageDialog.open();
  //     }
  // }

  /**
   * Close image dialog
   */
  // public onCloseImageDialog(): void {
  //     if (this._imageDialog) {
  //         this._imageDialog.close();
  //     }
  // }

  // public onUploadMethodChange(oEvent: any): void {
  //     const selectedIndex = oEvent.getParameter("selectedIndex");
  //     const fileSection = this.byId("fileUploadSection") as VBox;
  //     const urlSection = this.byId("urlInputSection") as VBox;

  //     if (selectedIndex === 0) {
  //         // File upload
  //         fileSection.setVisible(true);
  //         urlSection.setVisible(false);
  //     } else {
  //         // URL input
  //         fileSection.setVisible(false);
  //         urlSection.setVisible(true);
  //     }
  // }

  // private _isValidImageUrl(url: string): boolean {
  //     const urlPattern = /^https?:\/\/.+/i;
  //     return urlPattern.test(url);
  // }

  /**
   * Enable upload button
   */
  // private _enableUploadButton(): void {
  //     const uploadButton = this.byId("uploadButton") as Button;
  //     uploadButton.setEnabled(true);
  // }

  /**
   * Disable upload button
   */
  // private _disableUploadButton(): void {
  //     const uploadButton = this.byId("uploadButton") as Button;
  //     uploadButton.setEnabled(false);
  // }

  // private _convertFileToBase64(file: File): void {
  //     const reader = new FileReader();

  //     reader.onload = () => {
  //         this._selectedImageData = reader.result as string;
  //         this._enableUploadButton();
  //     };

  //     reader.readAsDataURL(file);
  // }

  // public onFileChange(oEvent: any): void {
  //     const file = oEvent.getParameter("files")[0];

  //     if (file) {
  //         this._convertFileToBase64(file);
  //     }
  // }
  // public onUrlChange(oEvent: any): void {
  //     const input = oEvent.getSource() as Input;
  //     const url = input.getValue().trim();

  //     if (this._isValidImageUrl(url)) {
  //         this._selectedImageData = url;
  //         this._enableUploadButton();
  //     } else {
  //         this._selectedImageData = "";
  //         this._disableUploadButton();
  //     }
  // }

  // public async onUploadImage(): Promise<void> {
  //     try {
  //         const variantID = this.getModel(ModelNames.ViewModelVariant).getProperty(
  //             "/variantDetails/variantID"
  //         );

  //         await this._saveImageToBackend(variantID, this._selectedImageData);

  //         MessageToast.show(this.getText("image.upload.success"));
  //         this.onCloseImageDialog();
  //     } catch (error) {
  //         MessageToast.show(this.getText("image.upload.failed"));
  //     }
  // }

  // private async _saveImageToBackend(
  //     variantID: string,
  //     imageData: string
  // ): Promise<void> {
  //     const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
  //     const isUrl = imageData.startsWith("http");

  //     return new Promise((resolve, reject) => {
  //         // Prepare parameters for the changeImage action
  //         const parameters = {
  //             ID: variantID,
  //             imageUrl: isUrl ? imageData : "", // URL if it's a URL, empty if base64
  //             imageBase64: isUrl ? "" : imageData, // base64 if it's a file, empty if URL
  //         };

  //         // Call the bound action on the specific product
  //         const actionPath = `/Products_changeImage`;

  //         oDataModel.callFunction(actionPath, {
  //             method: "POST",
  //             urlParameters: parameters,
  //             success: (data: any) => {
  //                 oDataModel.refresh();

  //                 resolve(data);
  //             },
  //             error: (error: any) => {
  //                 console.error("Error updating image:", error);
  //                 reject(error);
  //             },
  //         });
  //     });
  // }

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
    const objectPageLayout = this.byId("ObjectPageLayoutVar") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("Kein Produkt ausgewählt");
      return;
    }

    MessageBox.confirm(this.getText("sapCreation.confirmation"), {
      title: this.getText("sapCreation.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const variantID = bindingContext.getProperty("ID");

            await new Promise<void>((resolve, reject) => {
              oModel.callFunction("/createSAPProduct", {
                method: "POST",
                urlParameters: {
                  product_ID: variantID,
                  level: '3'
                },
                success: () => {
                  MessageToast.show(this.getText("sapCreation.success"));
                  oModel.refresh();
                  this.byId("idSAPCreationButton")?.setVisible(false);
                  resolve();
                },
                error: (error: any) => {
                  const errorMessage = error?.responseText && typeof error?.responseText === "string" ? error.responseText
                    : error?.responseText ? JSON.parse(error.responseText)?.error?.message?.value
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
    const objectPageLayout = this.byId("ObjectPageLayoutVar") as ObjectPageLayout;
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
            const variantPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                variantPath,
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
    const objectPageLayout = this.byId("ObjectPageLayoutVar") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("Kein Produkt ausgewählt");
      return;
    }
    MessageBox.confirm(this.getText("deletion.confirmation.variant"), {
      title: this.getText("deletion.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const variantPath = bindingContext.getPath();
            await new Promise<void>((resolve, reject) => {
              const variantd = this.getModel(
                ModelNames.ViewModelVariant).getProperty("/variantDetails/variantID")

              const parameters = {
                ID: variantd,
              }
              const sActionPath = "/ProductSizes_markForDeletion";
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
    const objectPageLayout = this.byId("ObjectPageLayoutVar") as ObjectPageLayout;
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
            const variantPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                variantPath,
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
    "productDiscount1",
    "productDiscount2",
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

  // private _collectChangedItems(
  //     current: any[] = [],
  //     original: any[] = [],
  //     relevantFields: string[]
  // ): Array<{ entity: any; payload: Record<string, any> }> {
  //     const originalMap = new Map(
  //         original
  //             .filter((item: any) => item?.ID)
  //             .map((item: any) => [item.ID, item])
  //     );

  //     return current
  //         .filter((item: any) => item?.ID && originalMap.has(item.ID))
  //         .map((item: any) => {
  //             const patch = this._buildPatch(
  //                 item,
  //                 originalMap.get(item.ID),
  //                 relevantFields
  //             );
  //             return patch ? { entity: item, payload: patch } : null;
  //         })
  //         .filter(
  //             (item): item is { entity: any; payload: Record<string, any> } =>
  //                 item !== null
  //         );
  // }

  // private _buildPatch(
  //     updated: any,
  //     original: any,
  //     relevantFields: string[]
  // ): Record<string, any> | null {
  //     if (!updated || !original) {
  //         return null;
  //     }

  //     const payload: Record<string, any> = {};
  //     let hasChanges = false;

  //     relevantFields.forEach((field) => {
  //         if (updated[field] !== original[field]) {
  //             payload[field] = updated[field];
  //             hasChanges = true;
  //         }
  //     });

  //     return hasChanges ? payload : null;
  // }

  private _resetTableChangeBuffers(viewModel: JSONModel): void {
    //     viewModel.setProperty("/variantDetails/purchaseItemsToDelete", []);
    //     viewModel.setProperty("/variantDetails/salesItemsToDelete", []);
    viewModel.setProperty("/variantDetails/writingAppointmentsToDelete", []);
    //     viewModel.setProperty("/variantDetails/sizeItemsToDelete", []);
  }

  // private _setTableDataset(
  //     viewModel: JSONModel,
  //     dataPath: string,
  //     data: any[] = []
  // ): void {
  //     viewModel.setProperty(dataPath, data);
  //     viewModel.setProperty(
  //         `${dataPath}Original`,
  //         JSON.parse(JSON.stringify(data ?? []))
  //     );
  // }

  setMandatoryAvailableFrom(): void {
    const availableFromField = this.byId("availableFromVar") as SmartField;
    const writingAppointmentData = this.getModel(
      ModelNames.ViewModelVariant
    ).getProperty("/variantDetails/writingAppointmentData");

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
