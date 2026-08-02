import Event from "sap/ui/base/Event";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import CustomListItem from "sap/m/CustomListItem";
import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController.controller";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import Select from "sap/m/Select";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import * as ExcelJS from "exceljs";
import Wizard from "sap/m/Wizard";
import FileUploader from "sap/ui/unified/FileUploader";
import WizardStep from "sap/m/WizardStep";
import Table from "sap/ui/table/Table";
import SmartForm from "sap/ui/comp/smartform/SmartForm";
import { UUID } from "crypto";
import { RoutingActions } from "../utils/enums/RoutingActions";
import { RoutingRoutes } from "../utils/enums/RoutingRoutes";
import { ProductStatus } from "../utils/enums/ProductStatus";

import { ModelNames } from "../utils/enums/ModelNames";
import { SmartFormIDs } from "../utils/enums/SmartFormIDs";
import { debug } from "console";
import { IUploadedArticle } from "../utils/interfaces/IUploadedArtice.interface";
import Column from "sap/ui/table/Column";
import Engine from "sap/m/p13n/Engine";
import SelectionController from "sap/m/p13n/SelectionController";
import SortController from "sap/m/p13n/SortController";
import { } from "sap/m/p13n/SelectionController";
import MetadataHelper from "sap/m/p13n/MetadataHelper";
import { SortOrder } from "sap/ui/core/library";
import FilterController from "sap/m/p13n/FilterController";
import ListBinding from "sap/ui/model/ListBinding";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import { IWritingAppointment } from "../utils/interfaces/IBaseData.interface";
import {
  MetadataItem,
  PersonalizationState,
} from "../utils/interfaces/ITableStates.interface";
import { getNewProductTemplate } from "../utils/NewProductTemplate";
import ComboBox from "sap/m/ComboBox";
import Fragment from "sap/ui/core/Fragment";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { setupUploadTablePersonalization } from "../utils/ProductUploadWizard";
import Input from "sap/m/Input";
import ObjectStatus from "sap/m/ObjectStatus";
import IconTabBar from "sap/m/IconTabBar";
import SmartChart from "sap/ui/comp/smartchart/SmartChart";
import SelectDialog from "sap/m/SelectDialog";
import StandardListItem from "sap/m/StandardListItem";
import SuggestionItem from "sap/m/SuggestionItem";
import VizFrame from "sap/viz/ui5/controls/VizFrame";
import Sorter from "sap/ui/model/Sorter";
import Chart from "sap/chart/Chart";
import SmartField from "sap/ui/comp/smartfield/SmartField";
import ViewSettingsDialog from "sap/m/ViewSettingsDialog";
import ViewSettingsItem from "sap/m/ViewSettingsItem";
import HBox from "sap/m/HBox";
import VBox from "sap/m/VBox";
import Label from "sap/m/Label";
import Item from "sap/ui/core/Item";
import Model from "sap/ui/model/Model";

/**
 * @namespace com.valantic.preorder.products.controller
 */
export default class Main extends BaseController {
  private _oWizardDialog!: Dialog;
  private newProductParamsAccepted: Boolean = false;
  private oDataHelper: any;
  private _pMassEditDialog: Dialog;
  private _oSearchDialog: Dialog;
  private _oSelectDialog: any;
  private _bInitialSortApplied: false;
  private _aPreviouslyAddedColumns: string[] = [];
  private _bInitialLoadDone = false;
  private variantAccepted: Boolean;
  private newArticleParamsAccepted: Boolean = false;
  private _masterDataCache: any = {};

  onComboBoxChange(oEvent: Event) {
    const oComboBox = oEvent.getSource() as ComboBox;
    const oSelectedItem = oComboBox.getSelectedItem();
    const sValue = oComboBox.getValue();
    if (!oSelectedItem && sValue) {
      // Set an error state
      oComboBox.setValueState("Error");
      oComboBox.setValueStateText("Bitte eine gültigen Wert wählen");

      // Crucially, clear the invalid selection from the model.
      // This prevents the custom text from being saved.
      oComboBox.setSelectedKey("");
    } else {
      // Case 2: The user selected a valid item or cleared the input.
      // In both cases, the state is valid.
      oComboBox.setValueState("None");
    }
  }

  async onSearchBtnPress(): Promise<void> {
    if (!this._oSearchDialog) {
      this._oSearchDialog = (await Fragment.load({
        id: this.getView()!.getId(),
        name: "com.valantic.preorder.products.view.fragments.ArticleSearch",
        controller: this,
      })) as Dialog;
      this.getView()!.addDependent(this._oSearchDialog);
    }
    this._oSearchDialog.open();
  }

  onBeforeRebindTable(oEvent: any): void {
    const mBindingParams = oEvent.getParameter("bindingParams");
    const aSorters = mBindingParams.sorter || [];
    const bUserSortedCreatedAt = aSorters.some(
      (s: any) => s.sPath === "createdAt",
    );
    if (bUserSortedCreatedAt) {
      return;
    }
    mBindingParams.sorter = [
      new Sorter("createdAt", true), // DESC
    ];
  }

  onCheckExistence(): void {
    const oInput = this.byId("searchInput") as Input;
    const sInputValue = oInput.getValue().trim();
    if (!sInputValue) {
      MessageBox.error(
        "Bitte geben Sie eine GTIN, SAP-Nummer oder Lieferantennummer ein.",
      );
      return;
    }

    //call odatav2 function import
    const oModel = this.getView()?.getModel() as ODataModel;
    const articleFoundStatus = this.byId("articleFoundStatus") as ObjectStatus;
    const importButton = this.byId("importButton") as Button;
    this.getView()?.setBusy(true);
    oModel.callFunction("/searchProductsInSAP", {
      method: "GET",
      urlParameters: {
        searchTerm: sInputValue,
      },
      success: (oData: any) => {
        this.getView()?.setBusy(false);
        let aProducts = oData.searchProductsInSAP.results;

        //sort by type property ascending Option than variant
        if (oData.searchProductsInSAP.exists == false) {
          aProducts = [];
        }

        const sortedProducts = aProducts.sort((a: any, b: any) => {
          a.TYPE.localeCompare(b.TYPE);
        });
        // Create a JSONModel and set the data
        const oJsonModel = new JSONModel(sortedProducts);

        // Create and open the SelectDialog
        if (!this._oSelectDialog) {
          this._oSelectDialog = new SelectDialog("productSelectDialog", {
            title: "Artikel auswählen",
            multiSelect: true,
            confirmButtonText: "Alle Varianten übernehmen",

            items: {
              path: "/",
              template: new StandardListItem({
                title: "{ID}",
                description: "{TYPE}",
                info: "{NAME}",
              }),
            },
            confirm: this.onImportFromSAP.bind(this),
          });
        }
        this._oSelectDialog.setModel(oJsonModel);
        this._oSelectDialog.open();
      },
      error: (oError: any) => {
        this.getView()?.setBusy(false);
        MessageBox.error("Fehler beim Überprüfen der Artikelexistenz.");
      },
    });
  }

  onImportFromSAP(event: any): void {
    const aSelectedItems = event.getParameter("selectedItems");
    if (!aSelectedItems || aSelectedItems.length === 0) {
      return;
    }

    const oModel = this.getView()?.getModel() as ODataModel;
    this.getView()?.setBusy(true);

    MessageBox.information(
      "Alle Varianten der ausgewählten Artikel werden importiert.",
      {
        actions: [MessageBox.Action.OK],
        onClose: () => {
          const aPromises = aSelectedItems.map((oItem: any) => {
            const oContextObject = oItem.getBindingContext().getObject();
            return new Promise<void>((resolve, reject) => {
              oModel.callFunction("/importProductFromSAP", {
                method: "GET",
                urlParameters: {
                  materialNumber: oContextObject.ID,
                  type: oContextObject.TYPE,
                  color: oContextObject.COLOR,
                },
                success: (oData: any) => {
                  resolve();
                },
                error: (oError: any) => {
                  // We reject with the error message to handle it later if needed,
                  // or just resolve to allow other imports to finish.
                  // Here we log and resolve to ensure Promise.all finishes.
                  console.error(
                    "Import failed for " + oContextObject.ID,
                    oError,
                  );
                  reject(
                    JSON.parse(oError.responseText).error.message.value ||
                    "Fehler beim Importieren des Artikels.",
                  );
                },
              });
            });
          });

          Promise.allSettled(aPromises).then((results) => {
            this.getView()?.setBusy(false);
            const aRejected = results.filter((r) => r.status === "rejected");

            if (aRejected.length === 0) {
              MessageBox.success("Alle Artikel erfolgreich importiert.");
            } else {
              MessageBox.warning(
                `${results.length - aRejected.length} von ${results.length} Artikeln importiert. Fehler bei ${aRejected.length} Artikeln.`,
              );
            }

            this._oSearchDialog.close();
            //clear input
            const oInput = this.byId("searchInput") as Input;
            oInput.setValue("");
            //refresh table
            const oVisibilityData = this.getModel("oModelVisible").getData();
            const sTableID = oVisibilityData.showArticle
              ? "articleTable"
              : oVisibilityData.showOption
                ? "LineItemsSmartTable"
                : "variantTable";
            const oTable = this.byId(sTableID) as SmartTable;
            oTable.rebindTable(true);
          });
        },
      },
    );
  }

  onCloseSearchDialog(): void {
    const oInput = this.byId("searchInput") as Input;
    oInput.setValue("");
    this._oSearchDialog?.close();
  }

  resetMassEditProductsDialog() {
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    oCacheModel.setProperty("/tmpMassEditProduct", getNewProductTemplate());
    oCacheModel.setProperty("/newPurchaseEntry", []);
  }

  onMassEditCancel(): void {
    this.resetMassEditProductsDialog();
    const oDialog = this.byId("massEditProductsDialog") as Dialog;
    oDialog.close();
  }

