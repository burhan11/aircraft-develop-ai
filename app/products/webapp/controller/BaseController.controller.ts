import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import AppComponent from "../Component";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import History from "sap/ui/core/routing/History";
import JSONModel from "sap/ui/model/json/JSONModel";
import ViewModels from "../model/View/ViewModels";
import { ModelNames } from "../utils/enums/ModelNames";
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
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import Table from "sap/ui/table/Table";
import Fragment from "sap/ui/core/Fragment";
import FilterOperator from "sap/ui/model/FilterOperator";
import { IWritingAppointment } from "../utils/interfaces/IBaseData.interface";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import Wizard from "sap/m/Wizard";
import MessageToast from "sap/m/MessageToast";
import Select from "sap/m/Select";
import Input from "sap/m/Input";
import SuggestionItem from "sap/m/SuggestionItem";
import StandardListItem from "sap/m/StandardListItem";
import Sorter from "sap/ui/model/Sorter";
import CustomData from "sap/ui/core/CustomData";
import ListItem from "sap/ui/core/ListItem";
import Token from "sap/m/Token";
import MultiInput from "sap/m/MultiInput";

/**
 * @namespace com.valantic.preorder.products.controller
 */
export default abstract class BaseController extends Controller {
  private _oCopyWizardDialog: Dialog;
  _oLastInput: Input | null = null;
  private _pDialog: Promise<
    | import("sap/ui/core/Control").default
    | import("sap/ui/core/Control").default[]
  >;
  private copiedProducts: any[] = [];
  private submitWA: boolean = false;
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
    if (oParameters?.query?.action != "CREATE") {
      this._clearMessages();
    }
    this.getRouter().navTo(sName, oParameters, undefined, bReplace);
  }

  /**
   * Convenience event handler for navigating back.
   * It there is a history entry we go one step back in the browser history
   * If not, it will replace the current entry of the browser history with the main route.
   */
  public onNavBack(): void {
    this._clearMessages();
    const sPreviousHash = History.getInstance().getPreviousHash();
    if (sPreviousHash !== undefined) {
      window.history.go(-1);
    } else {
      this.getRouter().navTo("main", {}, undefined, true);
    }
  }

  public createNewArticle(body: Object): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
      this._clearMessages();

      try {
        v2ODataModel.create("/Articles", body, {
          success: (success: any, response: any) => {
            var articleID: UUID = success.ID;
            var articlePath: string = v2ODataModel.createKey("/Articles", {
              ID: success.ID,
            });

            if (response?.haeders?.["sap-message"]) {
              const sapMessage = JSON.parse(response.headers["sap-message"]);
              this._addMessage([
                new Message({
                  type: sapMessage.numericSeverity,
                  code: sapMessage.code,
                  message: sapMessage.message,
                }),
              ]);
            }

            resolve({
              data: success,
              articleID: articleID,
              articlePath: articlePath,
            });
          },
          error: (error: any) => {
            MessageBox.error(
              JSON.parse(error?.responseText)?.error?.message?.value ||
              "Ein unbekannter Fehler ist aufgetreten",
              {
                title: "Fehler",
              },
            );
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
        // ToDo
      }
    });
  }

  public createNewOption(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log("createNewOption called");
      const oModel = this.getODataModel(ModelNames.ODataV2Model);
      this._clearMessages();

      try {
        oModel.create("/Products", payload, {
          success: (success: any, response: any) => {
            console.log("SUCCESS", success);
            var productID: UUID = success.ID;
            var productPath: string = oModel.createKey("/Products", {
              ID: success.ID,
            });

            if (response?.haeders?.["sap-message"]) {
              const sapMessage = JSON.parse(response.headers["sap-message"]);
              this._addMessage([
                new Message({
                  type: sapMessage.numericSeverity,
                  code: sapMessage.code,
                  message: sapMessage.message,
                }),
              ]);
            }
            resolve({
              productID: productID,
              productPath: productPath,
              data: success,
            });
          },
          error: (error: any) => {
            MessageBox.error(
              JSON.parse(error?.responseText)?.error?.message?.value ||
              "Ein unbekannter Fehler ist aufgetreten",
              {
                title: "Fehler",
              },
            );
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public createNewVariant(variantPayload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const oModel = this.getODataModel(ModelNames.ODataV2Model);
      this._clearMessages();

      try {
        oModel.create("/ProductSizes", variantPayload, {
          success: (success: any, response: any) => {
            var variantID: UUID = success.ID;
            var variantPath: string = oModel.createKey("/ProductSizes", {
              ID: success.ID,
            });

            if (response?.haeders?.["sap-message"]) {
              const sapMessage = JSON.parse(response.headers["sap-message"]);
              this._addMessage([
                new Message({
                  type: sapMessage.numericSeverity,
                  code: sapMessage.code,
                  message: sapMessage.message,
                }),
              ]);
            }
            resolve({
              ID: variantID,
              variantPath: variantPath,
              data: success,
            });
          },
          error: (error: any) => {
            MessageBox.error(
              JSON.parse(error?.responseText)?.error?.message?.value ||
              "Ein unbekannter Fehler ist aufgetreten",
              {
                title: "Fehler",
              },
            );
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private _addMessage(oMessage: Message[]): void {
    const oView = this.getView();
    if (oView) {
      const oMessageManager = oView.getModel("message");
      oMessageManager?.setMessages({ messages: oMessage });
    }
  }

  public createNewTempProduct(): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
      v2ODataModel.setDeferredGroups(["newOption"]);
      var oProperties: any = {
        supplier_ID: "",
        consumerTopic_ID: "",
        brand_ID: "",
        article_ID: "",
        evaluationColor_ID: "",
        supplierColor: "",
        productToPurch: {},
        productToSales: {},
      };

      try {
        // oResponse.product = await this.createNewTempProductElements(
        //   v2ODataModel,
        //   "/Products"
        // );
        // oResponse.productToPurch = await this.createNewTempProductElements(v2ODataModel, `/Products(${oResponse?.product?.productID})/to_Purchase`);
        // oResponse.productToSales = await this.createNewTempProductElements(v2ODataModel, `/Products(${oResponse?.product?.productID})/to_Sales`);
        const oResponse = v2ODataModel.createEntry("/Products", {
          groupId: "newOption",
          properties: oProperties,
        });
        if (oResponse) {
          resolve({
            productPath: oResponse?.getPath(),
            oData: oResponse,
          });
        } else {
          reject("Error in creating temp Option");
        }
      } catch (error) {
        reject(error);
        // ToDo
      }
    });
  }

  public createNewTempArticle(): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      const v2ODataModel = this.getODataModel(ModelNames.ODataV2Model);
      v2ODataModel.setDeferredGroups(["newArticle"]);

      try {
        var oResponse = v2ODataModel.createEntry("/Articles", {
          groupId: "newArticle",
          properties: {
            brand_ID: "",
            consumerTopic_ID: "",
            supplier_ID: "",
            supplierProductNumber: "",
          },
        });
        if (oResponse) {
          resolve({
            articlePath: oResponse.getPath(),
            oData: oResponse,
          });
        } else {
          reject("Failed to create temp article");
        }
      } catch (error) { }

      // var oResponse: any = {
      //   article: {}
      // };
      // try {
      //   oResponse.article = await this.createNewTempArticleElements(
      //     v2ODataModel,
      //     "/Articles"
      //   );
      //   resolve(oResponse);
      // } catch (error) {
      //   reject(error);
      //   // ToDo
      // }
    });
  }

  // public createNewTempProductElements(
  //   v2ODataModel: V2ODataModel,
  //   entityPath: string
  // ): Promise<Object> {
  //   return new Promise((resolve, reject) => {
  //     v2ODataModel.createEntry(entityPath, {
  //       created: (success: any) => {
  //         var productPath: string = success.getPath();
  //         var productID: string = productPath.split("'")[1];

  //         resolve({
  //           data: success,
  //           productID: productID,
  //           productPath: productPath,
  //         });
  //       },
  //       error: (error: any) => {
  //         reject(error);
  //       },
  //     });
  //   });
  // }

  // public createNewTempArticleElements(
  //   v2ODataModel: V2ODataModel,
  //   entityPath: string
  // ): Promise<Object> {
  //   return new Promise((resolve, reject) => {
  //     v2ODataModel.createEntry(entityPath, {
  //       groupId: "newArticle",
  //       created: (success: any) => {
  //         var articlePath: string = success.getPath();
  //         var articleID: string = articlePath.split("'")[1];
  //         resolve({
  //           data: success,
  //           articleID: articleID,
  //           articlePath: articlePath
  //         });
  //       },
  //       error: (error: any) => {
  //         reject(error);
  //       },
  //     });
  //   });
  // }

  public readODataEntites(
    entityName: string,
    filters?: Filter[],
    urlParams: Record<string, string> = {},
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      const dataV2Model = this.getODataModel(ModelNames.ODataV2Model);

      dataV2Model.read(entityName, {
        success: (success: any) => {
          resolve(success);
        },
        error: (error: any) => {
          reject(error);
        },
        filters: filters,
        urlParameters: urlParams,
      });
    });
  }

  public readODataWithoutFilterEntites(
    entityName: string,
    urlParams: Record<string, string> = {},
  ): Promise<Object> {
    return new Promise((resolve, reject) => {
      const dataV2Model = this.getODataModel(ModelNames.ODataV2Model);

      dataV2Model.read(entityName, {
        success: (success: any) => {
          resolve(success);
        },
        error: (error: any) => {
          reject(error);
        },
        urlParameters: urlParams,
      });
    });
  }

  public submitProductChanges(): Promise<Object> {
    return new Promise((resolve, reject) => {
      debugger;
      const dataV2Model = this?.getView()?.getModel() as ODataModel;
      dataV2Model.submitChanges({
        success: (success: any) => {
          if (success?.__batchResponses?.length) {
            const hasErrors = success.__batchResponses.some(
              (t: any) =>
                t?.response?.statusCode?.substring(0, 1).includes("4") ||
                t?.response?.statusCode?.substring(0, 1).includes("5"),
            );
            if (hasErrors) {
              reject(success);
              return;
            }
          }
          resolve(success);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  public openMessageBox(): Promise<Object> {
    return new Promise((resolve, reject) => {
      MessageBox.success("An error occurred while loading data!", {
        title: "Success",
        onClose: (action: string) => {
          resolve(action);
        },
      });
    });
  }
  private _clearMessages(): void {
    Messaging.removeAllMessages();
  }

  public async onCopyBtnPressTable(event: Event): Promise<void> {
    console.log("Copy button pressed", event);
    const oSmartTable = this.byId("LineItemsSmartTable") as SmartTable;
    const oTable = oSmartTable.getTable() as Table;

    const selectedItem = oTable
      .getContextByIndex(oTable.getSelectedIndices()[0])
      ?.getObject() as any;

    if (!this._oCopyWizardDialog) {
      this._oCopyWizardDialog = (await Fragment.load({
        id: this.getView()!.getId(),
        name: "com.valantic.preorder.products.view.fragments.CopyProductWizard",
        controller: this,
      })) as Dialog;
      this.getView()!.addDependent(this._oCopyWizardDialog);
      await this._initializeCopyWizard(selectedItem);
    }

    // Initialize the copy wizard model
    await this._initializeCopyWizard(selectedItem);
    this._oCopyWizardDialog.open();
    await this.setupMultiInputValidator("idMultiInputCopy");
  }

  public async onCopyBtnPressDetail(event: Event): Promise<void> {
    console.log("Copy button pressed from detail page", event);

    // Get the current product from the view's binding context instead of table selection
    const objectPageLayout = this.byId("ObjectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();
    const selectedItem = bindingContext?.getObject() as any;

    if (!selectedItem) {
      MessageBox.error("No product found to copy");
      return;
    }

    if (!this._oCopyWizardDialog) {
      this._oCopyWizardDialog = (await Fragment.load({
        id: this.getView()!.getId(),
        name: "com.valantic.preorder.products.view.fragments.CopyProductWizard",
        controller: this,
      })) as Dialog;
      this.getView()!.addDependent(this._oCopyWizardDialog);
      await this._initializeCopyWizard(selectedItem);
    }

    // Initialize the copy wizard model
    await this._initializeCopyWizard(selectedItem);
    this._oCopyWizardDialog.open();
    await this.setupMultiInputValidator("idMultiInputCopy");
  }

  public async setupMultiInputValidator(sId: string): Promise<void> {
    //Allow the user to input multiple values separated by semicolons and create tokens for each unique value
    const oMultiInput = this.byId(sId) as MultiInput;

    if (oMultiInput) {
      oMultiInput.addValidator((oArgs: { text: string }) => {
        const sText = oArgs.text;

        if (!sText) {
          return null;
        }

        if (sText.includes(";")) {
          const aItems = sText.split(/;+/).map(s => s.trim());
          const aCurrentTokens = oMultiInput.getTokens();
          const aExistingKeys = aCurrentTokens.map((oToken) => oToken.getKey());

          aItems.forEach((sItem: string) => {
            const sCleanText = sItem.trim();
            if (sCleanText && !aExistingKeys.includes(sCleanText)) {
              oMultiInput.addToken(new Token({
                key: sCleanText,
                text: sCleanText
              }));
              aExistingKeys.push(sCleanText);
            }
          });

          if(aExistingKeys.length > 0) {
            this.onSupplierColorSelectionChange();
          }

          setTimeout(() => {
            oMultiInput.setValue("");
          }, 0);

          return null;
        }

        const sCleanSingleText = sText.trim();
        if (sCleanSingleText) {
          const bExists = oMultiInput.getTokens().some((oToken) => oToken.getKey() === sCleanSingleText);
          if (!bExists) {
            return new Token({ key: sCleanSingleText, text: sCleanSingleText });
          } else {
            setTimeout(() => {
              oMultiInput.setValue("");
            }, 0);
          }
        }
        return null;
      });
    }
  }

  private async _initializeCopyWizard(originalProduct: any): Promise<void> {
    // First, fetch the product with its sizes
    const oDataModel = this.getView()?.getModel() as ODataModel;
    const productWithSizes = await this._readODataV2<any>(
      oDataModel,
      `/Products('${originalProduct.ID}')`,
      undefined,
      true,
      ["to_Size"], // Expand to get sizes
    );

    const oCopyWizardModel = new JSONModel({
      originalProduct: {
        ...originalProduct,
      },
      originalProductSizes: productWithSizes.to_Size?.results || [], // Store original sizes
      selectedSupplierColors: [],
      selectedColorsData: [],
      combinations: [],
      filteredWritingAppointments: [], // Add this
      step1Validated: false,
      step2Validated: false,
      step3Validated: false,
      step4Validated: false,
      canComplete: false,
      totalCombinations: 0,
      combinationsWithGtin: 0,
      combinationsWithWritingAppointment: 0,
      bulkSchreibterminSelected: false,
    });

    this.getView()!.setModel(oCopyWizardModel, "copyWizard");

    // Filter writing appointments based on original product's CT, Brand, and Supplier
    await this._filterWritingAppointmentsForCopy(
      originalProduct.consumerTopic_ID,
      originalProduct.brand_ID,
      originalProduct.supplier_ID,
    );

    const oMultiComboBox = this.byId("evaluationColorSelection") as any;
    if (oMultiComboBox && originalProduct.evaluationColor_ID) {
      const oBinding = oMultiComboBox.getBinding("items");
      if (oBinding) {
        const aFilters = [
          new Filter(
            "ID",
            FilterOperator.NE,
            originalProduct.evaluationColor_ID,
          ),
        ];
        oBinding.filter(aFilters);
      }
    }
  }

  private async _filterWritingAppointmentsForCopy(
    consumerTopicId: string,
    brandId: string,
    supplierId: string,
  ): Promise<void> {
    const oDataModel = this.getView()?.getModel() as ODataModel;
    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;

    try {
      const aFilters = [
        new Filter("consumerTopic_ID", FilterOperator.EQ, consumerTopicId),
        new Filter("brand_ID", FilterOperator.EQ, brandId),
        new Filter("supplier_ID", FilterOperator.EQ, supplierId),
      ];

      const aWritingAppointments = await this._readODataV2<
        IWritingAppointment[]
      >(oDataModel, "/WritingAppointments", aFilters);

      // Store filtered writing appointments in copy wizard model
      oCopyWizardModel.setProperty(
        "/filteredWritingAppointments",
        aWritingAppointments,
      );
    } catch (error) {
      console.error("Error filtering writing appointments for copy:", error);
      oCopyWizardModel.setProperty("/filteredWritingAppointments", []);
    }
  }

  _readODataV2<T>(
    oModel: ODataModel,
    sPath: string,
    aFilters?: Filter[],
    single: boolean = false,
    expand?: string[],
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const oParameters: any = {
        filters: aFilters,
        success: (data: any) => {
          if (single) {
            resolve(data as T);
          }
          resolve((data as any).results as T);
        },
        error: (oError: any) => {
          console.log(oError);
          reject(oError);
        },
      };

      // Add expand parameter if provided
      if (expand && expand.length > 0) {
        oParameters.urlParameters = {
          $expand: expand.join(","),
        };
      }

      oModel.read(sPath, oParameters);
    });
  }

  public async onCancelCopyWizard(): Promise<void> {
    if (this._oCopyWizardDialog) {
      this.onCleanMultiInput("idMultiInputCopy");
      this._oCopyWizardDialog.close();
      this._oCopyWizardDialog.destroy();
      this._oCopyWizardDialog = null as any;
    }
  }

  onCleanMultiInput(sId: string): void {
    const oMultiInput = this.byId(sId) as MultiInput;
    if (oMultiInput) {
      oMultiInput.removeAllTokens();
      oMultiInput.setValue("");
    }
  }

  public onSupplierColorSelectionChange(event: Event): void {
    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;
    // const oSource = event.getSource() as any;
    // const aSelectedItems = oSource.getSelectedItems();
    const oMultiInput = this.byId("idMultiInputCopy") as MultiInput;
    let aTokens = oMultiInput.getTokens();

    const sType = event?.getParameter("type") ?? "added";
    if (sType === "removed") {
        const aRemoved = event.getParameter("removedTokens");
        const aRemovedKeys = new Set(aRemoved.map((t: Token) => t.getKey()));
        aTokens = aTokens.filter(t => !aRemovedKeys.has(t.getKey()));
    }

    // Get original product sizes
    const originalSizes =
      oCopyWizardModel.getProperty("/originalProductSizes") || [];

    // Create size combinations from original product sizes
    const sizeCombinations =
      originalSizes.length > 0
        ? originalSizes.map((size: any) => ({
          size1Id: size.size_1_CODE || "",
          size1Name: size.size_1_CODE || "",
          size2Id: size.size_2_CODE || "",
          size2Name: size.size_2_CODE || "",
          selected: true,
        }))
        : [
          {
            size1Id: "",
            size1Name: "",
            size2Id: "",
            size2Name: "",
            selected: true,
          },
        ];

    const selectedSupplierColors = aTokens.map((item: any) => ({
      id: item.getKey(),
      name: item.getKey(),
      sizeCombinations: JSON.parse(JSON.stringify(sizeCombinations)), // Deep copy for each color
      writingAppointments: [],
    }));

    oCopyWizardModel.setProperty(
      "/selectedSupplierColors",
      selectedSupplierColors,
    );
    oCopyWizardModel.setProperty(
      "/step1Validated",
      selectedSupplierColors.length > 0,
    );
    this._prepareColorSizeCombinations();
    this.validateStep1();
  }

  validateStep1() {
    var oModel = this.getModel("copyWizard");
    var aSelectedColors = oModel.getProperty("/selectedSupplierColors") || [];
    var bValid = aSelectedColors.length > 0;
    oModel.setProperty("/step1Validated", bValid);
    return bValid;
  }

  private _prepareColorSizeCombinations(): void {
    const oModel = this.getView()?.getModel("copyWizard") as JSONModel;
    const aSelectedColors =
      oModel.getProperty("/selectedSupplierColors") || [];
    const aCombinations: any[] = [];

    aSelectedColors.forEach((oColor: any) => {
      const aSizeCombinations = oColor.sizeCombinations || [];
      const writingAppointments = oColor.writingAppointments || [];

      aSizeCombinations.forEach((combination: any) => {
        // Only include selected combinations with at least one size
        if (combination.selected && combination.size1Id) {
          aCombinations.push({
            colorId: oColor.id,
            colorName: oColor.name,
            size1Id: combination.size1Id || null,
            size1Name: combination.size1Id || "",
            size2Id: combination.size2Id || null,
            size2Name: combination.size2Id || "",
            gtin: "",
            writingAppointments: writingAppointments,
            combinationKey: `${oColor.id}_${combination.size1Id || "null"}_${combination.size2Id || "null"}`,
          });
        }
      });

      // If no size combinations are selected, add color without size
      if (aSizeCombinations.every((c: any) => !c.selected)) {
        aCombinations.push({
          colorId: oColor.id,
          colorName: oColor.name,
          size1Id: null,
          size1Name: "",
          size2Id: null,
          size2Name: "",
          gtin: "",
          writingAppointments: writingAppointments,
          combinationKey: `${oColor.id}_null_null`,
        });
      }
    });

    oModel.setProperty("/colorSizeCombinations", aCombinations);
  }

  onCopyBackStep() {
    var oWizard = this.byId("copyProductWizard") as Wizard;
    oWizard.previousStep();
  }
  onCopyNextStep() {
    var oWizard = this.byId("copyProductWizard") as Wizard;
    this._prepareColorSizeCombinations();
    oWizard.nextStep();
  }

  public onWritingAppointmentChange(oEvent: Event): void {
    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;
    const oSource = oEvent.getSource() as any;
    const aSelectedItems = oSource.getSelectedItems() || [];

    const selectedWritingAppointments = aSelectedItems.map((item: any) => ({
      id: item.getKey(),
      name: item.getText(),
    }));
    const oBindingContext = oSource.getBindingContext("copyWizard");
    const colorId = oBindingContext ? oBindingContext.getProperty("id") : null;
    const selectedSupplierColors =
      oCopyWizardModel.getProperty("/selectedSupplierColors") || [];
    const indexToUpdate = selectedSupplierColors.findIndex(
      (el: any) => el.id === colorId,
    );

    if (indexToUpdate !== -1) {
      selectedSupplierColors[indexToUpdate].writingAppointments =
        selectedWritingAppointments;
    }

    this._prepareColorSizeCombinations();
  }

  public onSizeCombinationSelectionChange(event: Event): void {
    const oTable = event.getSource() as any;
    const aSelectedIndices = oTable.getSelectedIndices();
    const oContext = oTable.getBindingContext("copyWizard");
    const sPath = oContext?.getPath();

    if (!sPath) return;

    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;
    const aSizeCombinations =
      oCopyWizardModel.getProperty(sPath + "/sizeCombinations") || [];

    // Mark combinations as selected/unselected
    aSizeCombinations.forEach((combo: any, index: number) => {
      combo.selected = aSelectedIndices.includes(index);
    });

    oCopyWizardModel.setProperty(
      sPath + "/sizeCombinations",
      aSizeCombinations,
    );
    this._prepareColorSizeCombinations();
  }

  public onDeleteSizeCombination(event: Event): void {
    const oButton = event.getSource() as Button;
    const oContext = oButton.getBindingContext("copyWizard");
    const sPath = oContext?.getPath();

    if (!sPath) return;

    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;

    // Extract the indices from the path (e.g., "/selectedSupplierColors/0/sizeCombinations/1")
    const pathParts = sPath.split("/");
    const colorIndex = parseInt(pathParts[2]);
    const comboIndex = parseInt(pathParts[4]);

    const aSizeCombinations =
      oCopyWizardModel.getProperty(
        `/selectedSupplierColors/${colorIndex}/sizeCombinations`,
      ) || [];

    // Don't allow deletion if it's the last combination
    if (aSizeCombinations.length <= 1) {
      MessageBox.warning(
        this.getText("massEdit.copyProduct.cannotDeleteLastCombination") ||
        "Es muss mindestens eine Größenkombination vorhanden sein.",
      );
      return;
    }

    // Remove the combination at the specified index
    aSizeCombinations.splice(comboIndex, 1);

    oCopyWizardModel.setProperty(
      `/selectedSupplierColors/${colorIndex}/sizeCombinations`,
      aSizeCombinations,
    );

    // Update the combinations
    this._prepareColorSizeCombinations();

    MessageToast.show(
      this.getText("massEdit.copyProduct.combinationDeleted") ||
      "Größenkombination gelöscht",
    );
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

  public onAddSizeCombination(event: Event): void {
    const oButton = event.getSource() as Button;
    const oContext = oButton.getBindingContext("copyWizard");
    const sPath = oContext?.getPath();

    if (!sPath) return;

    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;
    const aSizeCombinations =
      oCopyWizardModel.getProperty(sPath + "/sizeCombinations") || [];

    aSizeCombinations.push({
      size1Id: "",
      size1Name: "",
      size2Id: "",
      size2Name: "",
      selected: true,
    });

    oCopyWizardModel.setProperty(
      sPath + "/sizeCombinations",
      aSizeCombinations,
    );
    this._prepareColorSizeCombinations();
  }

  public async onCopyWizardCompleted(): Promise<void> {
    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;
    const originalProductID =
      oCopyWizardModel.getProperty("/originalProduct").ID;
    const originalProduct = await this._readODataV2<any>(
      this.getView()!.getModel() as ODataModel,
      `/Products('${originalProductID}')`,
      undefined,
      true,
    );
    const colorSizeCombinations =
      oCopyWizardModel.getProperty("/colorSizeCombinations") || [];

    // Show confirmation dialog before proceeding
    const combinationCount = colorSizeCombinations.length;
    const colorCount = [
      ...new Set(colorSizeCombinations.map((c: any) => c.colorId)),
    ].length;

    const oDataModel = this.getODataModel(ModelNames.ODataV2Model);
    let error = false;

    for (const combination of oCopyWizardModel.getData()
      .colorSizeCombinations) {
      const exists = await new Promise<any>((resolve, reject) => {
        oDataModel.callFunction("/checkExistingGTINInTool", {
          urlParameters: { GTIN: combination.gtin },
          method: "GET",
          success: (oData: any) => resolve(oData),
          error: (oError: any) => reject(oError),
        });
      });
      if (exists.checkExistingGTINInTool.existing && exists.checkExistingGTINInTool.existingIn) {
        MessageBox.error(`GTIN ${combination.gtin} existiert bereits in ${exists.checkExistingGTINInTool.existingIn}`, { title: "Fehler" });
        return;
      }
    }

    if (error) return;

    MessageBox.confirm(this.getText("copy.confirm.description"), {
      title: this.getText("copy.confirm.title"),
      actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
      emphasizedAction: MessageBox.Action.OK,
      onClose: (oAction: string) => {
        if (oAction === MessageBox.Action.OK) {
          this._processCopyWithCombinations(
            originalProduct,
            colorSizeCombinations,
          );
        }
      },
    });
  }

  /**
   * Processes the actual copy operation with color/size combinations
   * @param originalProduct - The original product to copy
   * @param combinations - Array of color/size combinations with GTIN and Schreibtermin
   * @private
   */
  private async _processCopyWithCombinations(
    originalProduct: any,
    combinations: any[],
  ): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const sGroupId = Math.random().toString(36).substring(2);

    try {
      this.getView()?.setBusy(true);

      // Group combinations by color
      const colorGroups = combinations.reduce(
        (groups: any, combination: any) => {
          const colorId = combination.colorId;
          if (!groups[colorId]) {
            groups[colorId] = {
              color: {
                ID: colorId,
                name: combination.colorName,
              },
              sizes: [],
              writingAppointments: combination.writingAppointments || [],
            };
          }

          // Only add size combination if at least one size is selected
          if (combination.size1Id) {
            groups[colorId].sizes.push({
              size1Id: combination.size1Id,
              size1Name: combination.size1Id,
              size2Id: combination.size2Id,
              size2Name: combination.size2Id,
              gtin: combination.gtin,
            });
          }
          return groups;
        },
        {},
      );

      this.copiedProducts = [];
      // Create one product per color
      for (const [colorId, colorGroup] of Object.entries(
        colorGroups,
      ) as any[]) {
        const ID = globalThis.crypto.randomUUID();
        console.log(originalProduct);
        const productCopy = {
          ID: ID,
          brand_ID: originalProduct.brand_ID,
          consumerTopic_ID: originalProduct.consumerTopic_ID,
          supplier_ID: originalProduct.supplier_ID,
          supplyType_SUPPLY_TYPE: originalProduct.supplyType_SUPPLY_TYPE,
          topicComponent_ID: originalProduct.topicComponent_ID,
          targetGroup_ID: originalProduct.targetGroup_ID,
          vat_ID: originalProduct.vat_ID,
          pricatCatalog_ID: originalProduct.pricatCatalog_ID,
          productType_ID: originalProduct.productType_ID,
          ownershipStatus_ID: originalProduct.ownershipStatus_ID,
          gridBox_ID: originalProduct.gridBox_ID,
          shippingInstruction_ID: originalProduct.shippingInstruction_ID,
          priceLevel_ID: originalProduct.priceLevel_ID,
          productionPlant_PRODUCTIONPLANT:
            originalProduct.productionPlant_PRODUCTIONPLANT,
          storageLocation_LGORT: originalProduct.storageLocation_LGORT,
          productGroup_ID: originalProduct.productGroup_ID,
          assortmentModule_ID: originalProduct.assortmentModule_ID,

          status_ID: "InProgress",
          supplierProductNumber: originalProduct.supplierProductNumber,
          name: `${originalProduct.name} - ${colorGroup.color.name}`,
          /*createdAt: undefined,
            modifiedAt: undefined,
            createdBy: undefined,
            modifiedBy: undefined,
            availableUntil: undefined,
            availableFrom: undefined,
            endOfLifeCycle: undefined,*/
          // evaluationColor_ID: colorId,
          supplierColor: colorId,
          // Create size associations with both size1 and size2
          to_Size: colorGroup.sizes.map((sizeCombo: any) => {
            const sizeEntry: any = {};

            if (sizeCombo.size1Name) {
              sizeEntry.size_1_CODE = sizeCombo.size1Id;
            }
            if (sizeCombo.size2Name) {
              sizeEntry.size_2_CODE = sizeCombo.size2Id;
            }
            if (sizeCombo.gtin) {
              sizeEntry.GTIN = sizeCombo.gtin;
            }

            return sizeEntry;
          }),
        };

        /*delete productCopy.__metadata;
          delete productCopy.to_Purchase;
          delete productCopy.to_Sales;*/

        const mParameters = {
          groupId: sGroupId,
        };
        oModel.setDeferredGroups([sGroupId]);

        if (!productCopy.supplierColor) continue;
        // oModel.create("/Products", productCopy, mParameters);
        this.copiedProducts.push(productCopy);

        if (colorGroup.writingAppointments.length) {
          this.submitWA = true;
          for (const el of colorGroup.writingAppointments) {
            oModel.create(
              "/ProductsToWritingAppointments",
              {
                product_ID: ID,
                writingAppointment_ID: el.id,
              },
              mParameters,
            );
          }
        }
      }

      if (this.copiedProducts.length > 0) {
        const actionPath = "/copyProducts";
        const parameters = {
          products: JSON.stringify(this.copiedProducts),
        };

        const result = await new Promise((resolve, reject) => {
          oModel.callFunction(actionPath, {
            method: "POST",
            urlParameters: parameters,
            success: (oData: any, oResponse: any) =>
              resolve(oData.copyProducts),
            error: (error: any) => {
              const errorMessage = error?.responseText
                ? JSON.parse(error.responseText)?.error?.message?.value
                : this.getText("product.already.exist");
              MessageBox.error(errorMessage);
              reject(error);
              return;
            },
          });
        });

        if (result && !this.submitWA) {
          this.getView()?.setBusy(false);
          const productCount = Object.keys(colorGroups).length;
          MessageToast.show(`${productCount} Produkt(e) erfolgreich kopiert`);
          const oSmartTable = this.byId("LineItemsSmartTable") as SmartTable;
          if (oSmartTable) {
            oSmartTable.rebindTable(true);
            const oTable = oSmartTable.getTable() as Table;
            oTable.clearSelection();
          }
          this.onCopyWizardCancel();
        }
      }

      if (this.submitWA) {
        oModel.submitChanges({
          groupId: sGroupId,
          success: (oData: any, oResponse: any) => {
            this.getView()?.setBusy(false);
            const productCount = Object.keys(colorGroups).length;
            MessageToast.show(`${productCount} Produkt(e) erfolgreich kopiert`);

            const oSmartTable = this.byId("LineItemsSmartTable") as SmartTable;
            if (oSmartTable) {
              oSmartTable.rebindTable(true);
              const oTable = oSmartTable.getTable() as Table;
              oTable.clearSelection();
            }
            this.onCopyWizardCancel();
          },
          error: (oError: any) => {
            this.getView()?.setBusy(false);
            MessageBox.error(this.getText("copy.error.description"));
            console.error("Batch copy failed:", oError);
          },
        });
      }
    } catch (error) {
      this.getView()?.setBusy(false);
      MessageToast.show(this.getText("copy.error.description"));
      console.error("Copy operation failed:", error);
    }
  }

  public onCopyWizardCancel(): void {
    // Close the copy wizard dialog
    const oCopyWizardDialog = this.byId("copyProductWizardDialog") as Dialog;
    if (oCopyWizardDialog) {
      oCopyWizardDialog.close();
    }
    const oWizard = this.byId("copyProductWizard") as any;
    if (oWizard) {
      oWizard.discardProgress(oWizard.getSteps()[0]);
    }
  }

  public onGtinChange(oEvent: Event): void {
    const sValue = (oEvent as any).getParameter("value");
    const oSource = oEvent.getSource() as any;
    const oBindingContext = oSource.getBindingContext("copyWizard");
    const sPath = oBindingContext.getPath();

    // Update the GTIN value in the model
    const oModel = this.getView()?.getModel("copyWizard") as JSONModel;
    oModel.setProperty(sPath + "/gtin", sValue);
  }

  public onSizeCombinationChange(event: Event): void {
    const oSelect = event.getSource() as Select;
    const oContext = oSelect.getBindingContext("copyWizard");
    const sPath = oContext?.getPath();

    if (!sPath) return;

    const oCopyWizardModel = this.getView()?.getModel(
      "copyWizard",
    ) as JSONModel;
    const oCombination = oCopyWizardModel.getProperty(sPath);
    const oSelectedItem = oSelect.getSelectedItem();

    // Determine if this is size1 or size2 based on binding path
    const sPropertyPath = oSelect.getBindingPath("selectedKey");

    if (sPropertyPath?.includes("size1Id")) {
      oCombination.size1Id = oSelectedItem?.getKey() || "";
      oCombination.size1Name = oSelectedItem?.getKey() || "";
    } else if (sPropertyPath?.includes("size2Id")) {
      oCombination.size2Id = oSelectedItem?.getKey() || "";
      oCombination.size2Name = oSelectedItem?.getKey() || "";
    }

    oCopyWizardModel.setProperty(sPath, oCombination);
    this._prepareColorSizeCombinations();
  }

  onGenericValueHelpRequest(oEvent: any) {
    const oView = this.getView();
    const oInput = oEvent.getSource();

    // 1. Store the Input that triggered the help to update it later
    this._oLastInput = oInput;

    // 2. Read Configuration from Custom Data
    // We use 'data()' shortcut to access <core:CustomData>
    const sEntitySet = oInput.data("entitySet");
    const sTitleKey = oInput.data("titleKey");
    const sDescKey = oInput.data("descKey");
    const sDialogTitle = oInput.data("dialogTitle");
    const sSortBy = oInput.data("sortBy");
    const sFilterKey = oInput.data("filterKey");
    const sFilterValue = oInput.data("filterValue");
    const sFilterKey2 = oInput.data("filterKey2");
    const sFilterValue2 = oInput.data("filterValue2");

    // 3. Create/Load the Dialog (Singleton pattern)
    if (!this._pDialog) {
      this._pDialog = Fragment.load({
        id: oView?.getId(),
        name: "com.valantic.preorder.products.view.fragments.GenericValueHelp", // Adjust path to your fragment
        controller: this,
      }).then(function (oDialog) {
        oView?.addDependent(oDialog as Dialog);
        return oDialog;
      });
    }

    this._pDialog.then(function (oDialog: any) {
      // 4. Set the Dialog Title dynamically
      // We can use a local JSON model or properties, here I set it directly
      oDialog.setTitle(sDialogTitle);
      const oSorter = sSortBy ? new Sorter(sSortBy, false) : null;
      // 5. Create the Template for the list items
      var oTemplate = new StandardListItem({
        title: sDescKey
          ? "{" + sTitleKey + "} ({" + sDescKey + "})"
          : "{" + sTitleKey + "}", // e.g. {Name}
        customData: [
          new CustomData({
            key: "itemKey",
            value: "{" + sTitleKey + "}", // Store the key here
          }),
        ],
      });

      // 6. Bind the Aggregation dynamically
      const aFilters =
        sFilterKey && sFilterValue && sFilterKey2 && sFilterValue2
          ? [
            new Filter(sFilterKey, FilterOperator.EQ, sFilterValue as string),
            new Filter(
              sFilterKey2,
              FilterOperator.EQ,
              sFilterValue2 as string,
            ),
          ]
          : sFilterKey && sFilterValue
            ? [
              new Filter(
                sFilterKey,
                FilterOperator.EQ,
                sFilterValue as string,
              ),
            ]
            : [];
      oDialog.bindAggregation("items", {
        path: sEntitySet, // e.g. /Suppliers
        template: oTemplate,
        sorter: oSorter,
        filters: aFilters,
        // Optional: Add Sorters here if needed
      });
      oDialog.setGrowingThreshold(100);
      oDialog.setGrowing(true);

      // 7. Store config for search filtering
      oDialog._sSearchKey = sTitleKey;

      oDialog.open();
    });
  }

  /**
   * Search Handler (Dynamic filtering)
   */
  onValueHelpSearch(oEvent: any) {
    const sTerm = oEvent.getParameter("value");

    const oInput = this._oLastInput;
    if (!oInput) return;

    // Read Configuration (Same as Value Help)
    const sTitleKey = oInput.data("titleKey");
    const sDescKey = oInput.data("descKey");

    const { operator, term } = this._parseSearchTerm(sTerm);

    const oFilter = new Filter(sTitleKey, operator, term);

    //add or filter of ID field

    const oFilter2 = new Filter(sDescKey, operator, term);

    const oCombinedFilter = new Filter({
      filters: [oFilter, oFilter2],
      and: false, // 'or' condition
    });

    const oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([oCombinedFilter]);
  }

  private _parseSearchTerm(sTerm: string) {
    let sOperator = FilterOperator.Contains;
    let sCleanTerm = sTerm;

    if (sCleanTerm.indexOf("*") > -1) {
      if (sCleanTerm.startsWith("*") && sCleanTerm.endsWith("*")) {
        sOperator = FilterOperator.Contains;
        sCleanTerm = sCleanTerm.slice(1, -1);
      } else if (sCleanTerm.endsWith("*")) {
        sOperator = FilterOperator.StartsWith;
        sCleanTerm = sCleanTerm.slice(0, -1);
      } else if (sCleanTerm.startsWith("*")) {
        sOperator = FilterOperator.EndsWith;
        sCleanTerm = sCleanTerm.slice(1);
      } else {
        sOperator = FilterOperator.Contains;
        sCleanTerm = sCleanTerm.replace(/\*/g, "");
      }
    }
    return { operator: sOperator, term: sCleanTerm };
  }

  /**
   * Confirm/Select Handler
   */
  onValueHelpConfirm(oEvent: any) {
    const oSelectedItem = oEvent.getParameter("selectedItem");
    if (oSelectedItem) {
      // Update the input field
      this._oLastInput?.setSelectedKey(oSelectedItem.data("itemKey"));
      this._oLastInput?.setValue(oSelectedItem.getProperty("title"));
      this._oLastInput?.data("isValid", "true");

      // Optional: Trigger validation or formatters
      // this._oLastInput?.fireChange();
    }
  }
  onValueHelpCancel() {
    // Cleanup if necessary
    this._oLastInput = null;
  }
  async onGenericSuggest(oEvent: any) {
    const oInput = oEvent.getSource();
    oInput.data("isValid", "false");
    const sTerm = oEvent.getParameter("suggestValue");
    oInput.attachBrowserEvent("focusout", function (any: any) {
      if (oInput.data("isValid") !== "true") {
        oInput.setValue("");
      }
    });

    // Read Configuration (Same as Value Help)
    const sEntitySet = oInput.data("entitySet");
    const sTitleKey = oInput.data("titleKey");
    const sDescKey = oInput.data("descKey");
    const sSortBy = oInput.data("sortBy");
    const oSorter = sSortBy ? new Sorter(sSortBy, false) : null;
    const sFilterKey = oInput.data("filterKey");
    const sFilterValue = oInput.data("filterValue");
    const sFilterKey2 = oInput.data("filterKey2");
    const sFilterValue2 = oInput.data("filterValue2");
    // 1. Lazy Binding: If not bound yet, bind it now.
    if (!oInput.getBinding("suggestionItems")) {
      // Create the Template dynamically
      const oTemplate = new ListItem({
        text: sDescKey
          ? "{" + sTitleKey + "} ({" + sDescKey + "})"
          : "{" + sTitleKey + "}", // Main text
        key: "{" + sTitleKey + "}", // Key to return
      });

      const aFilters =
        sFilterKey && sFilterValue && sFilterKey2 && sFilterValue2
          ? [
            new Filter(sFilterKey, FilterOperator.EQ, sFilterValue as string),
            new Filter(
              sFilterKey2,
              FilterOperator.EQ,
              sFilterValue2 as string,
            ),
          ]
          : sFilterKey && sFilterValue
            ? [
              new Filter(
                sFilterKey,
                FilterOperator.EQ,
                sFilterValue as string,
              ),
            ]
            : [];
      // Bind the aggregation
      oInput.bindAggregation("suggestionItems", {
        path: sEntitySet,
        template: oTemplate,
        sorter: oSorter,
        filters: aFilters,
        length: 300,
        // Limit results for performance
      });
    }

    // 2. Filter the list based on user input
    const oBinding = oInput.getBinding("suggestionItems");

    const { operator, term } = this._parseSearchTerm(sTerm);

    // Create a filter for the "Title" field
    // Operator 'Contains' or 'StartsWith' depending on preference
    const oFilter = new Filter(sTitleKey, operator, term);
    //add or filter of ID field
    if (sDescKey) {
      const oFilter2 = new Filter(sDescKey, operator, term);

      const oCombinedFilter = new Filter({
        filters: [oFilter, oFilter2],
        and: false, // 'or' condition
      });

      // Apply the filter to the binding

      oBinding.filter([oCombinedFilter]);
    } else {
      oBinding.filter([oFilter]);
    }

    // Optional: Prevent the suggestion popup from closing while typing
    oInput.setFilterFunction(function (sValue: any, oItem: any) {
      // We handle filtering via OData/Binding above, so we return true
      // to let the backend results show.
      return true;
    });
  }
  onGenericSuggestionItemSelected(oEvent: any) {
    const oItem = oEvent.getParameter("selectedItem");
    const oInput = oEvent.getSource();

    if (oItem) {
      // We want the ID (Key) in the input value, not the Name (Text)
      oInput.setSelectedKey(oItem.getKey());
      oInput.setValue(oItem.getText());
      oInput.data("isValid", "true");
      // Optional: Update the description label next to the input
      // oInput.setDescription(oItem.getText());

      // Stop the default behavior (which sets Value = Text)
      // However, UI5 usually updates value before this event.
      // Depending on version, you might need to force the value update:
      // this.getView().getModel().setProperty(oInput.getBindingContext().getPath() + "/ID", oItem.getKey());
    }
  }

  public async validateChildExistence(
    oModel: ODataModel,
    ID: string,
    level: string,
  ): Promise<boolean | undefined> {
    this._clearMessages;
    try {
      return new Promise<boolean>((resolve, reject) => {
        oModel.callFunction("/checkChildExistence", {
          method: "POST",
          urlParameters: {
            ID: ID,
            level: level,
          },
          success: () => {
            resolve(true);
          },
          error: (error: any) => {
            const errorMessage = error?.responseText
              ? JSON.parse(error.responseText)?.error?.message?.value
              : this.getText("validateChild.error");
            MessageBox.error(errorMessage);
            console.error("Error in validating child:", error);
            oModel.refresh();
            reject(false);
          },
        });
      });
    } catch (error) {
      console.error("Error in validating child:", error);
      return false;
    }
  }

}