  onMassEditSave(): void {
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    const tmpMassEditProduct = oCacheModel.getData().tmpMassEditProduct;
    const selectedArticles: any[] =
      oCacheModel.getData().tmpMassEditSelectedProductKeys;
    const tmp = Object.fromEntries(
      Object.entries(tmpMassEditProduct).filter(
        ([key, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          key != "writingAppointments" &&
          key != "writingAppointmentsWithDates",
      ), // Filter out writing appointment arrays
    );
    delete tmp.to_Purchase;
    delete tmp.to_Sales;
    delete tmp.to_Size;

    if (tmp.hasOwnProperty("specialOffer")) {
      tmp.specialOffer = tmp.specialOffer === "true";
    }

    // Show confirmation dialog
    MessageBox.confirm("Möchten Sie die Änderungen wirklich speichern?", {
      onClose: (oAction: any) => {
        if (oAction === MessageBox.Action.OK) {
          this._processMassEditWithWritingAppointments(
            tmp,
            selectedArticles,
            tmpMassEditProduct.writingAppointmentsWithDates,
          );
        }
      },
    });
  }
  private async _showMassEditFragment(): Promise<void> {
    const oView = this.getView();

    const oCacheModel = oView?.getModel("cache") as JSONModel;
    const oMassEditFragModel = oView?.getModel(
      "massEditFragModel",
    ) as JSONModel;

    if (!oCacheModel || !oMassEditFragModel) {
      return;
    }

    const oVisibleFields = oCacheModel.getProperty("/visibleFields");
    if (!oVisibleFields) {
      return;
    }

    // ✅ show fragment container
    oMassEditFragModel.setProperty("/showFragment", true);

    // ✅ lazy load fragment only once
    if (!this._oFragment) {
      this._oFragment = await Fragment.load({
        name: "com.valantic.preorder.products.view.fragments.MassEditProductNew",
        controller: this,
      });

      const oContainer = oView?.byId("fragmentContainer") as VBox;
      oContainer.addItem(this._oFragment);
    }
  }

  private async _showMassEditFragmentonInit(): Promise<void> {
    const oView = this.getView();
    const oMassEditFragModel = oView?.getModel(
      "massEditFragModel",
    ) as JSONModel;

    // ✅ show fragment container
    oMassEditFragModel.setProperty("/showFragment", true);

    // ✅ lazy load fragment only once
    if (!this._oFragment) {
      this._oFragment = await Fragment.load({
        name: "com.valantic.preorder.products.view.fragments.MassEditProductNew",
        controller: this,
      });

      const oContainer = oView?.byId("fragmentContainer") as VBox;
      oContainer.addItem(this._oFragment);
    }
  }
  public onUiStateChangeonInit(oEvent: any, sTableID: string): void {
    let tableID = sTableID;
    if (oEvent) {
      tableID = this?.getView()?.getLocalId(oEvent.getSource().getId());
    }
    const aVisibleColumns = this._updateVisibleColumnsInCache(tableID);
    console.log("Currently Visible Columns (Keys):");
    aVisibleColumns.forEach((col) => {
      const colId = col.getId ? col.getId() : "no-id";
      console.log(colId);
    });
  }
  public onUiStateChange(oEvent: any, sTableID: string): void {
    let tableID = sTableID;
    if (oEvent) {
      tableID = this?.getView()?.getLocalId(oEvent.getSource().getId());
    }
    const aVisibleColumns = this._updateVisibleColumnsInCache(tableID);

    const oFragModel = this.getView()?.getModel(
      "massEditFragModel",
    ) as JSONModel;
    if (!oFragModel) return;

    if (aVisibleColumns.length > 0) {
      oFragModel.setProperty("/showFragment", true);
      this._showMassEditFragment();
    } else {
      this._hideMassEditFragment();
    }
  }
  private _updateVisibleColumnsInCache(tableId: any): any[] {
    const oSmartTable = this.byId(tableId) as SmartTable;
    const oTable = oSmartTable?.getTable() as Table;
    const aColumns = oTable?.getColumns() || ([] as any[]);
    const aVisibleColumns: any[] = [];

    aColumns.forEach((oColumn: any) => {
      if (oColumn.getVisible()) {
        aVisibleColumns.push(oColumn);
      }
    });

    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    if (!oCacheModel) return aVisibleColumns;

    // Get all visibleFields and reset to false first
    const oVisibleFields = oCacheModel.getProperty("/visibleFields") || {};
    Object.keys(oVisibleFields).forEach((key) => {
      oVisibleFields[key] = false; // reset all
    });

    // Now set currently visible columns to true
    aVisibleColumns.forEach((oColumn: any) => {
      const sFullId = oColumn.getId ? oColumn.getId() : "";
      if (!sFullId) return;

      const iLastDash = sFullId.lastIndexOf("-");
      const sFieldKey =
        iLastDash > -1 ? sFullId.substring(iLastDash + 1) : sFullId;

      if (Object.prototype.hasOwnProperty.call(oVisibleFields, sFieldKey)) {
        oVisibleFields[sFieldKey] = true;
      }
    });

    oCacheModel.setProperty("/visibleFields", oVisibleFields);

    return aVisibleColumns; // return currently visible columns
  }
  private _hideMassEditFragment(): void {
    this.getView()
      ?.getModel("massEditFragModel")
      ?.setProperty("/showFragment", false);
  }
  onMassEditSaveFragment(): void {
    const oVisibilityData = this.getModel("oModelVisible").getData();
    const sTableID = oVisibilityData.showArticle
      ? "articleTable"
      : oVisibilityData.showOption
        ? "LineItemsSmartTable"
        : "variantTable";
    const smartTable = this.byId(sTableID) as SmartTable;
    const innerTable = smartTable.getTable() as Table;
    const selectedIndices = innerTable.getSelectedIndices();
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;

    if (selectedIndices.length === 0) {
      MessageBox.alert(
        "Bitte wählen Sie mindestens einen Artikel aus, um die Massenbearbeitung zu starten.",
      );
      return;
    }

    // Get full objects for validation
    const selectedItems = selectedIndices
      .map((index) => innerTable.getContextByIndex(index))
      .filter(Boolean)
      .map((ctx) => ctx!.getObject() as any);

    // Check if all selected items have same supplier, topic, brand
    const allSame = selectedItems.every((item) => {
      return (
        item.supplier_ID === selectedItems[0].supplier_ID &&
        item.consumerTopic_ID === selectedItems[0].consumerTopic_ID &&
        item.brand_ID === selectedItems[0].brand_ID
      );
    });

    if (!allSame) {
      MessageBox.alert(
        "Bitte wählen Sie Artikel mit dem gleichen Lieferanten, Konsumententhema und Marke aus.",
      );
      return;
    }
    //check if each selectedItem has the status_ID of InProgress
    const allInProgress = selectedItems.every(
      (item) =>
        item.status_ID === "InProgress" ||
        item.status_ID === "CreationFailed" ||
        item.status_ID === "ToCheck" ||
        item.status_ID === "NewSupplierProduct" ||
        item.status_ID === "PartiallyCreatedInSAP",
    );
    if (selectedIndices.length < 0) {
      if (!allInProgress) {
        MessageBox.alert(
          "Bitte wählen Sie Artikel mit dem Status 'In Bearbeitung', 'Prüfen', 'Neuer Lieferantenartikel' oder 'Anlage fehlgeschlagen'  aus.",
        );
        return;
      }
    }

    const selectedKeys = selectedItems.map((item) => item.ID);
    // oCacheModel.setProperty("/tmpMassEditSelectedProductKeys", selectedKeys);
    oCacheModel.setProperty(
      "/tmpMassEditProduct/supplier_ID",
      selectedItems[0].supplier_ID,
    );
    oCacheModel.setProperty(
      "/tmpMassEditProduct/consumerTopic_ID",
      selectedItems[0].consumerTopic_ID,
    );
    oCacheModel.setProperty(
      "/tmpMassEditProduct/brand_ID",
      selectedItems[0].brand_ID,
    );
    // 👉 MISSING LOGIC (THIS IS THE KEY FIX)
    const oModelVisible = this.getView()?.getModel("oModelVisible")?.getData();
    let selectedProductIds = [] as any;
    if (oModelVisible.showArticle) {
      // ARTICLE
      selectedProductIds = selectedItems.map((item) => item.articleID);
    } else if (oModelVisible.showOption) {
      // OPTION
      selectedProductIds = selectedItems.map((item) => item.productID);
    } else {
      // VARIANT
      selectedProductIds = selectedItems.map((item) => item.productSizesID);
    }

    //const oCacheModel = this.getView().getModel("cache") as JSONModel;
    oCacheModel.setProperty(
      "/tmpMassEditSelectedProductKeys",
      selectedProductIds,
    );

    // (Optional but useful)
    // console.log("Stored selected IDs:", selectedProductIds);
    this._filterWritingAppointmentsForMassEdit(
      selectedItems[0].consumerTopic_ID,
      selectedItems[0].brand_ID,
      selectedItems[0].supplier_ID,
    );
    // Now the cache model is ready
    this.onMassEditSaveCustom(selectedItems);
  }
  onMassEditSaveCustom(selectedItems: any[]): void {
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    const tmpMassEditProduct = oCacheModel.getData().tmpMassEditProduct;
    const oModelVisible = this.getView()?.getModel("oModelVisible")?.getData();
    const aSelectedItems: any[] = selectedItems.map((oItem) => {
      if (oModelVisible.showArticle) {
        return {
          ID: oItem.articleID,
        };
      } else if (oModelVisible.showOption) {
        return {
          ID: oItem.productID,
          // evaluationColor_ID: oItem.evaluationColor_ID,
          supplierColor: oItem.supplierColor,
          supplierProductNumber: oItem.supplierProductNumber
        };
      } else if (oModelVisible.showVariant) {
        return {
          ID: oItem.productSizesID,
          // evaluationColor_ID: oItem.evaluationColor_ID,
          supplierColor: oItem.supplierColor,
          size_1_CODE: oItem.size_1_CODE,
        };
      }
    });

    const tmp = Object.fromEntries(
      Object.entries(tmpMassEditProduct).filter(
        ([key, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          key != "writingAppointments" &&
          key != "writingAppointmentsWithDates",
      ), // Filter out writing appointment arrays
    );
    delete tmp.to_Purchase;
    delete tmp.to_Sales;
    delete tmp.to_Size;
    console.log("tbefore tmp -->", JSON.stringify(tmp, null, 2));

    // ✅ Special handling for VAT
    if (tmp.vat_ID && typeof tmp.vat_ID === "string") {
      const value = tmp.vat_ID.trim();
      const index = value.indexOf(" (");
      tmp.vat_ID = index > 0 ? value.substring(0, index).trim() : value;
    }

    // ✅ Special handling for productionPlant_PRODUCTIONPLANT
    if (
      tmp.productionPlant_PRODUCTIONPLANT &&
      typeof tmp.productionPlant_PRODUCTIONPLANT === "string"
    ) {
      const value = tmp.productionPlant_PRODUCTIONPLANT.trim();
      const matches = value.match(/\(([^)]+)\)/g);

      if (matches && matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        tmp.productionPlant_PRODUCTIONPLANT = lastMatch
          .replace(/[()]/g, "")
          .trim();
      }
    }

    // const idPlusNameFields = ["addHangTag_ID"];
    //const idOnlyFields = ["productType_ID", "supplier_ID", "consumerTopic_ID", "brand_ID", "baseUnitOfMeasure_ID"];// Fields that require only the bracketed content
    const idOnlyFields = [
      "supplier_ID",
      "consumerTopic_ID",
      "brand_ID",
      "careLabel_ID",
      "baseUnitOfMeasure_ID",
      "houseGroup_ID",
      "quality_CODE",
      "seasonType_ID",
      "gridBox_ID",
      "occasion_CODE",
      "property_CODE",
      "mainForm_CODE",
      "size1_CODE",
      "size2_CODE",
      "module_CODE",
      "surfaceWashing_CODE",
      "omnichannel_CODE",
      "stockingThickness_CODE",
      "currency_ID",
      "uvpType_ID",
      "presentationType_CODE",
      "ownershipStatus_ID",
      "evaluationColor_ID",
      "productGroup_ID",
      "assortmentModule_ID",
      "topicComponent_ID",
      "targetGroup_ID",
      "bleaching_ID",
      "ironing_ID",
      "license_CODE",
      "cleaning_ID",
      "drying_ID",
      "sizeSystem_ID",
      "supplyType_SUPPLY_TYPE",
      "series_ID",
      "program_ID",
      "shippingPort_ID",
      "washing_ID",
      "mainLabel_ID",
      "subLabel_ID",
      "sizeLabel_ID",
      "sizeCode_ID",
      "hangTag_ID",
      "stringWithSeal_ID",
      "priceSticker_ID",
      "sustainabilitySealOfApproval_GSNR",
      "storageLocation_LGORT",
      "merchandiseSecurityMethod_ID",
      "priceLabelMethod_ID",
      "hangerMethod_ID",
      "addHangTag_ID",
      "transportChain_TC_ID"
    ];
    const bracketOnlyFields = [
      "differingIncoTerm_ID",
      "material1_ID",
      "material2_ID",
      "material3_ID",
      "material4_ID",
      "material5_ID",
      "loadingGroup_ID",
      "pattern_ID",
      "productType_ID",
      "shippingInstruction_ID",
      "specialProduct_ID",
    ];

    // Process ID + Name fields (do nothing, keep as is )
    // idPlusNameFields.forEach((field) => {
    //   if (tmp[field] && typeof tmp[field] === "string") {
    //     tmp[field] = tmp[field]; // keep full "ID (Name)"
    //   }
    // });

    // Process bracket-only fields
    bracketOnlyFields.forEach((field) => {
      if (tmp[field] && typeof tmp[field] === "string") {
        const matches = tmp[field].match(/\(([^)]+)\)/g);
        if (matches && matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          tmp[field] = lastMatch.replace(/[()]/g, "").trim();
        }
      }
    });
    // idOnlyFields.forEach((field) => {
    //   if (tmp[field] && typeof tmp[field] === "string") {
    //     const match = tmp[field].match(/\(([^)]+)\)/); // extract what's inside parentheses
    //     if (match) {
    //       tmp[field] = match[1]; // send only the ID
    //     } else {
    //       tmp[field] = tmp[field]; // already just ID, keep as-is
    //     }
    //   }
    // });
    // idOnlyFields.forEach((field) => {
    //   if (tmp[field] && typeof tmp[field] === "string") {
    //     const index = tmp[field].indexOf(" (");
    //     if (index > 0) {
    //       tmp[field] = tmp[field].substring(0, index).trim(); // remove spaces
    //     } else {
    //       tmp[field] = tmp[field].trim(); // also remove any extra spaces
    //     }
    //   }
    // });

    idOnlyFields.forEach((field) => {
      if (tmp[field] && typeof tmp[field] === "string") {
        const value = tmp[field].trim();

        // ✅ Case 1: CODE/ID (Text)
        if (/^[a-zA-Z0-9-]+ \(/.test(value)) {
          const index = value.indexOf(" (");
          tmp[field] = index > 0 ? value.substring(0, index).trim() : value;
        } else {
          // ✅ Case 2: Text (ID) OR multiple brackets
          const matches = value.match(/\(([^)]+)\)/g);
          if (matches && matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            tmp[field] = lastMatch.replace(/[()]/g, "").trim();
          } else {
            // ✅ Case 3: already clean
            tmp[field] = value;
          }
        }
      }
    });

    // ✅ final log
    console.log("tmp -->", JSON.stringify(tmp, null, 2));

    const aIgnoredFields = ["brand_ID", "consumerTopic_ID", "supplier_ID"];
    const bHasChanges = Object.keys(tmp).some((key) => {
      if (aIgnoredFields.includes(key)) return false;
      return true;
    });
    if (!bHasChanges && (!tmpMassEditProduct.writingAppointmentsWithDates || tmpMassEditProduct.writingAppointmentsWithDates.length === 0)) {
      MessageBox.alert(
        "Bitte füllen Sie mindestens ein Feld aus, um die Massenbearbeitung durchzuführen.",
      );
      return;
    }

    //    if (tmp.gridBox_ID && typeof tmp.gridBox_ID === "string" && tmp.gridBox_ID.includes("(")) {
    //   tmp.gridBox_ID = tmp.gridBox_ID.split(" ")[0];
    // }
    // Show confirmation dialog
    MessageBox.confirm("Möchten Sie die Änderungen wirklich speichern?", {
      onClose: (oAction: any) => {
        if (oAction === MessageBox.Action.OK) {
          this._processMassEditWithWritingAppointmentsCustom(
            tmp,
            aSelectedItems,
            tmpMassEditProduct.writingAppointmentsWithDates,
          );
        }
      },
    });
  }
  //   private async _processMassEditWithWritingAppointmentsCustom(
  //     productUpdates: any,
  //     selectedArticles: any[],
  //     writingAppointmentsWithDates: any[]
  //   ): Promise<void> {
  //     const oModel = this.getView()?.getModel() as ODataModel;
  //     const sGroupId = Math.random().toString(36).substring(2);

  //     try {
  //       this.getView()?.setBusy(true);

  //       const mParameters = {
  //         groupId: sGroupId,
  //         success: function (oData: any, oResponse: any) {
  //           console.log("Individual update successful.");
  //         },
  //         error: function (oError: any) {
  //           console.error("Individual update failed.");
  //         },
  //       };
  //     console.log("UPDATE PAYLOAD:", productUpdates);
  //       // Update products
  //       // for (const article of selectedArticles) {
  //       //   oModel.update(`/Products('${article}')`, productUpdates, mParameters);
  //       // }
  //      for (const article of selectedArticles) {
  //     await new Promise<void>((resolve, reject) => {
  //         oModel.update(`/Products('${article}')`, productUpdates, {
  //             success: () => resolve(),
  //             error: (err) => reject(err),
  //         });
  //     });
  // }
  //       // Handle writing appointments with delivery dates
  //       if (
  //         writingAppointmentsWithDates &&
  //         writingAppointmentsWithDates.length > 0
  //       ) {
  //         for (const articleId of selectedArticles) {
  //           // First, get existing writing appointments for this product
  //           const existingWritingAppointments =
  //             await this._getExistingWritingAppointments(articleId);

  //           for (const writingAppointmentData of writingAppointmentsWithDates) {
  //             const writingAppointmentId = writingAppointmentData.ID;
  //             let foundWritingAppointment;

  //             foundWritingAppointment = existingWritingAppointments.find(
  //               (assoc: any) =>
  //                 assoc.writingAppointment_ID === writingAppointmentId
  //             );

  //             if (!foundWritingAppointment?.writingAppointment_ID) {
  //               // Create the product-writing appointment association with delivery dates
  //               const writingAppointmentAssociation = {
  //                 product_ID: articleId,
  //                 writingAppointment_ID: writingAppointmentId,
  //                 deliveryDateVZ: writingAppointmentData.deliveryDateVZ
  //                   ? this._formatDateToYYYYMMDD(
  //                     writingAppointmentData.deliveryDateVZ
  //                   )
  //                   : null,
  //                 deliveryDateShop: writingAppointmentData.deliveryDateShop
  //                   ? this._formatDateToYYYYMMDD(
  //                     writingAppointmentData.deliveryDateShop
  //                   )
  //                   : null,
  //               };

  //               oModel.create(
  //                 "/ProductsToWritingAppointments",
  //                 writingAppointmentAssociation,
  //                 mParameters
  //               );
  //             } else {
  //               // Update existing writing appointment if dates have changed
  //               const updateData: any = {};

  //               if (writingAppointmentData.deliveryDateVZ) {
  //                 updateData.deliveryDateVZ = this._formatDateToYYYYMMDD(
  //                   writingAppointmentData.deliveryDateVZ
  //                 );
  //               }

  //               if (writingAppointmentData.deliveryDateShop) {
  //                 updateData.deliveryDateShop = this._formatDateToYYYYMMDD(
  //                   writingAppointmentData.deliveryDateShop
  //                 );
  //               }

  //               if (Object.keys(updateData).length > 0) {
  //                 oModel.update(
  //                   `/ProductsToWritingAppointments(product_ID='${articleId}',writingAppointment_ID='${writingAppointmentId}')`,
  //                   updateData,
  //                   mParameters
  //                 );
  //               }
  //             }
  //           }
  //         }
  //       }

  //       const oDialog = this.byId("massEditProductsDialog") as Dialog;
  //       const oTable = this.byId("LineItemsSmartTable") as SmartTable;
  //       const oCache = this.getView()?.getModel("cache") as JSONModel;
  //       const oVisibleFields = oCache.getProperty("/visibleFields");
  //       const aExcludeKeys = ["consumerTopic_ID","brand_ID", "supplier_ID"];
  //       const aFields = Object.keys(oVisibleFields)
  //                         .filter(key => oVisibleFields[key] === true && !aExcludeKeys.includes(key));
  //       oModel.submitChanges({
  //         groupId: sGroupId,
  //         success: function (oData: any, oResponse: any) {
  //           MessageToast.show("Alle Produkte erfolgreich aktualisiert");
  //           //oDialog.close();
  //           // After processing all rows / ValueHelp selections
  // oTable.getBinding("rows")?.refresh(true);
  //           oTable.rebindTable(true);
  //           //const oModel = this.getView().getModel("massEditFragModel") as sap.ui.model.json.JSONModel;
  //           aFields.forEach(element => {
  //             oCache.setProperty("/tmpMassEditProduct/" + element,"");
  //           });
  //           oCache.setProperty("/filteredWritingAppointments", []);
  // oCache.setProperty("/tmpMassEditProduct/writingAppointmentsWithDates", []);
  // sap.ui.getCore().byId("writingAppointmentsMultiCombo1").setSelectedKeys([]);
  //         },
  //         error: function (oError: any) {
  //           MessageBox.error("Ein Fehler ist aufgetreten.");
  //           console.error("Batch request failed.", oError);
  //         },
  //       });
  //     } catch (error) {
  //       console.error("Error processing mass edit:", error);
  //       MessageBox.error(
  //         "Ein Fehler ist aufgetreten beim Verarbeiten der Aufträge."
  //       );
  //     } finally {
  //       this.getView()?.setBusy(false);
  //       const oModel = this.getView()?.getModel("massEditFragModel") as sap.ui.model.json.JSONModel;

  //   oModel.setProperty("/showFragment", true);
  //     }
  //   }
  private async _processMassEditWithWritingAppointmentsCustom(
    productUpdates: any,
    selectedItems: any[],
    writingAppointmentsWithDates: any[],
  ): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const oVisibilityData = this.getView()
      ?.getModel("oModelVisible")
      ?.getData();
    const sTableID = oVisibilityData.showArticle
      ? "articleTable"
      : oVisibilityData.showOption
        ? "LineItemsSmartTable"
        : "variantTable";
    const oTable = this.byId(sTableID) as SmartTable;
    const oCache = this.getView()?.getModel("cache") as JSONModel;
    const oVisibleFields = oCache.getProperty("/visibleFields");
    const aExcludeKeys = ["consumerTopic_ID", "brand_ID", "supplier_ID"];
    const aFields = Object.keys(oVisibleFields).filter(
      (key) => oVisibleFields[key] === true && !aExcludeKeys.includes(key),
    );

    const sGroupId = "massEditGroup";
    oModel.setDeferredGroups([sGroupId]);

    let bUpdatesQueued = false;

    try {
      this.getView()?.setBusy(true);

      // Add all product updates to deferred groupId
      delete productUpdates.common_consumerTopic_ID;
      if (oVisibilityData.showArticle) {
        // ARTICLE
        selectedItems.forEach((article) => {
          oModel.update(`/Articles('${article.ID}')`, productUpdates, {
            groupId: sGroupId,
          });
          bUpdatesQueued = true;
        });
      } else if (oVisibilityData.showOption) {
        // OPTION
        for (const option of selectedItems) {
          const individualUpdate = { ...productUpdates };

          individualUpdate.supplierColor = productUpdates.supplierColor
            ? productUpdates.supplierColor
            : option.supplierColor;
          oModel.update(`/Products('${option.ID}')`, individualUpdate, {
            groupId: sGroupId,
          });
          bUpdatesQueued = true;

        };
      } else {
        // VARIANT
        selectedItems.forEach((variant) => {
          const individualUpdate = { ...productUpdates };
          // individualUpdate.evaluationColor_ID = variant.evaluationColor_ID;
          individualUpdate.supplierColor = variant.supplierColor;
          individualUpdate.size_1_CODE = productUpdates.size1_CODE ? productUpdates.size1_CODE : variant.size_1_CODE;
          if (productUpdates.size2_CODE) {
            individualUpdate.size_2_CODE = productUpdates.size2_CODE;
            delete individualUpdate.size2_CODE;
          }
          delete individualUpdate.size1_CODE;
          oModel.update(`/ProductSizes('${variant.ID}')`, individualUpdate, {
            groupId: sGroupId,
          });
          bUpdatesQueued = true;
        });
      }

      // Handle writing appointments
      if (writingAppointmentsWithDates?.length > 0) {
        for (const itemId of selectedItems) {
          const existing = await this._getExistingWritingAppointments(itemId.ID);

          for (const wa of writingAppointmentsWithDates) {
            const found = existing.find(
              (e) => e.writingAppointment_ID === wa.ID,
            );
            const data = {
              deliveryDateVZ: wa.deliveryDateVZ
                ? this._formatDateToYYYYMMDD(wa.deliveryDateVZ)
                : null,
              deliveryDateShop: wa.deliveryDateShop
                ? this._formatDateToYYYYMMDD(wa.deliveryDateShop)
                : null,
            };

            const sPropertyIDName = oVisibilityData.showArticle ? "article_ID" : oVisibilityData.showOption ? "product_ID" : "productSize_ID";
            const sEntityName = oVisibilityData.showArticle ? "ArticlesToWritingAppointments" : oVisibilityData.showOption ? "ProductsToWritingAppointments" : "ProductSizesToWritingAppointments";
            if (!found) {
              oModel.create(
                `/${sEntityName}`,
                {
                  [sPropertyIDName]: itemId.ID,
                  writingAppointment_ID: wa.ID,
                  ...data,
                },
                { groupId: sGroupId },
              );
              bUpdatesQueued = true;
            } else if (data.deliveryDateVZ || data.deliveryDateShop) {
              oModel.update(
                `/${sEntityName}(${sPropertyIDName}='${itemId.ID}',writingAppointment_ID='${wa.ID}')`,
                data,
                { groupId: sGroupId },
              );
              bUpdatesQueued = true;
            }
          }
        }
      }

      // Submit all changes at once
      if (bUpdatesQueued) {
        await new Promise<void>((resolve, reject) => {
          oModel.submitChanges({
            groupId: sGroupId,
            success: () => resolve(),
            error: (err) => reject(err),
          });
        });

        // Refresh SmartTable after all updates
        const oRowsBinding = oTable.getBinding("rows");
        if (oRowsBinding) oRowsBinding.refresh(true);
        oTable.rebindTable(true);

        // Clear temp cache
        aFields.forEach((element) =>
          oCache.setProperty("/tmpMassEditProduct/" + element, ""),
        );
        oCache.setProperty("/tmpMassEditProduct/occasion_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/property_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/mainForm_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/size1_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/size2_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/module_CODE", "");

        oCache.setProperty("/tmpMassEditProduct/productDiscount1", "");
        oCache.setProperty("/tmpMassEditProduct/productDiscount2", "");
        oCache.setProperty("/tmpMassEditProduct/productDiscount3", "");

        oCache.setProperty("/tmpMassEditProduct/surfaceWashing_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/omnichannel_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/stockingThickness_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/presentationType_CODE", "");
        oCache.setProperty("/tmpMassEditProduct/quality_CODE", "");
        oCache.setProperty("/filteredWritingAppointments", []);
        oCache.setProperty(
          "/tmpMassEditProduct/writingAppointmentsWithDates",
          [],
        );
        sap.ui
          .getCore()
          .byId("writingAppointmentsMultiCombo1")
          ?.setSelectedKeys([]);

        MessageToast.show("Alle Produkte erfolgreich aktualisiert");
      } else {
        MessageToast.show("Keine Änderungen vorgenommen");
      }
    } catch (error) {
      console.error("Error processing mass edit:", error);
      MessageBox.error(
        "Ein Fehler ist aufgetreten beim Verarbeiten der Aufträge.",
      );
    } finally {
      this.getView()?.setBusy(false);
      const oFragModel = this.getView()?.getModel(
        "massEditFragModel",
      ) as JSONModel;
      oFragModel?.setProperty("/showFragment", true);
    }
  }

  private async _processMassEditWithWritingAppointments(
    productUpdates: any,
    selectedArticles: any[],
    writingAppointmentsWithDates: any[],
  ): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const sGroupId = Math.random().toString(36).substring(2);

    try {
      this.getView()?.setBusy(true);

      const mParameters = {
        groupId: sGroupId,
        success: function (oData: any, oResponse: any) {
          console.log("Individual update successful.");
        },
        error: function (oError: any) {
          console.error("Individual update failed.");
        },
      };

      // Update products
      for (const article of selectedArticles) {
        oModel.update(`/Products('${article}')`, productUpdates, mParameters);
      }

      // Handle writing appointments with delivery dates
      if (
        writingAppointmentsWithDates &&
        writingAppointmentsWithDates.length > 0
      ) {
        for (const articleId of selectedArticles) {
          // First, get existing writing appointments for this product
          const existingWritingAppointments =
            await this._getExistingWritingAppointments(articleId);

          for (const writingAppointmentData of writingAppointmentsWithDates) {
            const writingAppointmentId = writingAppointmentData.ID;
            let foundWritingAppointment;

            foundWritingAppointment = existingWritingAppointments.find(
              (assoc: any) =>
                assoc.writingAppointment_ID === writingAppointmentId,
            );

            if (!foundWritingAppointment?.writingAppointment_ID) {
              // Create the product-writing appointment association with delivery dates
              const writingAppointmentAssociation = {
                product_ID: articleId,
                writingAppointment_ID: writingAppointmentId,
                deliveryDateVZ: writingAppointmentData.deliveryDateVZ
                  ? this._formatDateToYYYYMMDD(
                    writingAppointmentData.deliveryDateVZ,
                  )
                  : null,
                deliveryDateShop: writingAppointmentData.deliveryDateShop
                  ? this._formatDateToYYYYMMDD(
                    writingAppointmentData.deliveryDateShop,
                  )
                  : null,
              };

              oModel.create(
                "/ProductsToWritingAppointments",
                writingAppointmentAssociation,
                mParameters,
              );
            } else {
              // Update existing writing appointment if dates have changed
              const updateData: any = {};

              if (writingAppointmentData.deliveryDateVZ) {
                updateData.deliveryDateVZ = this._formatDateToYYYYMMDD(
                  writingAppointmentData.deliveryDateVZ,
                );
              }

              if (writingAppointmentData.deliveryDateShop) {
                updateData.deliveryDateShop = this._formatDateToYYYYMMDD(
                  writingAppointmentData.deliveryDateShop,
                );
              }

              if (Object.keys(updateData).length > 0) {
                oModel.update(
                  `/ProductsToWritingAppointments(product_ID='${articleId}',writingAppointment_ID='${writingAppointmentId}')`,
                  updateData,
                  mParameters,
                );
              }
            }
          }
        }
      }

      const oDialog = this.byId("massEditProductsDialog") as Dialog;
      const oVisibilityData = this.getModel("oModelVisible").getData();
      const sTableID = oVisibilityData.showArticle
        ? "articleTable"
        : oVisibilityData.showOption
          ? "LineItemsSmartTable"
          : "variantTable";
      const oTable = this.byId(sTableID) as SmartTable;

      oModel.submitChanges({
        groupId: sGroupId,
        success: function (oData: any, oResponse: any) {
          MessageToast.show("Alle Produkte erfolgreich aktualisiert");
          oDialog.close();
          oTable.rebindTable(true);
        },
        error: function (oError: any) {
          MessageBox.error("Ein Fehler ist aufgetreten.");
          console.error("Batch request failed.", oError);
        },
      });
    } catch (error) {
      console.error("Error processing mass edit:", error);
      MessageBox.error(
        "Ein Fehler ist aufgetreten beim Verarbeiten der Aufträge.",
      );
    } finally {
      this.getView()?.setBusy(false);
    }
  }

  private async _getExistingWritingAppointments(
    productId: string,
  ): Promise<any[]> {
    const oModel = this.getView()?.getModel() as ODataModel;

    try {
      const aFilters = [new Filter("product_ID", FilterOperator.EQ, productId)];

      const existingAssociations = await this._readODataV2<any[]>(
        oModel,
        "/ProductsToWritingAppointments",
        aFilters,
        false,
        [], // Remove deliveryDates from expand
      );

      return existingAssociations || [];
    } catch (error) {
      console.error("Error fetching existing writing appointments:", error);
      return [];
    }
  }

  private _setupPersonalization(): void {
    const oTable = this.byId("persoTable") as Table;
    const i18nModel = this.getView()!.getModel("i18n") as any;
    // Define the personalization metadata
    const aMetadata: MetadataItem[] =
      setupUploadTablePersonalization(i18nModel);

    this.oDataHelper = new MetadataHelper(aMetadata);

    // Register the table for personalization
    Engine.getInstance().register(oTable, {
      helper: this.oDataHelper,
      controller: {
        Columns: new SelectionController({
          targetAggregation: "columns",
          control: oTable,
        }),
        Sorter: new SortController({
          control: oTable,
        }),

        Filter: new FilterController({
          control: oTable,
        }),
      },
    });
    // Initialize personalization
    Engine.getInstance().attachStateChange(this._onStateChange.bind(this));
  }

  public onPersonalizationPress(oEvent: any): void {
    const oTable = this.byId("persoTable") as Table;
    Engine.getInstance().show(oTable, ["Columns", "Sorter", "Filter"], {
      contentHeight: { value: "35rem" },
      contentWidth: { value: "32rem" },
      source: oEvent.getSource(),
    });
  }

  private _onStateChange(
    oEvt: Event & { getParameter(key: string): any },
  ): void {
    const oTable = this.byId("persoTable") as Table;
    const oState = oEvt.getParameter("state") as PersonalizationState;

    if (!oState) {
      return;
    }

    oTable.getColumns().forEach((oColumn: any) => {
      // const sKey = this._getKey(oColumn);
      oColumn.setVisible(false);
      oColumn.setSortOrder(SortOrder.None);
    });

    if (oState.Columns) {
      oState.Columns.forEach((oProp: any, iIndex: any) => {
        const oCol = (this.byId("persoTable") as Table)
          .getColumns()
          .find((oColumn) => oColumn.data("p13nKey") === oProp.key);
        oCol?.setVisible(true);

        oTable.removeColumn(oCol!);
        oTable.insertColumn(oCol!, iIndex);
      });
    }
    const aSorter: any[] = [];

    // Apply sorting
    if (oState.Sorter) {
      oState.Sorter.forEach((oSorter) => {
        const oColumn = (this.byId("persoTable") as Table)
          .getColumns()
          .find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
        oColumn?.setSorted(true);
        oColumn?.setSortOrder(
          oSorter.descending ? SortOrder.Descending : SortOrder.Ascending,
        );
        aSorter.push(
          new Sorter(
            this.oDataHelper.getProperty(oSorter.key).path,
            oSorter.descending,
          ),
        );
      });
      (oTable.getBinding("rows") as ListBinding).sort(aSorter);
    }

    // Apply filtering
    if (oState.Filter) {
      const aFilter: any = [];
      Object.keys(oState.Filter).forEach((sFilterKey: any) => {
        const filterPath = this.oDataHelper.getProperty(sFilterKey).path;

        (oState.Filter![sFilterKey] as any).forEach(function (oConditon: any) {
          aFilter.push(
            new Filter(filterPath, oConditon.operator, oConditon.values[0]),
          );
        });
      });
      (oTable.getBinding("rows") as ListBinding).filter(aFilter);
    }
  }

  _getKey(oControl: any) {
    return oControl.data("p13nKey");
  }

  public onSort(oEvent: Event): void {
    const mParams = oEvent.getParameters() as {
      column?: Column;
      sortOrder?: any;
    };
    const sPath = mParams.column?.getSortProperty() as string;
    const bDescending = mParams.sortOrder === SortOrder.Descending;

    const oBinding = (this.byId("persoTable") as Table).getBinding(
      "rows",
    ) as ListBinding;
    const oSorter = new Sorter(sPath, bDescending);
    oBinding.sort(oSorter);

    MessageToast.show(
      "Table sorted by " +
      sPath +
      (bDescending ? " (descending)" : " (ascending)"),
    );
  }

  public onFilter(oEvent: Event): void {
    const mParams = oEvent.getParameters() as any;
    const sValue = mParams.value as string;
    const sPath = mParams.column.getFilterProperty() as string;

    const oBinding = (this.byId("persoTable") as Table).getBinding(
      "rows",
    ) as ListBinding;
    let oFilter: Filter | null = null;

    if (sValue) {
      oFilter = new Filter(sPath, FilterOperator.Contains, sValue);
    }

    oBinding.filter(oFilter ? [oFilter] : []);

    const sMessage = sValue
      ? "Table filtered by " + sPath + ": " + sValue
      : "Filter removed from " + sPath;
    MessageToast.show(sMessage);
  }

  //TODO: REFACTOR
  public onWizardCompleted(e: Event) {
    this._massEditLogic();
    this.onWizardCancel();
  }

  //TODO: REFACTOR
  private _formatDateToYYYYMMDD(
    dateInput: string | Date | null,
  ): string | null {
    if (!dateInput) {
      return null;
    }

    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      const trimmed = dateInput.trim();

      // German format DD.MM.YYYY
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
        const [day, month, year] = trimmed.split(".");
        date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      }
      // ISO or already in YYYY-MM-DD
      else if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        date = new Date(trimmed);
      }
      // Fallback parse
      else {
        const parsed = Date.parse(trimmed);
        if (isNaN(parsed)) {
          console.warn("Unsupported date format:", dateInput);
          return null;
        }
        date = new Date(parsed);
      }
    }

    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateInput);
      return null;
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private _createProductAsync(
    oModel: ODataModel,
    sPath: string,
    oData: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      oModel.create(sPath, oData, {
        success: (oResponse: any, oTest: any) => {
          MessageToast.show(
            `${oData.supplierProductNumber} erfolgreich angelegt`,
          );
          resolve(oResponse);
        },
        error: (oError: any) => {
          MessageToast.show(
            `Fehler beim Anlegen des Artikels: ${oData.supplierProductNumber}`,
          );
          reject(oError);
        },
      });
    });
  }

  //TODO: REFACTOR
  private async _massEditLogic() {
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    const tmpProduct = oCacheModel.getData().tmpProduct;
    const oUploadWizardModel = this.getView()?.getModel("wizard") as JSONModel;
    const uploadedArticles: IUploadedArticle[] =
      oUploadWizardModel.getData().UploadedArticlesModified;
    const tmp = Object.fromEntries(
      Object.entries(tmpProduct).filter(([key, value]) => value), // The check is simply the value itself
    );
    const oSchreibterminSelect = (
      this.byId("selectSchreibtermin") as Select
    ).getSelectedKey();
    const consumerTopicInput = this.byId("selectKT") as Input;
    const brandInput = this.byId("selectMarke") as Input;
    const supplierInput = this.byId("selectLieferant") as Input;
    const consumerTopicID =
      typeof consumerTopicInput?.getSelectedKey === "function"
        ? consumerTopicInput.getSelectedKey()
        : consumerTopicInput
          ?.getBindingContext()
          ?.getProperty("consumerTopic_ID") || "";
    const brandID =
      typeof brandInput?.getSelectedKey === "function"
        ? brandInput.getSelectedKey()
        : brandInput?.getBindingContext()?.getProperty("brand_ID") || "";
    const supplierID =
      typeof supplierInput?.getSelectedKey === "function"
        ? supplierInput.getSelectedKey()
        : supplierInput?.getBindingContext()?.getProperty("supplier_ID") || "";
    console.log(consumerTopicID, brandID, supplierID);
    tmp.supplier_ID = supplierID;
    tmp.brand_ID = brandID;
    tmp.consumerTopic_ID = consumerTopicID;
    // tmp.to_WritingComponents = [
    //     { "writingAppointment_ID": oSchreibterminSelect, }
    // ]
    oSchreibterminSelect;
    const sGroupId = Math.random().toString(36).substring(2);
    const mParameters = {
      groupId: "$direct",
      success: function (oData: any, oResponse: any) {
        // This is the success handler for an *individual* operation inside the batch
        console.log("Individual create successful");
      },
      error: function (oError: any) {
        // This is the error handler for an *individual* operation
        console.error("Individual create failed.");
      },
    };
    const oModel = this.getView()?.getModel() as ODataModel;
    for (const [index, article] of uploadedArticles.entries()) {
      article.additionalProperties = tmp;
      article.availableFrom =
        this._formatDateToYYYYMMDD(article.availableFrom!) ?? undefined;

      article.availableUntil =
        this._formatDateToYYYYMMDD(article.availableUntil!) ?? undefined;

      article.endOfLifeCycle =
        this._formatDateToYYYYMMDD(article.endOfLifeCycle!) ?? undefined;

      article.deliveryDateVZ =
        this._formatDateToYYYYMMDD(article.deliveryDateVZ as any) ?? undefined;
      article.additionalProperties.to_WritingAppointments = [
        {
          deliveryDates: [{ date: article.availableFrom }],
          writingAppointment_ID: oSchreibterminSelect,
        },
      ];
      article.rowIndex = index;
      article.alreadyExists;
      article.existsIn;

      const createdArticle = await this._createProductAsync(
        oModel,
        "/UploadArticles",
        article,
      );
      const createdProduct = await this._createProductAsync(
        oModel,
        "/UploadProducts",
        article,
      );
      const createdVariant = await this._createProductAsync(
        oModel,
        "/UploadVariants",
        article,
      );
      const createdWritingAppointment = await this._createProductAsync(
        oModel,
        "/UploadWritingAppointments",
        article,
      );
    }

    const oDialog = this.byId("uploadWizardDialog") as Dialog;

    oModel.refresh(true, true);
    const oArticleTable = this.byId("articleTable") as SmartTable;
    oArticleTable.rebindTable(true);
    const oOptionTable = this.byId("LineItemsSmartTable") as SmartTable;
    oOptionTable.rebindTable(true);
    const oVariantTable = this.byId("variantTable") as SmartTable;
    oVariantTable.rebindTable(true);
  }

  private _getInitialPurchaseObject(): object {
    return {
      validFrom: null,
      validTo: null,
      currency_ID: null,
      vat_ID: null,
      purchasePrice: null,
      purchaseFactor: null,
      purchasePriceUSD: null,
      purchasePriceEURNetto: null,
      productDiscount1: null,
      productDiscount2: null,
      productDiscount3: null,
    };
  }

  private _setUpMassEditVisibilityofFormSections(): any {
    return {
      // GENERAL
      ID: false,
      name: false,
      description: false,

      // BASIC
      supplier_ID: false,
      consumerTopic_ID: false,
      brand_ID: false,
      topicComponent_ID: false,
      assortmentModule_ID: false,
      productGroup_ID: false,
      targetGroup_ID: false,
      moduleDescription: false,
      baseUnitOfMeasure_ID: false,

      // IDENTIFICATION
      supplierProductNumber: false,
      supplierProductNumberVariant: false,
      productText: false,
      supplierProductName: false,
      receiptText: false,
      supplierColor: false,
      evaluationColor_ID: false,
      sizeSystem_ID: false,
      size_1_CODE: false,
      size_2_CODE: false,
      mainFormDescription: false,
      stockingThicknessDescription: false,
      surfaceWashingDescription: false,
      sizeRun_ID: false,
      GTIN: false,
      supplyType_SUPPLY_TYPE: false,
      seasonType_ID: false,
      seasonYear: false,
      presentationtTypeDescription: false,
      availableFrom: false,
      availableUntil: false,
      endOfLifeCycle: false,

      // PURCHASE
      to_Purchase: false,

      // RETAIL
      to_Sales: false,

      // CLASSIFICATION
      sapNumber: false,
      //lotNumber: false,
      pricatCatalog_ID: false,
      productType_ID: false,
      ownershipStatus_ID: false,
      gridBox_ID: false,
      omnichannelDescription: false,
      lotCreation: false,

      // OTHER
      shippingInstruction_ID: false,
      material1_ID: false,
      portion1: false,
      material2_ID: false,
      portion2: false,
      material3_ID: false,
      portion3: false,
      material4_ID: false,
      portion4: false,
      material5_ID: false,
      portion5: false,
      shippingPort_ID: false,
      transportChain_TC_ID: false,
      productionPlant_PRODUCTIONPLANT: false,
      storageLocation_LGORT: false,
      differingIncoTerm_ID: false,

      // LABELS
      mainLabel_ID: false,
      subLabel_ID: false,
      sizeLabel_ID: false,
      sizeCode_ID: false,
      hangTag_ID: false,
      stringWithSeal_ID: false,
      priceSticker_ID: false,
      careLabel_ID: false,
      addHangTag_ID: false,
      specialOffer: false,

      // NEW TO BE CHECKED
      houseGroup_ID: false,
      costOfGoodsCalculation: false,
      priceLevel_ID: false,
      onlineSalesFrom: false,
      series_ID: false,
      licenseDescription: false,
      program_ID: false,
      occasionDescription: false,
      propertyDescription: false,
      qualityDescription: false,
      pattern_ID: false,
      specialProduct_ID: false,
      surfaceWashing: false,
      mainForm: false,
      stockingThickness: false,
      basicDataText: false,
      purchaseOrderText: false,
      merchandiseSecurityMethod_ID: false,
      priceLabelMethod_ID: false,
      hangerMethod_ID: false,
      /*GPOPT-1195
      dispositionFeature: false,
      */
      loadingGroup_ID: false,
      sustainabilitySealOfApproval_GSNR: false,
      washing: false,
      bleaching: false,
      ironing: false,
      cleaning: false,
      drying: false,
      differentUnitOfMeasureAvailable: false,
      differentUnitOfMeasure1: false,
      differentUnitOfMeasureOut1: false,
      differentUnitOfMeasure2: false,
      differentUnitOfMeasureOut2: false,
      differentUnitOfMeasure3: false,
      differentUnitOfMeasureOut3: false,
      differentUnitOfMeasure4: false,
      differentUnitOfMeasureOut4: false,
      onlineOrderStep: false,
      minimumOrderQuantity: false,
      maximumOrderQuantity: false,
      comment: false,
      /* GPOPT-1324
      supplierProductGroup: false,
      */
      sustainabilityCertifier_ID: false,
      sustainabilityMaterial_ID: false,
      sustainabilityPortion: false,
      sustainabilityCertificateNumber: false,
      washingInstructions: false,
      purchaseGroup_ID: false,

      // Other compositions
      writingAppointment: false,
      to_Size: false,

      comment2: false,
      countryOfProduction: false,
      purchasePrice: false,
      purchasePriceEURNetto: false,
      purchasePriceUSD: false,
      purchaseFactor: false,
      sustainabilityMaterial: false,
      sustainabilityCertifier: false,
      currentPrice: false,
      uvpPrice: false,
      retailPrice: false,

      bleaching_ID: false,
      ironing_ID: false,
      license_CODE: false,
      vat_ID: false,
      cleaning_ID: false,
      drying_ID: false,
      uvpType_ID: false,
      currency_ID: false,
      presentationTypeDescription: false,
      washing_ID: false,
      sizeRun: false,
      productDiscount1: false,
      productDiscount2: false,
      productDiscount3: false,
    };
  }

  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    //TODO: REFACTOR
    const oUploadWizardModel = new JSONModel({
      step1Validated: false,
      FilteredWritingAppointments: [], // INITIALIZE AS EMPTY ARRAY
      UploadedArticles: [], //For step2
      UploadedArticlesModified: [], //For step4, with master data fields (supplyType, ownershipStatus, productionPlant)
      currentStep: "step1",
    });
    const oViewModel = new JSONModel({
      selectedColumns: [] as Array<{
        key: string;
        label: string;
        value: any;
      }>,
    });

    const oModelVisible = new JSONModel({
      selectedColumns: [],
      showOption: false,
      showVariant: false,
      showArticle: true, // default = existing table
      tableHeader: "Artikel",
    });

    this.getView()!.setModel(oModelVisible, "oModelVisible");

    // Load default table
    // this.byId("LineItemsSmartTable").rebindTable();

    this.getView()!.setModel(oViewModel, "viewModel");
    const massEditFragModel = new JSONModel({
      showFragment: false, // initially hidden
    });
    this.getView()!.setModel(massEditFragModel, "massEditFragModel");
    // const oFragModel = this.getView()?.getModel("massEditFragModel") as JSONModel;
    // oFragModel.setProperty("/showFragment", true);

    const oSmartTab = this.byId("articleTable") as SmartTable;

    // Wait until SmartTable is ready
    oSmartTab.attachInitialise(async () => {
      this.onUiStateChangeonInit(null, "articleTable"); // call your method
    });
    this._showMassEditFragmentonInit();
    const oNewModel = new JSONModel({
      filteredWritingAppointments: [], // INITIALIZE AS EMPTY ARRAY
    });

    //TODO: REFACTOR
    const oCacheModel = new JSONModel({
      formOptions: [
        { key: "basic", text: "Grunddaten" },
        { key: "identification", text: "Artikelidentifikation" },
        { key: "purchase", text: "Einkaufssicht" },
        { key: "sales", text: "Vertriebssicht" },
        { key: "classification", text: "Artikelklassifikation" },
        { key: "labels", text: "Etiketten" },
        { key: "logistics", text: "Lieferung & Transport" },

        // { key: "additional", text: "Noch offen" },
      ],
      sections: {
        basic: false, // Show 'Basic Data' by default
        identification: false,
        purchase: false,
        sales: false,
        classification: false,
        logistics: false,
        labels: false,
        // additional: false,
      },
      tmpProduct: getNewProductTemplate(),
      tmpMassEditProduct: getNewProductTemplate(),
      tmpMassEditSelectedProductKeys: [],
      newPurchaseEntry: [],
      newRetailEntry: [],
      visibleFields: this._setUpMassEditVisibilityofFormSections(),
    });
    this.getView()!.setModel(oCacheModel, "cache");
    this.getView()!.setModel(oUploadWizardModel, "wizard");
    this.getView()!.setModel(oNewModel, "new");
    oCacheModel.setProperty("/copyButtonEnabled", false);

    var oSmartTableOption = this.byId("LineItemsSmartTable") as SmartTable;
    var oSmartTable = this.byId("articleTable") as SmartTable;
    var oSmartTableVariant = this.byId("variantTable") as SmartTable;

    // Do adjustments on SmartTable init
    oSmartTable.attachInitialise(() => {
      var oTable = oSmartTable.getTable() as Table;
      // oTable.attachRowSelectionChange(() => {
      //   const selectedIndices = oTable.getSelectedIndices();

      //   oCacheModel.setProperty(
      //     "/copyButtonEnabled",
      //     selectedIndices.length === 1
      //   );
      // });
      // Attach to cell click instead of row selection
      oTable.attachCellClick((oEvent) => {
        var oRowContext = oEvent.getParameter("rowBindingContext");
        this.navTo(RoutingRoutes.ArticleDetails, {
          id: (oRowContext?.getObject() as any).ID,
          query: { action: RoutingActions.ArtDetailsDisplay },
        });
      });
    });

    oSmartTableOption.attachInitialise(() => {
      var oTable = oSmartTableOption.getTable() as Table;
      oTable.attachRowSelectionChange(() => {
        const selectedIndices = oTable.getSelectedIndices();
        oCacheModel.setProperty(
          "/copyButtonEnabled",
          selectedIndices.length === 1,
        );
        const selectedItems = selectedIndices
          .map((index) => oTable.getContextByIndex(index))
          .filter(Boolean)
          .map((ctx) => ctx!.getObject() as any);
        const allSameConsumerTopic = selectedItems.every(
          (item) =>
            item.consumerTopic_ID === selectedItems[0]?.consumerTopic_ID,
        );
        oCacheModel.setProperty(
          "/tmpMassEditProduct/common_consumerTopic_ID",
          allSameConsumerTopic
            ? selectedItems[0]?.consumerTopic_ID
            : "NO_COMMON_VALUE",
        );

        const allSameTopicComponent = selectedItems.every(
          (item) =>
            item.topicComponent_ID === selectedItems[0]?.topicComponent_ID,
        );
        oCacheModel.setProperty(
          "/tmpMassEditProduct/common_topicComponent_ID",
          allSameTopicComponent
            ? selectedItems[0]?.topicComponent_ID
            : "NO_COMMON_VALUE",
        );
        console.log(
          oCacheModel.getProperty(
            "/tmpMassEditProduct/common_topicComponent_ID",
          ),
          oCacheModel.getProperty(
            "/tmpMassEditProduct/common_consumerTopic_ID",
          ),
        );
      });

      // Attach to cell click instead of row selection
      oTable.attachCellClick((oEvent) => {
        const rowBindingContext = oEvent.getParameter("rowBindingContext");
        this.navTo(RoutingRoutes.ProductDetails, {
          id: (rowBindingContext?.getObject() as any).ID,
          query: { action: RoutingActions.ProdDetailsDisplay },
        });
      });
    });

    oSmartTableVariant.attachInitialise(() => {
      var oTable = oSmartTableVariant.getTable() as Table;
      // Attach to cell click instead of row selection
      oTable.attachCellClick((oEvent) => {
        const rowBindingContext = oEvent.getParameter("rowBindingContext");
        this.navTo(RoutingRoutes.VariantDetails, {
          id: (rowBindingContext?.getObject() as any).ID,
          query: { action: RoutingActions.VarDetailsDisplay },
        });
      });
    });
  }

  onViewChange(oEvent: any): void {
    const oItem = oEvent.getParameter("item");
    const key = oItem.getKey();
    const oResourceBundle = this.getModel("i18n").getResourceBundle();

    const oModel = this.getView()!.getModel("oModelVisible") as JSONModel;

    oModel.setProperty("/showOption", key === "option");
    oModel.setProperty("/showVariant", key === "variant");
    oModel.setProperty("/showArticle", key === "article");

    if (key === "option") {
      oModel.setProperty(
        "/tableHeader",
        oResourceBundle.getText("list.option.title"),
      );
    } else if (key === "variant") {
      oModel.setProperty(
        "/tableHeader",
        oResourceBundle.getText("list.variant.title"),
      );
    } else {
      oModel.setProperty(
        "/tableHeader",
        oResourceBundle.getText("list.article.title"),
      );
    }

    const tableMap: Record<string, string> = {
      option: "LineItemsSmartTable",
      variant: "variantTable",
      article: "articleTable",
    };

    const oTable = this.byId(tableMap[key]) as SmartTable;
    oTable.rebindTable(true);

    this._updateVisibleColumnsInCache(tableMap[key]);
  }

  private _getInitialRetailObject() {
    return {
      validFrom: null,
      validTo: null,
      retailPrice: null,
      currentPrice: null,
      uvpType_ID: null,
      uvpPrice: null,
    };
  }

  public onAfterRendering(): void | undefined {
    (this.getView()?.getModel() as V2ODataModel)
      .metadataLoaded()
      .then(this.metaDataLoaded.bind(this));
    // this._setupPersonalization();

    // Do adjustments on IconTabBar
    var dashIconTabBar = this.byId("idArticleIconTabBar") as IconTabBar;
    if (dashIconTabBar) dashIconTabBar?.fireSelect();
  }

  public metaDataLoaded(): void | undefined {
    // oDataV2 is initialized!

    this.initSmartChart();
  }

  //TODO: CLEANUP
  public onMassEditFormSelectionChange(oEvent: any): void {
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    const oViewData = oCacheModel.getData();
    const aAllKeys = oEvent
      .getSource()
      .getItems()
      .map((oItem: { getKey: () => any }) => oItem.getKey());
    const aSelectedKeys = oEvent.getSource().getSelectedKeys();
    aAllKeys.forEach((sKey: string | number) => {
      oViewData.sections[sKey] = false;
    });

    aSelectedKeys.forEach((sKey: string | number) => {
      if (oViewData.sections.hasOwnProperty(sKey)) {
        oViewData.sections[sKey] = true;
      }
    });
    oCacheModel.refresh();
  }

  public async onNewBtnPress(event: Event): Promise<void> {
    const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
    const oResourceBundle = this.getResourceBundle();
    try {
      const newTempArticleData: any = await this.createNewTempArticle();
      const newArticleTempPath: string =
        // newTempArticleData?.article?.articlePath;
        newTempArticleData?.articlePath;

      // Get mandantory parameters
      const newArticleParams: any =
        await this.openNewArticleParamsDialog(newArticleTempPath);
      // Delete temp article entry
      await v2ODataModel.resetChanges([newArticleTempPath], false, true);

      // Create Article
      if (
        !newArticleParams?.brand_ID ||
        !newArticleParams?.consumerTopic_ID ||
        !newArticleParams?.supplier_ID ||
        !newArticleParams?.supplierProductNumber
      ) {
        MessageBox.error(oResourceBundle?.getText("fill.mandatory.fields"));
        return;
      }
      const newArticleData: any = await this.createNewArticle({
        brand_ID: newArticleParams?.brand_ID,
        consumerTopic_ID: newArticleParams?.consumerTopic_ID,
        supplier_ID: newArticleParams?.supplier_ID,
        supplierProductNumber: newArticleParams?.supplierProductNumber,
        // to_Sales: [{validFrom: new Date(),
        //     validTo: new Date()}],
        // to_Purchase: [{validFrom: new Date(),
        //     validTo: new Date()}]
      });
      const newArticleID: UUID = newArticleData?.articleID;
      const newArticlePath: string = newArticleData?.articlePath;

      // Set article ID to viewModel
      this.getModel(ModelNames.ViewModel).setProperty(
        "/articleDetails/articleID",
        newArticleID,
      );
      this.getModel(ModelNames.ViewModel).setProperty(
        "/articleDetails/articlePath",
        newArticlePath,
      );

      // Go to details page
      this.navTo(RoutingRoutes.ArticleDetails, {
        id: newArticleID,
        query: { action: RoutingActions.ArtDetailsCreate },
      });
    } catch (error) {
      v2ODataModel.resetChanges();
      // ToDo: User cancelled creation
    }
  }

  public async onNewBtnPressVariant(event: Event): Promise<void> {
    const oModel = this.getODataModel(ModelNames.ODataV2Model);
    const oResourceBundle = this.getResourceBundle();
    try {
      const tempVariant = await this.createNewTempVariant();
      const variantPath = tempVariant.variantPath;
      const variantParams = await this.openVariantDialog(variantPath);
      // Delete temp variant entry
      await oModel.resetChanges([variantPath], false, true);

      if (
        !variantParams.supplier_ID ||
        !variantParams.consumerTopic_ID ||
        !variantParams.brand_ID ||
        !variantParams.supplierProductNumber ||
        // !variantParams.evaluationColor_ID ||
        !variantParams.supplierColor ||
        !variantParams.size_1_CODE
      ) {
        MessageBox.error(oResourceBundle?.getText("fill.mandatory.fields"));
        return;
      }

      if (variantParams.GTIN) {
        const exists = await new Promise<any>((resolve, reject) => {
          oModel.callFunction("/checkExistingGTINInTool", {
            urlParameters: { GTIN: variantParams.GTIN },
            method: "GET",
            success: (oData: any) => resolve(oData),
            error: (oError: any) => reject(oError),
          });
        });
        if (exists.checkExistingGTINInTool.existing && exists.checkExistingGTINInTool.existingIn) {
          MessageBox.error(`GTIN ${variantParams.GTIN} existiert bereits in ${exists.checkExistingGTINInTool.existingIn}`, { title: "Fehler" });
          return;
        }
      }

      const variantData = await this.createNewVariant({
        supplier_ID: variantParams.supplier_ID,
        consumerTopic_ID: variantParams.consumerTopic_ID,
        brand_ID: variantParams.brand_ID,
        supplierProductNumber: variantParams.supplierProductNumber,
        // evaluationColor_ID: variantParams.evaluationColor_ID,
        supplierColor: variantParams.supplierColor,
        size_1_CODE: variantParams.size_1_CODE,
        GTIN: variantParams.GTIN,
      });

      const newVariantID: UUID = variantData?.ID;
      const newVariantPath: string = variantData?.variantPath;

      // Set status on OData model

      // Set variant ID to viewModel
      this.getModel(ModelNames.ViewModel).setProperty(
        "/variantDetails/variantID",
        newVariantID,
      );
      this.getModel(ModelNames.ViewModel).setProperty(
        "/variantDetails/variantPath",
        newVariantPath,
      );

      this.navTo(RoutingRoutes.VariantDetails, {
        id: newVariantID,
        query: { action: RoutingActions.VarDetailsCreate },
      });
    } catch (e) {
      oModel.resetChanges();
    }
  }

  // public createNewVariant(variantPayload: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const oModel = this.getODataModel(ModelNames.ODataV2Model);

  //     oModel.create("/ProductSizes", variantPayload, {
  //       success: (oData: any) => {
  //         resolve({
  //           ID: oData.ID,
  //           variantPath: `/ProductSizes(${oData.ID})`,
  //           data: oData
  //         });
  //       },
  //       error: (err: any) => {
  //         reject(err);
  //       }
  //     });
  //   });
  // }

  public createNewTempVariant(): Promise<any> {
    return new Promise((resolve, reject) => {
      const oModel = this.getODataModel(ModelNames.ODataV2Model);
      oModel.setDeferredGroups(["newVariant"]);
      const context = oModel.createEntry("/ProductSizes", {
        groupId: "newVariant",
        properties: {
          consumerTopic_ID: "",
          brand_ID: "",
          supplier_ID: "",
          product_ID: "",
          // evaluationColor_ID: "",
          supplierColor: "",
          size_1_CODE: "",
          GTIN: "",
        },
      });
      if (context) {
        resolve({
          variantPath: context.getPath(),
          context: context,
        });
      } else {
        reject("Failed to create temp variant");
      }
    });
  }

  public onVariantAccept(): void {
    this.variantAccepted = true;
    (this.byId(SmartFormIDs.MainNewVariantParams) as any).getParent().close();
  }

  public onVariantReject(): void {
    this.variantAccepted = false;
    (this.byId(SmartFormIDs.MainNewVariantParams) as any).getParent().close();
  }

  public openVariantDialog(variantPath: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const oDialog = (await this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.NewVariantParams",
      })) as Dialog;
      const smartForm = this.byId(
        SmartFormIDs.MainNewVariantParams,
      ) as SmartForm;

      // 🔥 Bind temp entity
      smartForm?.bindElement(variantPath);
      oDialog.attachAfterClose((event: Event) => {
        const data = smartForm?.getBindingContext()?.getObject();
        if (this.variantAccepted && data) {
          resolve(data);
        } else {
          reject();
        }
        this.variantAccepted = false;
        event.getSource().destroy();
      });
      oDialog.open();
    });
  }

  public async onNewBtnPressOption(): Promise<void> {
    const oModel = this.getODataModel(ModelNames.ODataV2Model);
    const oResourceBundle = this.getResourceBundle();
    try {
      const tempProduct = await this.createNewTempProduct();
      const productPath = tempProduct?.productPath; //tempProduct?.product?.productPath;

      // 3. Open dialog
      const optionParams = await this.openNewOptionDialog(productPath);
      // 4. Reset temp
      await oModel.resetChanges([productPath], false, true);

      if (
        !optionParams.supplier_ID ||
        !optionParams.consumerTopic_ID ||
        !optionParams.brand_ID ||
        !optionParams.supplierProductNumber ||
        // !optionParams.evaluationColor_ID
        !optionParams.supplierColor
      ) {
        MessageBox.error(oResourceBundle?.getText("fill.mandatory.fields"));
        return;
      }

      let product = await this.createNewOption({
        supplier_ID: optionParams.supplier_ID,
        consumerTopic_ID: optionParams.consumerTopic_ID,
        brand_ID: optionParams.brand_ID,
        supplierProductNumber: optionParams.supplierProductNumber,
        // evaluationColor_ID: optionParams.evaluationColor_ID,
        supplierColor: optionParams.supplierColor
      });

      const newproductID: UUID = product?.productID;
      const newproductPath: string = product?.productPath;

      // Set article ID to viewModel
      this.getModel(ModelNames.ViewModel).setProperty(
        "/productDetails/productID",
        newproductID,
      );
      this.getModel(ModelNames.ViewModel).setProperty(
        "/productDetails/productPath",
        newproductPath,
      );

      this.navTo(RoutingRoutes.ProductDetails, {
        id: newproductID,
        query: { action: RoutingActions.ProdDetailsCreate },
      });
    } catch (e) {
      oModel.resetChanges();
    }
  }

  public async openNewOptionDialog(productPath: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const oDialog = (await this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.NewOptionParams",
      })) as Dialog;
      const oSmartForm = this.byId(
        SmartFormIDs.MainNewProductParams,
      ) as SmartForm;
      oSmartForm.bindElement(productPath);
      oDialog.attachAfterClose((event: any) => {
        const data = oSmartForm.getBindingContext()?.getObject();
        if (this.newProductParamsAccepted && data) {
          resolve(data);
        } else {
          reject();
        }
        this.newProductParamsAccepted = false;
        event.getSource().destroy();
      });
      oDialog.open();
    });
  }

  // public createNewOption(payload: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     console.log("createNewOption called");
  //     const oModel = this.getODataModel(ModelNames.ODataV2Model);
  //     oModel.create("/Products", payload, {
  //       success: (data: any) => {
  //         console.log("SUCCESS", data);
  //         resolve({
  //           productID: data.ID,
  //           productPath: `/Products(${data.ID})`,
  //           data: data
  //         });
  //       },
  //       error: (err: any) => {
  //         console.log("ERROR", err);
  //         reject(err);
  //       }
  //     });
  //   });
  // }
  // public findProduct(
  //   article_ID: string,
  //   evaluationColor_ID: string
  // ): Promise<any> {

  //   return new Promise((resolve, reject) => {
  //     const oModel = this.getODataModel(ModelNames.ODataV2Model);

  //     const filters = [
  //       new sap.ui.model.Filter("article_ID", "EQ", article_ID),
  //       new sap.ui.model.Filter("evaluationColor_ID", "EQ", evaluationColor_ID)
  //     ];

  //     oModel.read("/Products", {
  //       filters,
  //       success: (oData: any) => {
  //         resolve(oData.results?.[0] || null);
  //       },
  //       error: reject
  //     });
  //   });
  // }
  public onProductSelected(event: Event): void {
    const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
    const selectedProductRow: any = (event?.getSource() as CustomListItem)
      .getBindingContext()
      ?.getObject();
    const selectedProductID: UUID = selectedProductRow.ID;

    // Set product ID and Path to viewModel
    this.getModel(ModelNames.ViewModel).setProperty(
      "/productDetails/productID",
      selectedProductID,
    );
    this.getModel(ModelNames.ViewModel).setProperty(
      "/productDetails/productPath",
      v2ODataModel.createKey("/Products", { ID: selectedProductID }),
    );

    this.navTo(RoutingRoutes.ProductDetails, {
      id: selectedProductID,
      query: { action: RoutingActions.ProdDetailsDisplay },
    });
  }

  public onUploadBtnPress(event: Event): void {
    const oModel = this.getView()!.getModel() as any;
    if (this._wizardDialogContext) {
      oModel.deleteCreatedEntry(this._wizardDialogContext);
    }
    this._wizardDialogContext = oModel.createEntry("/Products", {
      properties: {},
    });

    if (!this._oWizardDialog) {
      // Use modern, promise-based fragment loading
      this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.UploadWizard", // Path to your fragment
      }).then((oDialog: any) => {
        // Type the resolved object
        this._oWizardDialog = oDialog;
        this.getView()!.addDependent(this._oWizardDialog);

        // Set binding for SmartForms
        this._oWizardDialog.setBindingContext(this._wizardDialogContext);

        this._oWizardDialog.open();
        this._setupPersonalization();
      });
    } else {
      // Set binding for SmartForms
      this._oWizardDialog.setBindingContext(this._wizardDialogContext);

      this._oWizardDialog.open();
    }
  }

  onLineItemSelect(oEvent: any) {
    const oVisibilityData = this.getModel("oModelVisible").getData();
    const sTableID = oVisibilityData.showArticle
      ? "articleTable"
      : oVisibilityData.showOption
        ? "LineItemsSmartTable"
        : "variantTable";
    const smartTable = this.byId(sTableID) as SmartTable;
    const innerTable = smartTable.getTable() as Table;
    const selectedIndices = innerTable.getSelectedIndices();
    const oCacheModel = this.getView()?.getModel("cache");

    oCacheModel?.setProperty("/filteredWritingAppointments", []);
    oCacheModel?.setProperty(
      "/tmpMassEditProduct/writingAppointmentsWithDates",
      [],
    );
    const oMultiComboBox = this.byId("writingAppointmentsMultiCombo1");
    sap.ui.getCore().byId("writingAppointmentsMultiCombo1").setSelectedKeys([]); // <-- replace with your MultiComboBox ID
    if (oMultiComboBox) {
      oMultiComboBox.setSelectedKeys([]);
      oMultiComboBox.getBinding("items")?.refresh(true);
    }
    if (selectedIndices.length === 0) {
      // MessageBox.alert(
      //   "Bitte wÃ¤hlen Sie mindestens einen Artikel aus, um die Massenbearbeitung zu starten."
      // );
      return;
    }

    const selectedItems = selectedIndices.map(
      (index) => innerTable.getContextByIndex(index)?.getObject() as any,
    );

    //check if each selectedItem has the same supplier_ID consumerTopic_ID and brand_ID
    const allSame = selectedItems.every((item) => {
      return (
        item.supplier_ID === selectedItems[0].supplier_ID &&
        item.consumerTopic_ID === selectedItems[0].consumerTopic_ID &&
        item.brand_ID === selectedItems[0].brand_ID
      );
    });

    // if (!allSame) {
    //   MessageBox.alert(
    //     "Bitte wÃ¤hlen Sie Artikel mit dem gleichen Lieferanten, Konsumententhema und Marke aus."
    //   );
    //   return;
    // }

    //check if each selectedItem has the status_ID of InProgress
    // const allInProgress = selectedItems.every(
    //   (item) =>
    //     item.status_ID === "InProgress" ||
    //     item.status_ID === "CreationFailed" ||
    //     item.status_ID === "ToCheck" ||
    //     item.status_ID === "NewSupplierProduct"
    // );

    // if (!allInProgress) {
    //   MessageBox.alert(
    //     "Bitte wÃ¤hlen Sie Artikel mit dem Status 'In Bearbeitung', 'PrÃ¼fen', 'Neuer Lieferantenartikel' oder 'Anlage fehlgeschlagen'  aus."
    //   );
    //   return;
    // }

    // const selectedKeys = selectedItems.map((item) => item.ID);
    // oCacheModel.setProperty("/tmpMassEditSelectedProductKeys", selectedKeys);
    // oCacheModel.setProperty(
    //   "/tmpMassEditProduct/supplier_ID",
    //   selectedItems[0].supplier_ID
    // );
    // oCacheModel.setProperty(
    //   "/tmpMassEditProduct/consumerTopic_ID",
    //   selectedItems[0].consumerTopic_ID
    // );
    // oCacheModel.setProperty(
    //   "/tmpMassEditProduct/brand_ID",
    //   selectedItems[0].brand_ID
    // );

    if (allSame) {
      this._filterWritingAppointmentsForMassEdit(
        selectedItems[0].consumerTopic_ID,
        selectedItems[0].brand_ID,
        selectedItems[0].supplier_ID,
      );
    }

    // ð Call your loading function
    // this._loadAdditionalData(oSelectedData);
  }
  onSmartTableInit(): void {
    this.setTableInitialization("articleTable");
    this.setTableInitialization("LineItemsSmartTable");
    this.setTableInitialization("variantTable");

    this.onUiStateChange(null, "LineItemsSmartTable");

    /* -----------------------------
      2. Default sorting (ADD THIS)
   ------------------------------*/
    // oTable.attachEventOnce("rowsUpdated", () => {

    //     const oBinding = oTable.getBinding("rows");

    //     if (oBinding) {
    //         oBinding.sort([
    //             new sap.ui.model.Sorter("createdAt", true) // DESC
    //         ]);
    //     }
    // });
  }

  public setTableInitialization(tableID: string): void {
    const oSmartTable = this.byId(tableID) as SmartTable;
    const oTable = oSmartTable.getTable();

    oTable.attachRowSelectionChange(this.onLineItemSelect, this);

    const aColumns = oTable.getColumns();
    aColumns.forEach((oColumn: any) => {
      const oLabel = oColumn.getLabel?.();
      if (oLabel && oLabel.getText() === "product.status") {
        oColumn.setWidth("12rem");
      }
    });
  }

  // public onBatchBtnPress(event: Event): void {
  //   const oSmartTable = this.byId("LineItemsSmartTable") as SmartTable;
  //   const oTable = oSmartTable?.getTable() as Table;
  //   const aColumns = oTable?.getColumns() || ([] as any[]);
  //   const aVisibleColumns: any = [];

  //   aColumns.forEach(function (oColumn: any) {
  //     if (oColumn.getVisible()) {
  //       aVisibleColumns.push(oColumn);
  //     }
  //   });
  //   const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
  //   oCacheModel.setProperty(
  //     "/visibleFields",
  //     this._setUpMassEditVisibilityofFormSections()
  //   );
  //   // Now 'aVisibleColumns' contains all the visible column controls
  //   // You can then get further details from each column, e.g., the label
  //   const aVisibleColumnLabels = aVisibleColumns.map(function (oColumn: any) {
  //     // For sap.m.Column, the header is an aggregation
  //     // if (oColumn.getHeader) {
  //     //   const oHeader = oColumn.getHeader();
  //     //   if (oHeader && oHeader.getText) {
  //     //     return oHeader.getText();
  //     //   }
  //     // }
  //     // // For sap.ui.table.Column, the label is an aggregation
  //     // if (oColumn.getLabel) {
  //     //   const oLabel = oColumn.getLabel();
  //     //   if (oLabel && oLabel.getText) {
  //     //     const sLabel = oLabel.getText();
  //     //     const sMergedLabel = sLabel.replace(/\s+/g, "");
  //     //     return sMergedLabel;
  //     //   }
  //     // }

  //     // const sId = oColumn.getId ? oColumn.getId() : "";
  //     // if (sId) {
  //     //   const iLastDash = sId.lastIndexOf("-");
  //     //   return iLastDash > -1 ? sId.substring(iLastDash + 1) : sId;
  //     // }

  //     // Match visible columns against cacheModel.visibleFields and set them to true

  //     if (oCacheModel) {
  //       const oVisibleFields = oCacheModel.getProperty("/visibleFields") || {};
  //       const sFullId = oColumn.getId ? oColumn.getId() : "";

  //       if (sFullId) {
  //         const iLastDash2 = sFullId.lastIndexOf("-");
  //         const sFieldKey =
  //           iLastDash2 > -1 ? sFullId.substring(iLastDash2 + 1) : sFullId;
  //         console.log(sFieldKey);
  //         if (Object.prototype.hasOwnProperty.call(oVisibleFields, sFieldKey)) {
  //           if (!oVisibleFields[sFieldKey]) {
  //             oVisibleFields[sFieldKey] = true;
  //             oCacheModel.setProperty("/visibleFields", oVisibleFields);
  //           }
  //         }
  //         return sFieldKey;
  //       }
  //     }

  //     return null;
  //   });

  //   const smartTable = this.byId("LineItemsSmartTable") as SmartTable;
  //   const innerTable = smartTable.getTable() as Table;
  //   const selectedIndices = innerTable.getSelectedIndices();

  //   if (selectedIndices.length === 0) {
  //     MessageBox.alert(
  //       "Bitte wählen Sie mindestens einen Artikel aus, um die Massenbearbeitung zu starten."
  //     );
  //     return;
  //   }

  //   const selectedItems = selectedIndices.map(
  //     (index) => innerTable.getContextByIndex(index)?.getObject() as any
  //   );

  //   //check if each selectedItem has the same supplier_ID consumerTopic_ID and brand_ID
  //   const allSame = selectedItems.every((item) => {
  //     return (
  //       item.supplier_ID === selectedItems[0].supplier_ID &&
  //       item.consumerTopic_ID === selectedItems[0].consumerTopic_ID &&
  //       item.brand_ID === selectedItems[0].brand_ID
  //     );
  //   });

  //   if (!allSame) {
  //     MessageBox.alert(
  //       "Bitte wählen Sie Artikel mit dem gleichen Lieferanten, Konsumententhema und Marke aus."
  //     );
  //     return;
  //   }

  //   //check if each selectedItem has the status_ID of InProgress
  //   const allInProgress = selectedItems.every(
  //     (item) =>
  //       item.status_ID === "InProgress" ||
  //       item.status_ID === "CreationFailed" ||
  //       item.status_ID === "ToCheck" ||
  //       item.status_ID === "NewSupplierProduct"
  //   );

  //   if (!allInProgress) {
  //     MessageBox.alert(
  //       "Bitte wählen Sie Artikel mit dem Status 'In Bearbeitung', 'Prüfen', 'Neuer Lieferantenartikel' oder 'Anlage fehlgeschlagen'  aus."
  //     );
  //     return;
  //   }

  //   const selectedKeys = selectedItems.map((item) => item.ID);
  //   oCacheModel.setProperty("/tmpMassEditSelectedProductKeys", selectedKeys);
  //   oCacheModel.setProperty(
  //     "/tmpMassEditProduct/supplier_ID",
  //     selectedItems[0].supplier_ID
  //   );
  //   oCacheModel.setProperty(
  //     "/tmpMassEditProduct/consumerTopic_ID",
  //     selectedItems[0].consumerTopic_ID
  //   );
  //   oCacheModel.setProperty(
  //     "/tmpMassEditProduct/brand_ID",
  //     selectedItems[0].brand_ID
  //   );

  //   this._filterWritingAppointmentsForMassEdit(
  //     selectedItems[0].consumerTopic_ID,
  //     selectedItems[0].brand_ID,
  //     selectedItems[0].supplier_ID
  //   );

  //   if (!this._pMassEditDialog) {
  //     // Use modern, promise-based fragment loading
  //     this.loadFragment({
  //       name: "com.valantic.preorder.products.view.fragments.MassEditProduct", // Path to your fragment
  //     }).then((oDialog: any) => {
  //       // Type the resolved object
  //       this._pMassEditDialog = oDialog;
  //       this.getView()!.addDependent(this._pMassEditDialog);
  //       this._pMassEditDialog.open();
  //       // this._setupPersonalization();
  //     });
  //   } else {
  //     this._pMassEditDialog.open();
  //   }
  // }

  private async _filterWritingAppointmentsForMassEdit(
    consumerTopicId: string,
    brandId: string,
    supplierId: string,
  ): Promise<void> {
    const oDataModel = this.getView()?.getModel() as ODataModel;
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;

    try {
      const aFilters = [
        new Filter("consumerTopic_ID", FilterOperator.EQ, consumerTopicId),
        new Filter("brand_ID", FilterOperator.EQ, brandId),
        new Filter("supplier_ID", FilterOperator.EQ, supplierId),
      ];

      const aWritingAppointments = await this._readODataV2<
        IWritingAppointment[]
      >(oDataModel, "/WritingAppointments", aFilters);

      // Store filtered writing appointments in cache model for the mass edit dialog
      oCacheModel.setProperty(
        "/filteredWritingAppointments",
        aWritingAppointments,
      );
    } catch (error) {
      console.error("Error filtering writing appointments:", error);
      oCacheModel.setProperty("/filteredWritingAppointments", []);
    }
  }

  //TODO: REFACTOR
  onUploadArticleTableChange(): void {
    const oArticleTable = this.byId("persoTable") as Table;
    const selectedItems = oArticleTable.getSelectedIndices();
    const deleteButton = this.byId("delete") as Button;
    if (selectedItems.length > 0) {
      deleteButton.setEnabled(true);
    } else {
      deleteButton.setEnabled(false);
    }
  }

  //TODO: REFACTOR
  onDeleteArticles(): void {
    const oUploadWizardModel = this.getView()?.getModel("wizard") as JSONModel;
    const articleTable = this.byId("persoTable") as Table;
    const selectedItems = articleTable.getSelectedIndices();
    const data = oUploadWizardModel.getData();
    const uploadedArticles = data.UploadedArticles;
    var aSelectedData = [];
    var aIndicesToRemove: any[] = [];

    selectedItems.forEach(function (oItem) {
      const article = oUploadWizardModel.getObject(
        `/UploadedArticles/${oItem}`,
      );
      aIndicesToRemove.push(oItem);
      aSelectedData.push(article);
    });

    aIndicesToRemove.sort(function (a, b) {
      return b - a;
    });

    aIndicesToRemove.forEach(function (iIndex) {
      uploadedArticles.splice(iIndex, 1);
    });

    oUploadWizardModel.setProperty("/UploadedArticles", uploadedArticles);

    oUploadWizardModel.refresh(true);
    MessageToast.show("Erfolgreich gelöscht");
  }

  //TODO: REFACTOR
  async onFilterChange(e: any) {
    const oUploadWizardModel = this.getView()!.getModel("wizard") as JSONModel;
    const oDataModel = this.getView()!.getModel() as ODataModel;

    const oSchreibterminSelect = this.byId("selectSchreibtermin") as Select;
    const consumerTopicInput = this.byId("selectKT") as Input;
    const brandInput = this.byId("selectMarke") as Input;
    const supplierInput = this.byId("selectLieferant") as Input;
    const wizardStep1 = this.byId("step1") as WizardStep;
    // Get values from Input controls
    const consumerTopicID =
      typeof consumerTopicInput?.getSelectedKey === "function"
        ? consumerTopicInput.getSelectedKey()
        : consumerTopicInput
          ?.getBindingContext()
          ?.getProperty("consumerTopic_ID") || "";
    const brandID =
      typeof brandInput?.getSelectedKey === "function"
        ? brandInput.getSelectedKey()
        : brandInput?.getBindingContext()?.getProperty("brand_ID") || "";
    const supplierID =
      typeof supplierInput?.getSelectedKey === "function"
        ? supplierInput.getSelectedKey()
        : supplierInput?.getBindingContext()?.getProperty("supplier_ID") || "";
    // Always reset the Schreibtermin list and selection first
    oUploadWizardModel.setProperty("/FilteredWritingAppointments", []);
    oUploadWizardModel.setProperty("/supplierID", supplierID);
    oUploadWizardModel.setProperty("/brandID", brandID);
    oUploadWizardModel.setProperty("/consumerTopicID", consumerTopicID);

    // Only proceed if all three fields have values
    if (consumerTopicID && brandID && supplierID) {
      this._masterDataCache = {};

      // Build the filters based on the input values
      const aFilters = [
        new Filter("consumerTopic_ID", FilterOperator.EQ, consumerTopicID),
        new Filter("brand_ID", FilterOperator.EQ, brandID),
        new Filter("supplier_ID", FilterOperator.EQ, supplierID),
      ];

      // try {
      //   const ctBrandRule = await this._readODataV2<any>(
      //     oDataModel,
      //     `/ConsumerTopicBrands(consumerTopic_ID='${consumerTopicID}',brand_ID='${brandID}',supplier_ID='${supplierID}')`,
      //     [],
      //     true
      //   );
      //   if (ctBrandRule.orderOption_ID !== "None") {
      //     oSchreibterminSelect.setRequired(true);
      //   } else {
      //     oSchreibterminSelect.setRequired(false);
      //   }
      // } catch (error) {
      //   console.error(error);
      //   oSchreibterminSelect.setRequired(false);
      // }

      try {
        // Request the writing appointments data
        const aSchreibtermine = await this._readODataV2<IWritingAppointment[]>(
          oDataModel,
          "/WritingAppointments",
          aFilters,
        );
        oUploadWizardModel.setProperty(
          "/FilteredWritingAppointments",
          aSchreibtermine,
        );
        oUploadWizardModel.setProperty(
          "/writingAppointmentID",
          oSchreibterminSelect.getSelectedItem()?.getText(),
        );
      } catch (error) {
        console.error(error);
      }

      try {
        //Match supplier master data
        const supplierMasterData = await this._readODataV2<any>(
          oDataModel,
          `/ConsumerTopicBrands(consumerTopic_ID='${consumerTopicID}',brand_ID='${brandID}',supplier_ID='${supplierID}')`,
          [],
          true
        );

        if (supplierMasterData) {
          this._masterDataCache = supplierMasterData;
        }
      } catch (error) {
        console.warn("No master data available for this combination:", error.statusText);
      }
    }

    // Validate step based on required fields
    if (oSchreibterminSelect.getRequired()) {
      if (
        consumerTopicID &&
        brandID &&
        supplierID &&
        oSchreibterminSelect.getSelectedKey()
      ) {
        wizardStep1.setValidated(true);
        this.getModel("wizard").setProperty("/step1Validated", true);
      } else {
        wizardStep1.setValidated(false);
        this.getModel("wizard").setProperty("/step1Validated", false);
      }
    } else {
      if (consumerTopicID && brandID && supplierID) {
        wizardStep1.setValidated(true);
        this.getModel("wizard").setProperty("/step1Validated", true);
      } else {
        wizardStep1.setValidated(false);
        this.getModel("wizard").setProperty("/step1Validated", false);
      }
    }
  }

  //TODO: REFACTOR
  public onFileChange(oEvent: any): void {
    const oFile = oEvent.getParameter("files")?.[0];
    const oUploadWizardModel = this.getView()!.getModel("wizard") as JSONModel;
    if (oFile) {
      const reader = new FileReader();

      // exceljs works best with an ArrayBuffer
      reader.readAsArrayBuffer(oFile);

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        this.getView()?.setBusy(true);
        const buffer = e.target!.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0]; // Get the first worksheet
        const aArticles: IUploadedArticle[] = [];

        // --- Image Extraction Logic ---
        // 1. Get all images from the worksheet. The library provides their locations.
        const images = worksheet.getImages();

        // 2. Iterate over the worksheet rows to get the data
        worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
          // Skip the header row if it exists
          if (rowNumber <= 8) {
            //At the previous version it was 5
            return;
          }
          // Find the image that is anchored in the first column of the current row
          const image = images.find((img) => {
            // Check if the image's top-left anchor is in this row and first column
            const range = img.range;
            return (
              range.tl.nativeRow === rowNumber - 1 && range.tl.nativeCol === 0
            );
          });

          let base64Image = "";
          let mimeType;
          if (image) {
            // 3. Get the actual image data buffer from the workbook using the imageId
            const imgData = workbook.getImage(parseInt(image.imageId));
            // 4. Convert the buffer to a Base64 string to display in the UI
            mimeType = `image/${imgData.extension}`;
            base64Image = `data:${mimeType};base64,${(imgData.buffer as any)?.toString("base64")}`;
          }

          aArticles.push({
            image: base64Image,
            // imageUrl: url.hyperlink,
            mimeType: mimeType,
            supplierProductNumber: row.getCell(2).value?.toString(),
            supplierProductName: row.getCell(3).value?.toString(),
            supplierColor: row.getCell(4).value?.toString(),
            evaluationColor: row.getCell(5).value?.toString(),
            sizeSystem: row.getCell(6).value?.toString(),
            productGroup: row.getCell(7).value?.toString(),
            receiptText: row.getCell(8).value?.toString(),
            ownershipStatus: row.getCell(9).value?.toString(),
            currency: row.getCell(10).value?.toString(),
            purchasePrice: !row.getCell(11).value?.toString().trim()
              ? null
              : Number(parseFloat(row.getCell(11).value?.toString() || "").toFixed(2)),
            purchasePriceNet: !row.getCell(12).value?.toString().trim()
              ? null
              : Number(parseFloat(row.getCell(12).value?.toString() || "").toFixed(2)),
            productDiscount1: !row.getCell(13).value?.toString().trim()
              ? null
              : parseFloat(row.getCell(13).value?.toString() || ""),
            retailPrice: !row.getCell(14).value?.toString().trim()
              ? null
              : Number(parseFloat(row.getCell(14).value?.toString() || "").toFixed(2)),
            transportChain: row.getCell(15).value?.toString(),
            // shippingPort: row.getCell(16).value?.toString(),
            productionPlant: row.getCell(16).value?.toString(),
            deliveryDateVZ: row.getCell(17).value?.toString(),
            availableFrom: row.getCell(18).value?.toString(),
            availableUntil: row.getCell(19).value?.toString(),
            endOfLifeCycle: row.getCell(20).value?.toString(),
            houseGroup: row.getCell(21).value?.toString(),
            supplyType: row.getCell(22).value?.toString(),
            seasonType: row.getCell(23).value?.toString(),
            seasonYear: row.getCell(24).value?.toString(),
            presentationType: row.getCell(25).value?.toString(),
            GTIN: row.getCell(26).value?.toString(),
            isOnline: row.getCell(27).value?.toString() == "ja" ? true : false,
            material1: row.getCell(28).value?.toString(),
            portion1: row.getCell(29).value?.toString(),
            material2: row.getCell(30).value?.toString(),
            portion2: row.getCell(31).value?.toString(),
            material3: row.getCell(32).value?.toString(),
            portion3: row.getCell(33).value?.toString(),
            material4: row.getCell(34).value?.toString(),
            portion4: row.getCell(35).value?.toString(),
            material5: row.getCell(36).value?.toString(),
            portion5: row.getCell(37).value?.toString(),
            sustainabilitySealOfApproval: row.getCell(38).value?.toString(),
            sustainabilityCertifier: row.getCell(39).value?.toString(),
            sustainabilityCertificateNumber: row.getCell(40).value?.toString(),
            sustainabilityMaterial: row.getCell(41).value?.toString(),
            sustainabilityPortion: row.getCell(42).value?.toString(),
            washing: row.getCell(43).value?.toString(),
            bleaching: row.getCell(44).value?.toString(),
            drying: row.getCell(45).value?.toString(),
            ironing: row.getCell(46).value?.toString(),
            cleaning: row.getCell(47).value?.toString(),
            washingInstructions: row.getCell(48).value?.toString(),
            comment: row.getCell(49).value?.toString(),
            comment2: row.getCell(50).value?.toString(),
            additionalProperties: {},
          } as any);
        });
        const oDataModel = this.getView()!.getModel() as ODataModel;

        for await (const article of aArticles) {
          const alreadyExists = await this._callODataV2Function<any>(
            oDataModel,
            `/checkForExistingProduct`,
            {
              supplierProductNumber: article.supplierProductNumber,
              GTIN: article.GTIN,
            },
          );

          article.alreadyExists =
            alreadyExists.checkForExistingProduct.existing;
          article.existsIn = alreadyExists.checkForExistingProduct.existingIn;
        }
        oUploadWizardModel.setProperty("/UploadedArticles", aArticles);
        this.getView()?.setBusy(false);
      };
    }
  }

  public onWizardCancel(): void {
    const oWizard = this.byId("uploadWizard") as Wizard;
    const oDialog = this.byId("uploadWizardDialog") as Dialog;
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
    oWizard.discardProgress(oWizard.getSteps()[0], false);
    oDialog.close();

    const oFileUploader = this.byId("fileUploader") as FileUploader;
    oFileUploader.clear();

    // Optional: Model zurücksetzen für den nächsten Durchlauf
    const oUploadWizardModel = this.getView()!.getModel("wizard") as JSONModel;
    oUploadWizardModel.setData({
      FilteredWritingAppointments: [],
      UploadedArticles: [],
      UploadedArticlesModified: [],
      currentStep: "step1",
    });

    const oSchreibterminSelect = this.byId("selectSchreibtermin") as Select;
    const consumerTopicInput = this.byId("selectKT") as Input;
    const brandInput = this.byId("selectMarke") as Input;
    const supplierInput = this.byId("selectLieferant") as Input;

    oSchreibterminSelect.setSelectedKey("");
    consumerTopicInput.setValue("");
    brandInput.setValue("");
    supplierInput.setValue("");
    oSchreibterminSelect.setRequired(false);

    const wizardStep1 = this.byId("step1") as WizardStep;
    wizardStep1.setValidated(false);
    this.getModel("wizard").setProperty("/step1Validated", false);
    oCacheModel.setProperty("/tmpProduct", getNewProductTemplate());

    // Reset section selector and visibility
    const oSectionSelector = this.byId("sectionSelector") as any;
    if (oSectionSelector) {
      oSectionSelector.setSelectedKeys([]);
    }
    const oSections = oCacheModel.getProperty("/sections");
    if (oSections) {
      Object.keys(oSections).forEach((key) => {
        oSections[key] = false;
      });
      oCacheModel.setProperty("/sections", oSections);
    }
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

  public openNewArticleParamsDialog(newArticlePath: string): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      // Build dialog using fragment
      const newArticleDialog = (await this.loadFragment({
        name: "com.valantic.preorder.products.view.fragments.NewProductParams",
      })) as Dialog;

      // Get Smartform and bind contect
      const smartFormProductParams = this?.byId(
        SmartFormIDs.MainNewArticleParams,
      ) as SmartForm;
      smartFormProductParams.bindElement(newArticlePath);
      //console.log("SmartForm Context Object:", smartFormProductParams?.getObject());

      newArticleDialog.attachAfterClose((event: Event) => {
        const smartFormData = smartFormProductParams
          ?.getBindingContext()
          ?.getObject();
        if (this.newArticleParamsAccepted && smartFormData) {
          resolve(smartFormData);
        } else {
          reject();
        }
        // Reset global object to prevent errors
        this.newArticleParamsAccepted = false;
        event.getSource().destroy();
      });
      newArticleDialog.open();
    });
  }

  public newArticleParamsAccept(event: Event): void {
    const newArticleParamsDialog = (event.getSource() as Button)
      ?.getParent()
      ?.getParent() as Dialog;
    this.newArticleParamsAccepted = true;

    // const oNewModel = this.getView()!.getModel("new") as JSONModel;
    // oNewModel.setProperty("/filteredWritingAppointments", []);
    // oNewModel.refresh();

    newArticleParamsDialog.close();
  }

  public newArticleParamsReject(event: Event): void {
    const newArticleParamsDialog = (event.getSource() as Button)
      ?.getParent()
      ?.getParent() as Dialog;
    this.newArticleParamsAccepted = false;

    // const oNewModel = this.getView()!.getModel("new") as JSONModel;
    // oNewModel.setProperty("/filteredWritingAppointments", []);
    // oNewModel.refresh();

    newArticleParamsDialog.close();
  }

  public newProdParamsAccept(event: Event): void {
    const newProductParamsDialog = (event.getSource() as Button)
      ?.getParent()
      ?.getParent() as Dialog;
    this.newProductParamsAccepted = true;

    const oNewModel = this.getView()!.getModel("new") as JSONModel;
    oNewModel.setProperty("/filteredWritingAppointments", []);
    oNewModel.refresh();

    newProductParamsDialog.close();
  }

  public newProdParamsReject(event: Event): void {
    const newProductParamsDialog = (event.getSource() as Button)
      ?.getParent()
      ?.getParent() as Dialog;
    this.newProductParamsAccepted = false;

    const oNewModel = this.getView()!.getModel("new") as JSONModel;
    oNewModel.setProperty("/filteredWritingAppointments", []);
    oNewModel.refresh();

    newProductParamsDialog.close();
  }

  public async newFilterChanged(event: Event) {
    const oParameters = event.getParameters() as any;

    const oNewModel = this.getView()!.getModel("new") as JSONModel;
    const oViewModel = this.getView()!.getModel("viewModel") as JSONModel;
    const oDataModel = this.getView()!.getModel() as ODataModel;

    if (oParameters.id?.endsWith("newKT")) {
      oNewModel.setProperty("/consumerTopicID", oParameters.value);
    } else if (oParameters.id?.endsWith("newMarke")) {
      oNewModel.setProperty("/brandID", oParameters.value);
    } else if (oParameters.id?.endsWith("newLieferant")) {
      oNewModel.setProperty("/supplierID", oParameters.value);
    }
    const oOrderNameComboBox = this.byId("newAuftragsname") as ComboBox;

    oNewModel.setProperty("/filteredWritingAppointments", []);

    const consumerTopicID = oNewModel.getProperty("/consumerTopicID");
    const brandID = oNewModel.getProperty("/brandID");
    const supplierID = oNewModel.getProperty("/supplierID");

    // Only proceed if all three fields have values
    if (consumerTopicID && brandID && supplierID) {
      // Build the filters based on the input values
      const aFilters = [
        new Filter("consumerTopic_ID", FilterOperator.EQ, consumerTopicID),
        new Filter("brand_ID", FilterOperator.EQ, brandID),
        new Filter("supplier_ID", FilterOperator.EQ, supplierID),
      ];

      try {
        const aOrderName = await this._readODataV2<IWritingAppointment>(
          oDataModel,
          "/WritingAppointments",
          aFilters,
        );
        oNewModel.setProperty("/filteredWritingAppointments", aOrderName);
        oViewModel.setProperty(
          "/writingAppointment_ID",
          oOrderNameComboBox.getSelectedItem()?.getText(),
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  public formatWritingAppointmentNames(writingAppointments: any[]): string {
    if (!writingAppointments || writingAppointments.length === 0) {
      return "Keine Schreibtermine ausgewählt";
    }

    return writingAppointments.map((wa) => wa.name).join(", ");
  }

  onWritingAppointmentsSelectionChange(oEvent: Event): void {
    const oMultiComboBox = oEvent.getSource() as any;
    const aSelectedKeys = oMultiComboBox.getSelectedKeys();
    const aSelectedItems = oMultiComboBox.getSelectedItems();
    const oCacheModel = this.getView()?.getModel("cache") as JSONModel;

    // Create array of writing appointments with delivery date fields
    const aWritingAppointmentsWithDates = aSelectedItems.map((item: any) => ({
      ID: item.getKey(),
      name: item.getText(),
      deliveryDateVZ: null,
      deliveryDateShop: null,
    }));

    // Update the cache model
    oCacheModel.setProperty(
      "/tmpMassEditProduct/writingAppointments",
      aSelectedKeys,
    );
    oCacheModel.setProperty(
      "/tmpMassEditProduct/writingAppointmentsWithDates",
      aWritingAppointmentsWithDates,
    );
  }
  onDeliveryDateChange(oEvent: Event): void {
    const oDatePicker = oEvent.getSource() as any;
    const sValue = oDatePicker.getDateValue();

    // Clear any previous error state
    oDatePicker.setValueState("None");
    oDatePicker.setValueStateText("");
  }

  onUploadWizardStepActivate(oEvent: any) {
    const oWizard = oEvent.getSource() as Wizard;
    const iIndex = oEvent.getParameter("index");
    const sID = oWizard.getSteps()[iIndex - 1].getId();
    let sLocalID = "step1";
    if (sID.indexOf("step2") > -1) {
      sLocalID = "step2";
    } else if (sID.indexOf("step3") > -1) {
      sLocalID = "step3";
    } else if (sID.indexOf("step4") > -1) {
      sLocalID = "step4";
    }
    const oUploadWizardModel = this.getView()?.getModel("wizard") as JSONModel;
    setTimeout(() => {
      oUploadWizardModel.setProperty("/currentStep", sLocalID);
    }, 0);
  }

  onUploadBackStep() {
    var oWizard = this.byId("uploadWizard") as Wizard;
    oWizard.previousStep();
  }
  onUploadNextStep() {
    var oWizard = this.byId("uploadWizard") as Wizard;
    var sCurrentStep = this.getView()?.getLocalId(this.byId("uploadWizard")?.getCurrentStep());

    if (sCurrentStep === "step2") {
      //If next step is step3
      //Map supplier master data into cache model (for additional properties)
      const additionalPropertiesMapper: Record<string, string> = {
        gridBox_ID: "gridBox_ID",
        hangerMethod_ID: "hangerMethod_ID",
        loadingGroup_ID: "loadingGroup_ID",
        merchandiseSecurityMethod_ID: "merchandiseSecurityMethod_ID",
        pricatCatalog_ID: "pricatCatalog_ID",
        priceLabelMethod_ID: "priceLabelMethod_ID",
        productType_ID: "productType_ID",
        shippingInstruction_ID: "shippingInstruction_ID",
        targetGroup_ID: "targetGroup_ID",
        topicComponent_ID: "topicComponent_ID",
        // supplyType_SUPPLY_TYPE: "supplyType_SUPPLY_TYPE",
        // ownershipStatus_ID: "ownershipStatus_ID",
        // productionPlant_PRODUCTIONPLANT: "productionPlant_PRODUCTIONPLANT"
      };

      if (this._wizardDialogContext) {
        const oModel = this.getView()!.getModel() as any;
        const sPath = this._wizardDialogContext.getPath();

        Object.keys(additionalPropertiesMapper).forEach((key) => {
          if (this._masterDataCache[additionalPropertiesMapper[key]] && this._masterDataCache[additionalPropertiesMapper[key]] !== "") {
            oModel.setProperty(sPath + "/" + key, this._masterDataCache[additionalPropertiesMapper[key]]);
          }
        });

        oModel.setProperty(sPath + "/storageLocation_LGORT", '1000'); // Set default storage location
      }

    } else if (sCurrentStep === "step3") {
      //If next step is step4
      const oCacheModel = this.getView()?.getModel("cache") as JSONModel;
      const tmpProduct = oCacheModel.getData().tmpProduct;

      //Map smartform values into cache model
      const oSmartFormsData = this._wizardDialogContext.getObject();
      const mapper: Record<string, string> = {
        //OData_Property: tmpProduct_Property"
        topicComponent_ID: "topicComponent_ID",
        assortmentModule_ID: "assortmentModule_ID",
        productGroup_ID: "productGroup_ID",
        targetGroup_ID: "targetGroup_ID",
        module_CODE: "module_CODE",
        houseGroup_ID: "houseGroup_ID",
        baseUnitOfMeasure_ID: "baseUnitOfMeasure_ID",
        evaluationColor_ID: "evaluationColor_ID",
        sizeSystem_ID: "sizeSystem_ID",
        supplyType_SUPPLY_TYPE: "supplyType_SUPPLY_TYPE",
        seasonType_ID: "seasonType_ID",
        presentationType_CODE: "presentationType_CODE",
        pricatCatalog_ID: "pricatCatalog_ID",
        ownershipStatus_ID: "ownershipStatus_ID",
        merchandiseSecurityMethod_ID: "merchandiseSecurityMethod_ID",
        priceLabelMethod_ID: "priceLabelMethod_ID",
        hangerMethod_ID: "hangerMethod_ID",
        productType_ID: "productType_ID",
        gridBox_ID: "gridBox_ID",
        omnichannel_CODE: "omnichannel_CODE",
        series_ID: "series_ID",
        license_CODE: "license_CODE",
        program_ID: "program_ID",
        occasion_CODE: "occasion_CODE",
        property_CODE: "property_CODE",
        quality_CODE: "quality_CODE",
        pattern_ID: "pattern_ID",
        specialProduct_ID: "specialProduct_ID",
        surfaceWashing_CODE: "surfaceWashing_CODE",
        mainForm_CODE: "mainForm_CODE",
        stockingThickness_CODE: "stockingThickness_CODE",
        shippingInstruction_ID: "shippingInstruction_ID",
        loadingGroup_ID: "loadingGroup_ID",
        shippingPort_ID: "shippingPort_ID",
        productionPlant_PRODUCTIONPLANT: "productionPlant_PRODUCTIONPLANT",
        storageLocation_LGORT: "storageLocation_LGORT",
        differingIncoTerm_ID: "differingIncoTerm_ID",
        mainLabel_ID: "mainLabel_ID",
        subLabel_ID: "subLabel_ID",
        sizeLabel_ID: "sizeLabel_ID",
        sizeCode_ID: "sizeCode_ID",
        hangTag_ID: "hangTag_ID",
        stringWithSeal_ID: "stringWithSeal_ID",
        priceSticker_ID: "priceSticker_ID",
        careLabel_ID: "careLabel_ID",
        addHangTag_ID: "addHangTag_ID",
        transportChain_TC_ID: "transportChain_TC_ID"
      };

      Object.keys(mapper).forEach((key) => {
        const oDataValue = oSmartFormsData[key];
        if (
          oDataValue !== undefined &&
          oDataValue !== null &&
          oDataValue !== ""
        ) {
          tmpProduct[mapper[key]] = oDataValue;
        } else if (key === "productType_ID") {
          tmpProduct[mapper[key]] = "01"; // Set default value if not provided
        }
      });

      //Add fields from supplier master data not available in Excel fields or additional properties, but relevant in detail view
      if (this._masterDataCache.vat_ID) {
        tmpProduct.vat_ID = this._masterDataCache.vat_ID;
      }
      if (this._masterDataCache.priceLevel_ID) {
        tmpProduct.priceLevel_ID = this._masterDataCache.priceLevel_ID;
      }

      oCacheModel.updateBindings(true);

      //Add fields from supplier master data related to Excel file
      const oUploadWizardModel = this.getView()!.getModel("wizard") as JSONModel;
      var copyUploadedArticles = JSON.parse(JSON.stringify(oUploadWizardModel.getProperty("/UploadedArticles")));
      oUploadWizardModel.setProperty("/UploadedArticlesModified", copyUploadedArticles);
      for (const article of oUploadWizardModel.getProperty("/UploadedArticlesModified")) {
        if(!article.supplyType || article.supplyType === "") {
          article.supplyType = this._masterDataCache.supplyType_SUPPLY_TYPE || "";
        }
        if(!article.ownershipStatus || article.ownershipStatus === "") {
          article.ownershipStatus = this._masterDataCache.ownershipStatus_ID || "";
        }
        if(!article.productionPlant || article.productionPlant === "") {
          article.productionPlant = this._masterDataCache.productionPlant_PRODUCTIONPLANT || "";
        }
      }
    }

    oWizard.nextStep();
  }

  public initSmartChart(): void {
    //set maxHeight for categoryAxis in order to allow longer labels being fully displayed
    var oSmartChart = this.getView()?.byId(
      "smartChartArticleStatus",
    ) as SmartChart;

    oSmartChart.attachInitialized(function () {
      oSmartChart.getChartAsync().then(function (oChart) {
        oChart.setVizProperties({
          categoryAxis: { layout: { maxHeight: 0.8 } },
        });
      });
    });
  }

  public async onArticleTabBarSelect(event: Event): Promise<void> {
    if (
      ((event?.getSource() as IconTabBar)?.getSelectedKey() as string) ===
      "ArticleDash"
    ) {
      // No longer relevant
    }
  }

  onGenericSuggestionItemSelectedUploadWizard(oEvent: any): void {
    const oInput = oEvent.getSource() as Input;
    const oSelectedItem = oEvent.getParameter("selectedItem") as any;
    if (oSelectedItem) {
      const sKey = oSelectedItem.getKey();
      oInput.setSelectedKey(sKey);
      oInput.setValue(oSelectedItem.getText());
      oInput.data("isValid", "true");

      // Manually trigger the filter change logic
      this.onFilterChange(oEvent);
    }
  }

  onValueHelpConfirm(oEvent: any) {
    const oSelectedItem = oEvent.getParameter("selectedItem");
    if (oSelectedItem) {
      // Update the input field
      this._oLastInput?.setSelectedKey(oSelectedItem.data("itemKey"));
      this._oLastInput?.setValue(oSelectedItem.getProperty("title"));
      this._oLastInput?.data("isValid", "true");
      if (
        this._oLastInput?.getId().endsWith("selectKT") ||
        this._oLastInput?.getId().endsWith("selectMarke") ||
        this._oLastInput?.getId().endsWith("selectLieferant")
      ) {
        this.onFilterChange(oEvent);
      }
      // Optional: Trigger validation or formatters
      // this._oLastInput?.fireChange();
    }
  }
}
