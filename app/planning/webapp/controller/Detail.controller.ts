import Dialog from "sap/m/Dialog";
import Event from "sap/ui/base/Event";
import Fragment from "sap/ui/core/Fragment";
import BaseController from "./Base.Controller";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import Table from "sap/ui/table/Table";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageToast from "sap/m/MessageToast";
import SmartFilterBar from "sap/ui/comp/smartfilterbar/SmartFilterBar";
import MessageBox from "sap/m/MessageBox";
import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Context from "sap/ui/model/Context";
import SegmentedButton from "sap/m/SegmentedButton";
import JSONModel from "sap/ui/model/json/JSONModel";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import Sorter from "sap/ui/model/Sorter";
import DatePicker from "sap/m/DatePicker";
import MultiComboBox from "sap/m/MultiComboBox";
import Column from "sap/ui/table/Column";
import Text from "sap/m/Text";
import Label from "sap/m/Label";
import VBox from "sap/m/VBox";
import Control from "sap/ui/core/Control";
import TreeTable from "sap/ui/table/TreeTable";

/**
 * @namespace com.valantic.preorder.planning.controller
 */
export default class Detail extends BaseController {
  private _oCreatePlanningDialog: Dialog;
  private planning_ID: string;
  private _oAmountChangeDialog: Dialog;
  private _oSAPCreationDialog: Dialog;
  private bWritingTotalQuantityPlanning: boolean;
  private sPlanningProductsSmartTable: string;
  private sHGShowHideButton: string;
  private sCurrentFragment: string | undefined;
  private sAmountChange: string;
  private _bNewPlanning: boolean = false;
  private sDeletePlanningProducts: string;
  private sHouseGroupLabel: string;
  private editStateModel: JSONModel;
  private sCurrentLevel: string = "option";
  private bBatchListenerAttached: boolean = false;
  private bChangesGeneralInfo: boolean = false;

  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    const route = this.getRouter()?.getRoute("RouteDetails");
    route?.attachMatched(this.handleRouteMatched, this);
    this.getRouter()?.attachRouteMatched((event: any) => {
      if (event.getParameter("name") !== "RouteDetails") {
        this._bNewPlanning = false;
      }
    }, this);
    (this.getOwnerComponent() as any).getEventBus().subscribe(
      "planning",
      "newPlanningCreated",
      () => {
        this._bNewPlanning = true;
      },
      this,
    );
    // this.sPlanningProductsSmartTable = (!this.bWritingTotalQuantityPlanning) ?
    //   "planningProductsSmartTable" :
    //   "planningProductsSmartTableWithoutHG"
    // const oTable = (
    //   this.byId(this.sPlanningProductsSmartTable) as SmartTable
    // )?.getTable() as Table;
    // oTable.attachRowSelectionChange(() => {
    //   const selectedIndices = oTable.getSelectedIndices();
    //   const deleteButton = this.byId("deletePlanningProducts") as Button;
    //   const amountChangeButton = this.byId("amountChange") as Button;
    //   const status = (this.byId("objectPageLayout") as ObjectPageLayout)
    //     .getBindingContext()
    //     ?.getProperty("status_ID");
    //   const budgetData = this.getView()
    //     ?.getModel("budgetData")
    //     ?.getProperty("/houseGroupBudgets");
    //   if (deleteButton) {
    //     deleteButton.setEnabled(
    //       selectedIndices.length > 0 && status === "InProgress" && !!budgetData
    //     );
    //   }
    //   if (amountChangeButton) {
    //     amountChangeButton.setEnabled(
    //       selectedIndices.length > 0 && status === "InProgress" && !!budgetData
    //     );
    //   }
    // });
    this.editStateModel = new JSONModel({
      editable: false,
    });
    this.getView()?.setModel(this.editStateModel, "editState");

    // // Attach to SmartTable edit toggle event
    // const oSmartTable = this.byId(this.sPlanningProductsSmartTable) as SmartTable //this.byId("planningProductsSmartTable") as SmartTable;
    // oSmartTable?.attachEditToggled((event: any) => {
    //   const isEditable = event.getParameter("editable");
    //   editStateModel.setProperty("/editable", isEditable);
    // });
  }

  private initAdjustAmountModel(): JSONModel {
    return new JSONModel({
      houseGroup1: null,
      houseGroup2: null,
      houseGroup3: null,
      houseGroup4: null,
      houseGroup5: null,
      houseGroup6: null,
      houseGroup7: null,
      houseGroup8: null,
      houseGroup9: null,
      houseGroup10: null,
      houseGroup11: null,
      houseGroup12: null,
      houseGroup13: null,
      houseGroup14: null,
      houseGroup15: null,
      overallAmount: null,
      unitDescription: "%",
      placeholderText: "z.B., +15 or -15",
      selectedUnit: "percentage",
      overallPercentageToggle: true,
    });
  }
  public readOData(entityPath: string, urlParameters: any): Promise<Object> {
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

  private async getPlanningProducts(
    planningId: string,
  ): Promise<Array<{ GTIN: string }>> {
    try {
      const response: any = await this.readOData("/PlanningProducts", {
        $select: "product_ID",
        $filter: `writingAppointment_ID eq '${planningId}'`,
      });
      return response.results;
    } catch (error) {
      console.error("Error checking planning products:", error);
      return [];
    }
  }

  private async getPlanningProductSizes(
    planningId: string,
  ): Promise<Array<{ GTIN: string }>> {
    try {
      const response: any = await this.readOData("/PlanningProductSizes", {
        $select: "productSize_ID",
        $filter: `writingAppointment_ID eq '${planningId}'`,
      });
      return response.results;
    } catch (error) {
      console.error("Error checking planning products:", error);
      return [];
    }
  }

  private async getWritingAppointment(planningId: string): Promise<boolean> {
    try {
      const response: any = await this.readOData(
        "/WritingAppointments(" + planningId + ")",
        {
          $select: "allocationMode_ID",
        },
      );
      if (response.allocationMode_ID === null) {
        return false;
      } else {
        return response.allocationMode_ID === "AutomaticAllocation";
      }
    } catch (error) {
      console.error("Error checking planning products:", error);
      return false;
    }
  }

  public onBeforeRebindPlanningTable(oEvent: any): void {
    const oBindingParams = oEvent.getParameter("bindingParams");
    if (this.planning_ID) {
      const oFilter = new Filter(
        "writingAppointment_ID",
        FilterOperator.EQ,
        this.planning_ID,
      );
      oBindingParams.filters.push(oFilter);
    }
    const oSorter = new Sorter("index", false);
    oBindingParams.sorter.push(oSorter);
    // Ensure differingHouseGroups is expanded
    if (!oBindingParams.parameters) {
      oBindingParams.parameters = {};
    }

    const expand = oBindingParams.parameters.expand || "";
    const expandParts = expand
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    if (!expandParts.includes("differingHouseGroups")) {
      expandParts.push("differingHouseGroups");
    }

    oBindingParams.parameters.expand = expandParts.join(",");

    const oSmartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    const oTable = oSmartTable.getTable() as Table;
    if (!this.bWritingTotalQuantityPlanning) {
      this.removeHGColumns(oTable);
      this.appendHGColumns(oTable, true);
    } else {
      this.destroyHGColumns(oTable);
      this.keepTotalAmount(oTable, true);
    }
  }

  private appendHGColumns(oTable: Table, bAppend: Boolean): void {
    const oBudgetModel = this.getView()?.getModel("budgetData");
    const i18nModel = this.getView()?.getModel("i18n");
    const oResourceBundle = i18nModel?.getResourceBundle();
    const aTransposeRows = oBudgetModel?.getData()?.transposedRows;

    if (aTransposeRows === undefined || aTransposeRows?.length === 0) {
      (this.byId(this.sHGShowHideButton) as Button).setVisible(false);
      return;
    } else {
      (this.byId(this.sHGShowHideButton) as Button).setVisible(true);
      (this.byId(this.sHGShowHideButton) as Button).setEnabled(true);
      (this.byId(this.sHGShowHideButton) as Button).setText(
        oResourceBundle.getText("budgetHG.hide"),
      );
    }

    var aCols = oTable.getColumns();
    aCols.forEach((oCol, ind: number) => {
      const sId = oCol.getId();
      // if(sId.includes("houseGroup") && oCol.getVisible()) {
      if (
        (sId.includes("houseGroup") || sId.includes("totalAmount")) &&
        oCol.getVisible()
      ) {
        if (sId.includes(this.sHouseGroupLabel)) {
          // Header heading
          if (bAppend) {
            oCol.addMultiLabel(new Label({ id: "idHGLabel-" + ind, text: "" }));
          }
          // Header values
          aTransposeRows.forEach((row: any, index: number) => {
            const sLabel = oResourceBundle.getText(row.label);
            oCol.addMultiLabel(
              new Label({ id: "idMultiHeaderLabel-" + index, text: sLabel }),
            );
          });
        } else if (sId.includes("totalAmount")) {
          // Overall heading
          if (bAppend) {
            const sOverallLabel = oResourceBundle.getText("budgetKT.total");
            oCol.addMultiLabel(
              new Label({
                id: "idHGOverallAmount-" + ind,
                text: sOverallLabel,
              }),
            );
          }
          // Overall values
          aTransposeRows.forEach((row: any, index: number) => {
            const overall = this.formatBudgetNumber(row.overall);
            oCol.addMultiLabel(
              new Label({ id: "idMultiHeaderOverall-" + index, text: overall }),
            );
          });
        } else if (
          !sId.includes(this.sHouseGroupLabel) &&
          !sId.includes("houseGroup_ID")
        ) {
          const labelIndex = sId.match(/\d+$/);
          if (labelIndex) {
            const hgLabel = "hg" + labelIndex;
            const sTextLabel = oResourceBundle.getText(
              "planning.houseGroup" + labelIndex,
            );
            // HG heading
            if (bAppend) {
              oCol.addMultiLabel(
                new Label({ id: "idHGValue-" + ind, text: sTextLabel }),
              );
            }
            // HG values
            aTransposeRows.forEach((value: any, i: number) => {
              const formattedValue = this.formatBudgetValue(
                value[hgLabel],
                value["label"],
              );
              oCol.addMultiLabel(
                new Label({
                  id: "idMultiHeaderHG-" + ind + i,
                  text: formattedValue,
                }),
              );
            });
          }
        }
      }
    });
  }

  private keepTotalAmount(oTable: Table, bAppend: Boolean): void {
    const oBudgetModel = this.getView()?.getModel("budgetData");
    const i18nModel = this.getView()?.getModel("i18n");
    const oResourceBundle = i18nModel?.getResourceBundle();
    const aTransposeRows = oBudgetModel?.getData()?.transposedRows;

    if (aTransposeRows === undefined || aTransposeRows?.length === 0) {
      (this.byId(this.sHGShowHideButton) as Button).setVisible(false);
      return;
    } else {
      (this.byId(this.sHGShowHideButton) as Button).setVisible(true);
      (this.byId(this.sHGShowHideButton) as Button).setEnabled(true);
      (this.byId(this.sHGShowHideButton) as Button).setText(
        oResourceBundle.getText("budgetHG.hide"),
      );
    }

    var aCols = oTable.getColumns();
    aCols.forEach((oCol, ind: number) => {
      const sId = oCol.getId();
      if (
        (sId.includes("houseGroup") || sId.includes("totalAmount")) &&
        oCol.getVisible()
      ) {
        if (sId.includes(this.sHouseGroupLabel)) {
          // Header heading
          if (bAppend) {
            oCol.addMultiLabel(new Label({ id: "idHGLabel-" + ind, text: "" }));
          }
          // Header values
          aTransposeRows.forEach((row: any, index: number) => {
            if (index !== 0) {
              const sLabel = oResourceBundle.getText(row.label);
              oCol.addMultiLabel(
                new Label({ id: "idMultiHeaderLabel-" + index, text: sLabel }),
              );
            }
          });
        } else if (sId.includes("totalAmount")) {
          if (bAppend) {
            const sTotalAmountLabel = oResourceBundle.getText("budgetKT.total");
            oCol.addMultiLabel(
              new Label({
                id: "idHGOverallAmount-" + ind,
                text: sTotalAmountLabel,
              }),
            );
          }

          aTransposeRows.forEach((row: any, index: number) => {
            if (index !== 0) {
              const overall = this.formatBudgetNumber(row.overall);
              oCol.addMultiLabel(
                new Label({
                  id: "idMultiHeaderOverall-" + index,
                  text: overall,
                }),
              );
            }
          });
        }
      }
    });
  }

  public onShowBudgetHG(): void {
    const i18nModel = this.getView()?.getModel("i18n");
    const oResourceBundle = i18nModel?.getResourceBundle();
    const sHide: string = oResourceBundle.getText("budgetHG.hide");
    const sBtnVisibility =
      (this.byId(this.sHGShowHideButton) as Button).getText() !== sHide;
    const oSmartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    const oTable = oSmartTable.getTable() as Table;

    (this.byId(this.sHGShowHideButton) as Button).setText(
      sBtnVisibility
        ? oResourceBundle.getText("budgetHG.hide")
        : oResourceBundle.getText("budgetHG.show"),
    );

    if (!sBtnVisibility) {
      this.removeMultiLabels(oTable, sBtnVisibility);
    } else {
      !this.bWritingTotalQuantityPlanning
        ? this.appendHGColumns(oTable, false)
        : this.keepTotalAmount(oTable, false);
    }
  }

  private removeHGColumns(oTable: Table): void {
    oTable.getColumns().forEach((oColumns) => {
      oColumns.getMultiLabels().forEach((oLabel) => {
        const sId = oLabel.getId();
        //Hide only multilabels that have IDs
        if (
          sId.includes("idMultiHeaderLabel") ||
          sId.includes("idMultiHeaderHG") ||
          sId.includes("idMultiHeaderOverall") ||
          sId.includes("idHG")
        ) {
          oColumns.removeMultiLabel(oLabel);
          oLabel.destroy();
        }
      });
    });
  }

  private destroyHGColumns(oTable: Table): void {
    oTable.getColumns().forEach((oColumns) => {
      oColumns.getMultiLabels().forEach((oLabel) => {
        const sId = oLabel.getId();
        //Hide only multilabels that have IDs
        if (
          sId.includes("idMultiHeaderLabel") ||
          sId.includes("idMultiHeaderHG") ||
          sId.includes("idMultiHeaderOverall") ||
          sId.includes("idHG")
        ) {
          oColumns.removeMultiLabel(oLabel);
          oLabel.destroy();
        }
      });
    });
  }

  private removeMultiLabels(oTable: Table, sVisibility: Boolean): void {
    oTable.getColumns().forEach((oColumns) => {
      oColumns.getMultiLabels().forEach((oLabel) => {
        const sId = oLabel.getId();
        //Hide only multilabels that have IDs
        if (
          (sId.includes("idMultiHeaderLabel") ||
            sId.includes("idMultiHeaderHG") ||
            sId.includes("idMultiHeaderOverall")) &&
          !sVisibility
        ) {
          oColumns.removeMultiLabel(oLabel);
          oLabel.destroy();
        }
      });
    });
  }

  private refreshHGHeader(oBudgetData: any): void {
    const oSmartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    const oTable = oSmartTable.getTable() as Table;
    const aTransposeRows = oBudgetData?.getData()?.transposedRows;
    if (aTransposeRows === undefined || aTransposeRows?.length === 0) {
      return;
    }
    if (!this.bWritingTotalQuantityPlanning) {
      this.removeMultiLabels(oTable, false);
      this.appendHGColumns(oTable, false);
    } else {
      this.removeMultiLabels(oTable, false);
      this.keepTotalAmount(oTable, false);
    }
  }

  public onBeforeRebindOrderTable(oEvent: any): void {
    const oBindingParams = oEvent.getParameter("bindingParams");
    if (this.planning_ID) {
      const oFilter = new Filter(
        "writingAppointment_ID",
        FilterOperator.EQ,
        this.planning_ID,
      );
      oBindingParams.filters.push(oFilter);
    }
  }

  public async handleRouteMatched(event: Event): Promise<void> {
    //debugger;
    const parameters: any = event.getParameters();
    this.planning_ID = parameters.arguments.id;
    this.bWritingTotalQuantityPlanning = await this.getWritingAppointment(
      this.planning_ID,
    );
    await this.loadPlanningFragment(this.sCurrentLevel);
    // Reset SegmentedButton to option
    const oSegBtn = this.byId("idPlanningLevelSegBtn") as SegmentedButton;
    oSegBtn?.setSelectedKey(this.sCurrentLevel);
    const oSmartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    // this.loadSmartTable();
    const objectPageLayout = this?.byId("objectPageLayout") as ObjectPageLayout;
    const bNavigateToSection1 = this._bNewPlanning;
    this._bNewPlanning = false;
    objectPageLayout.bindElement(`/Planning('${this.planning_ID}')`, {
      expand: "supplier,brand,consumerTopic,productionPlant,allocationMode",
    });
    if (bNavigateToSection1) {
      objectPageLayout
        .getElementBinding()
        ?.attachEventOnce("dataReceived", () => {
          setTimeout(() => {
            const sections = objectPageLayout.getSections();
            if (sections.length > 1) {
              objectPageLayout.setSelectedSection(sections[1].getId());
            }
          }, 0);
        });
    } else {
      const sections = objectPageLayout.getSections();
      objectPageLayout.setSelectedSection(sections[0].getId());
    }
    await this.loadBudgetKTData(this.planning_ID);

    oSmartTable.rebindTable(true);
    objectPageLayout.attachNavigate(this.onNavigate, this);

    if (!this.bBatchListenerAttached) {
      const oModel = this.getView()?.getModel() as ODataModel;
      if (oModel) {
        oModel.attachBatchRequestCompleted(async (oEvent: any) => {
          const requests = oEvent.getParameter("requests") || [];
          const hasWrite = requests.some(
            (r: any) =>
              r.method === "MERGE" ||
              r.method === "PUT" ||
              r.method === "PATCH" ||
              r.method === "POST",
          );

          if (!hasWrite || this.sCurrentLevel !== "variant") return;
          const oSmartTable = this.byId(
            this.sPlanningProductsSmartTable,
          ) as SmartTable;
          if (!oSmartTable) return;
          oModel.resetChanges();
          oSmartTable.rebindTable(true);
        });
        this.bBatchListenerAttached = true;
      }
    }
  }

  private async loadPlanningFragment(level: string): Promise<void> {
    const fragmentName = this.getFragmentName(level);
    const oContainer = this.getView()?.byId(
      "idPlanningProductsSmartTable",
    ) as VBox;

    if (this.sCurrentFragment !== fragmentName) {
      oContainer.destroyItems();
      const oFragment = await Fragment.load({
        id: this.getView()!.getId(),
        name: fragmentName,
        controller: this,
      });
      oContainer.addItem(oFragment as Control);
      this.sCurrentFragment = fragmentName;
    }

    this.assignValidId(level);
    this.loadSmartTable();

    const errorMessage = await this.loadBudgetData(this.planning_ID, true);
    const productsAvailable =
      level === "option"
        ? await this.getPlanningProducts(this.planning_ID)
        : await this.getPlanningProductSizes(this.planning_ID);
    const status = (this.byId("objectPageLayout") as ObjectPageLayout)
      .getBindingContext()
      ?.getProperty("status_ID");
    const budgetData = this.getView()?.getModel("budgetData") as JSONModel;
    budgetData?.refresh();
    if (
      productsAvailable.length === 0 &&
      status === "InProgress" &&
      !!budgetData?.getProperty("/houseGroupBudgets") &&
      level === "option"
    ) {
      this.openSelectProductsDialog(this.planning_ID);
    }
    if (!budgetData?.getProperty("/houseGroupBudgets")) {
      MessageBox.error(errorMessage || this.getText("planning.budgetHG.error"));
    }
    // this.byId("changeProductSelection")?.setVisible(level === "option");
  }

  private getFragmentName(level: string): string | undefined {
    if (level === "option") {
      return !this.bWritingTotalQuantityPlanning
        ? "com.valantic.preorder.planning.view.fragments.PlanningSmartTableWithHG"
        : "com.valantic.preorder.planning.view.fragments.PlanningSmartTableWithoutHG";
    } else if (level === "variant") {
      return !this.bWritingTotalQuantityPlanning
        ? "com.valantic.preorder.planning.view.fragments.PlanningSizesSmartTableWithHG"
        : "com.valantic.preorder.planning.view.fragments.PlanningSizesSmartTableWithoutHG";
    }
  }

  private assignValidId(level: string): void {
    if (level === "option") {
      this.sPlanningProductsSmartTable = !this.bWritingTotalQuantityPlanning
        ? "planningProductsSmartTable"
        : "planningProductsSmartTableWithoutHG";
      this.sAmountChange = !this.bWritingTotalQuantityPlanning
        ? "amountChange"
        : "amountChangeWithoutHG";
      this.sDeletePlanningProducts = !this.bWritingTotalQuantityPlanning
        ? "deletePlanningProducts"
        : "deletePlanningProductsWithoutHG";
      this.sHGShowHideButton = !this.bWritingTotalQuantityPlanning
        ? "showBudgetHG"
        : "showBudgetWithoutHG";
      this.sHouseGroupLabel = !this.bWritingTotalQuantityPlanning
        ? "houseGroupLabel"
        : "houseGroupLabelWithoutHG";
    } else if (level === "variant") {
      this.sPlanningProductsSmartTable = !this.bWritingTotalQuantityPlanning
        ? "planningProductSizesSmartTable"
        : "planningProductSizesSmartTableWithoutHG";
      this.sAmountChange = !this.bWritingTotalQuantityPlanning
        ? "amountChangePS"
        : "amountChangeWithoutHGPS";
      this.sDeletePlanningProducts = !this.bWritingTotalQuantityPlanning
        ? "deletePlanningProductsPS"
        : "deletePlanningProductsWithoutHGPS";
      this.sHGShowHideButton = !this.bWritingTotalQuantityPlanning
        ? "showBudgetHGPS"
        : "showBudgetWithoutHGPS";
      this.sHouseGroupLabel = !this.bWritingTotalQuantityPlanning
        ? "houseGroupLabelPS"
        : "houseGroupLabelWithoutHGPS";
    }
  }

  private loadSmartTable(): void {
    const oTable = (
      this.byId(this.sPlanningProductsSmartTable) as SmartTable
    )?.getTable() as Table;
    oTable.attachRowSelectionChange(() => {
      const selectedIndices = oTable.getSelectedIndices();
      const deleteButton = this.byId(this.sDeletePlanningProducts) as Button;
      const amountChangeButton = this.byId(this.sAmountChange) as Button;
      const status = (this.byId("objectPageLayout") as ObjectPageLayout)
        .getBindingContext()
        ?.getProperty("status_ID");
      const budgetData = this.getView()
        ?.getModel("budgetData")
        ?.getProperty("/houseGroupBudgets");
      if (deleteButton) {
        deleteButton.setEnabled(
          selectedIndices.length > 0 &&
            (status === "InProgress" || status === "CreationFailed") &&
            !!budgetData,
        );
      }
      if (amountChangeButton) {
        amountChangeButton.setEnabled(
          selectedIndices.length > 0 &&
            (status === "InProgress" || status === "CreationFailed") &&
            !!budgetData,
        );
      }
    });

    // Attach to SmartTable edit toggle event
    const oSmartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    oSmartTable?.attachEditToggled((event: any) => {
      const isEditable = event.getParameter("editable");
      this.editStateModel.setProperty("/editable", isEditable);
    });

    !this.bWritingTotalQuantityPlanning
      ? this.byId("generateDefaultPWithHG")?.setVisible(true)
      : this.byId("generateDefaultPWithHG")?.setVisible(false);
    !this.bWritingTotalQuantityPlanning
      ? this.byId("generateDefaultPWithoutHG")?.setVisible(true)
      : this.byId("generateDefaultPWithoutHG")?.setVisible(false);
    !this.bWritingTotalQuantityPlanning
      ? this.byId("generateDefaultPsWithHG")?.setVisible(true)
      : this.byId("generateDefaultPsWithHG")?.setVisible(false);
    !this.bWritingTotalQuantityPlanning
      ? this.byId("generateDefaultPsWithoutHG")?.setVisible(true)
      : this.byId("generateDefaultPsWithoutHG")?.setVisible(false);      
  }

  private async onNavigate(event: Event): Promise<void> {
    const section = event.getParameter("section") as sap.uxap.ObjectPageSection;
    const sectionTitle = section?.getTitle();

    // Check if navigating to size distribution tab
    if (sectionTitle === this.getText("sizeDistributionTab")) {
      await this.validateSizeDistribution();
    }
    if (sectionTitle === this.getText("planningTab")) {
      if (this.bChangesGeneralInfo) {
        this.bWritingTotalQuantityPlanning = await this.getWritingAppointment(
          this.planning_ID,
        );
        await this.loadPlanningFragment(this.sCurrentLevel);
        const oSmartTable = this.byId(
          this.sPlanningProductsSmartTable,
        ) as SmartTable;
        oSmartTable.rebindTable(true);
        this.bChangesGeneralInfo = false;
      }
    }
  }

  private async validateSizeDistribution(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;

    try {
      await new Promise<void>((resolve, reject) => {
        oModel.callFunction("/validateSizeDistribution", {
          urlParameters: {
            planning_ID: this.planning_ID,
          },
          success: () => {
            resolve();
          },
          error: (error: any) => {
            const errorMessage = error?.responseText
              ? JSON.parse(error.responseText)?.error?.message?.value
              : this.getText("planning.sizeDistribution.validation.error");
            MessageBox.error(errorMessage);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error("Error validating size distribution:", error);
    }
  }

  private async openSelectProductsDialog(planningId: string): Promise<void> {
    this._oCreatePlanningDialog = (await Fragment.load({
      id: this.getView()!.getId(),
      name: "com.valantic.preorder.planning.view.fragments.SelectProducts",
      controller: this,
    })) as Dialog;
    this.getView()?.addDependent(this._oCreatePlanningDialog);
    await this._setDefaultFilterValues(planningId);
    this._oCreatePlanningDialog.open();
  }

  public async onChangeModelValue(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const smartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    const planningSizeItemsTable = this.byId(
      "planningSizeItemsSmartTable",
    ) as SmartTable;
    try {
      oModel.submitChanges({
        success: (oData: any) => {
          MessageToast.show(this.getText("planning.updateSuccess"));
          if (
            oData.__batchResponses?.some(
              (r: any) => r.response?.statusCode >= 400,
            )
          ) {
            const errorResponse = oData.__batchResponses.find(
              (r: any) => r.response?.statusCode >= 400,
            );
            const errorBody = JSON.parse(errorResponse.response.body);
            const errorMessage = errorBody?.error?.message?.value;
            MessageBox.error(errorMessage);
            oModel.resetChanges();
            smartTable.rebindTable(true);
          } else {
            MessageToast.show(this.getText("planning.updateSuccess"));
            this.loadBudgetData(this.planning_ID);
            this.loadBudgetKTData(this.planning_ID);
            this.onDefaultBudgetTreeToggleOpenState(6);
            if (planningSizeItemsTable) {
              planningSizeItemsTable.rebindTable(true);
            }
          }
        },
        error: (oError: any) => {
          console.log("ERROR");
          MessageToast.show(this.getText("planning.updateError"));
        },
      });
    } catch (oError: any) {
      MessageToast.show(this.getText("planning.updateError"));
    }
  }
  private async _setDefaultFilterValues(planningId: string): Promise<void> {
    const filterBar = this.byId("productsSmartFilterBar") as SmartFilterBar;
    const response: any = await this.readOData(
      "/Planning(" + planningId + ")",
      {
        $select: "consumerTopic_ID,brand_ID,supplier_ID",
      },
    );
    if (filterBar) {
      const defaultFilterData = {
        consumerTopic_ID: response.consumerTopic_ID,
        brand_ID: response.brand_ID,
        supplier_ID: response.supplier_ID,
        name: response.name,
      };

      filterBar.setFilterData(defaultFilterData, true);
      filterBar.search();
    }
  }

  public onCancelSelectProducts(): void {
    if (this._oCreatePlanningDialog) {
      this._oCreatePlanningDialog.close();
      this._oCreatePlanningDialog.destroy();
      this._oCreatePlanningDialog = null as any;
    }
  }

  public changeProductSelection(): void {
    this.openSelectProductsDialog(this.planning_ID);
  }

  public onGenerateDefaultAmounts(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    oModel.create("/generateDefaultHGAmounts", {
      planning_ID: this.planning_ID,
    });
    const planningSizeItemsTable = this.byId(
      "planningSizeItemsSmartTable",
    ) as SmartTable;
    this.loadBudgetData(this.planning_ID);
    this.loadBudgetKTData(this.planning_ID);
    oModel.refresh();
    if (planningSizeItemsTable) {
      planningSizeItemsTable.rebindTable(true);
    }
  }

  public onDeleteSelectedProducts(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    const smartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    const planningSizeItemsTable = this.byId(
      "planningSizeItemsSmartTable",
    ) as SmartTable;
    const table = smartTable?.getTable() as Table;

    if (!table) {
      return;
    }

    const selectedIndices = table.getSelectedIndices();

    MessageBox.confirm(this.getText("deleteDescription"), {
      title: this.getText("deleteConfirmation"),
      onClose: (action: string) => {
        if (action === MessageBox.Action.OK) {
          const sGroupId = Math.random().toString(36).substring(2);
          const mParameters = {
            groupId: sGroupId,
          };
          oModel.setDeferredGroups([sGroupId]);
          selectedIndices.forEach((index) => {
            const context = table.getContextByIndex(index) as Context;
            oModel.remove(context.getPath(), { groupId: sGroupId });
          });
          oModel.submitChanges(mParameters);
          this.loadBudgetData(this.planning_ID);
          this.loadBudgetKTData(this.planning_ID);
          if (planningSizeItemsTable) {
            planningSizeItemsTable.rebindTable(true);
          }
        }
      },
    });
  }

  public onSelectProducts(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    const smartTable = this.byId("productsSmartTable") as SmartTable;
    const table = smartTable?.getTable() as Table;

    if (!table) {
      return;
    }

    const selectedIndices = table.getSelectedIndices();

    MessageBox.confirm(this.getText("addDescription"), {
      title: this.getText("addConfiromation"),
      onClose: (action: string) => {
        if (action === MessageBox.Action.OK) {
          const sGroupId = Math.random().toString(36).substring(2);
          oModel.setDeferredGroups([sGroupId]);
          selectedIndices.forEach((index) => {
            const context = table.getContextByIndex(index) as Context;
            console.log({
              planning_ID: this.planning_ID,
              product_ID: context.getProperty("ID"),
            });
            oModel.create(
              "/addPlanningProducts",
              {
                planning_ID: this.planning_ID,
                product_ID: context.getProperty("ID"),
              },
              { groupId: sGroupId },
            );
          });
          oModel.submitChanges({
            groupId: sGroupId,
            success: (oData: any) => {
              const errorResponse = oData.__batchResponses?.find(
                (r: any) => r.response?.statusCode >= 400,
              );
              if (errorResponse) {
                const errorBody = JSON.parse(errorResponse.response.body);
                const errorMessage = errorBody?.error?.message?.value;
                MessageBox.error(
                  errorMessage || this.getText("planning.addProducts.error"),
                );
                oModel.resetChanges();
              } else {
                this._oCreatePlanningDialog.close();
                this._oCreatePlanningDialog.destroy();
                this._oCreatePlanningDialog = null as any;
                const oSmartTable = this.byId(
                  this.sPlanningProductsSmartTable,
                ) as SmartTable;
                oSmartTable.rebindTable(true);
              }
            },
            error: (oError: any) => {
              const errorMessage = oError?.responseText
                ? JSON.parse(oError.responseText)?.error?.message?.value
                : this.getText("planning.addProducts.error");
              MessageBox.error(errorMessage);
            },
          });
        }
      },
    });
  }
  public async openAmountChangeDialog(planningId: string): Promise<void> {
    const productsAvailable = await this.getPlanningProducts(planningId);

    this._oAmountChangeDialog = (await Fragment.load({
      id: this.getView()!.getId(),
      name: "com.valantic.preorder.planning.view.fragments.AdjustAmount",
      controller: this,
    })) as Dialog;
    this.getView()?.addDependent(this._oAmountChangeDialog);
    this._oAmountChangeDialog.open();
    const adjustAmount = this.initAdjustAmountModel();
    this.getView()?.setModel(adjustAmount, "adjustAmount");
  }

  public onUnitSelectionChange(event: Event): void {
    const segmentedButton = event.getSource() as SegmentedButton;
    const selectedKey = segmentedButton.getSelectedKey();
    const viewModel = this.getView()?.getModel("adjustAmount") as JSONModel;

    if (viewModel) {
      switch (selectedKey) {
        case "percentage":
          viewModel.setData({
            ...viewModel.getData(),
            unitDescription: "%",
            placeholderText: "z.B., +15 oder -15",
            selectedUnit: "percentage",
          });
          break;
        case "direct":
          viewModel.setData({
            ...viewModel.getData(),
            unitDescription: "ST",
            placeholderText: "z.B., +100 oder -100",
            selectedUnit: "pieces",
          });
          break;
      }
    }
  }

  public onCancelAdjustAmount(): void {
    if (this._oAmountChangeDialog) {
      this._oAmountChangeDialog.close();
      this._oAmountChangeDialog.destroy();
      this._oAmountChangeDialog = null as any;
    }
  }

  public onConfirmAdjustAmount(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    const adjustAmountModel = this.getView()?.getModel(
      "adjustAmount",
    ) as JSONModel;
    const smartTable = this.byId(
      this.sPlanningProductsSmartTable,
    ) as SmartTable; //this.byId("planningProductsSmartTable") as SmartTable;
    const table = smartTable?.getTable() as Table;

    if (!table || !adjustAmountModel) {
      return;
    }

    const selectedIndices = table.getSelectedIndices();

    const adjustData = adjustAmountModel.getData();
    const isPercentageMode = adjustData.selectedUnit === "percentage";

    // Prepare batch operations
    const sGroupId = Math.random().toString(36).substring(2);
    oModel.setDeferredGroups([sGroupId]);

    selectedIndices.forEach((index) => {
      const context = table.getContextByIndex(index) as Context;
      const bindingPath = context.getPath();

      // Get current values for each house group
      const newValues: any = {};
      const currentData = context.getObject() as any;
      const overallAmount = parseInt(adjustData.overallAmount);
      if (adjustData.overallPercentageToggle) {
        if (isPercentageMode) {
          if (!this.bWritingTotalQuantityPlanning) {
            for (let i = 1; i <= 15; i++) {
              const houseGroup = `houseGroup${i}`;
              if (currentData[houseGroup] != null) {
                newValues[houseGroup] = Math.round(
                  (currentData[houseGroup] ?? 0) * (1 + overallAmount / 100),
                );
              }
            }
          } else {
            newValues['totalAmount'] = Math.round(
              (currentData['totalAmount'] ?? 0) * (1 + overallAmount / 100),
            );
          }
          oModel.update(`${bindingPath}`, newValues, { groupId: sGroupId });
        } else {
          const targetTotal = Math.max(
            0,
            (currentData["totalAmount"] ?? 0) + overallAmount,
          );
          this.sCurrentLevel === "option"
            ? oModel.callFunction("/PlanningProducts_updateTotalAmount", {
                method: "POST",
                urlParameters: {
                  totalAmount: targetTotal,
                  product_ID: currentData.product_ID,
                  writingAppointment_ID: currentData.writingAppointment_ID,
                },
                groupId: sGroupId,
              })
            : oModel.callFunction("/PlanningProductSizes_updateTotalAmount", {
                method: "POST",
                urlParameters: {
                  totalAmount: targetTotal,
                  productSize_ID: currentData.productSize_ID,
                  writingAppointment_ID: currentData.writingAppointment_ID,
                },
                groupId: sGroupId,
              });
        }
      } else {
        if (!this.bWritingTotalQuantityPlanning) {
          for (let i = 1; i <= 15; i++) {
            const houseGroup = `houseGroup${i}`;
            const newValue = parseInt(adjustData[houseGroup]);
            if (adjustData[houseGroup] != null) {
              if (isPercentageMode) {
                newValues[houseGroup] = Math.round(
                  (currentData[houseGroup] ?? 0) * (1 + newValue / 100),
                );
              } else {
                // Piece mode - add/subtract the amount
                const currentAmount = currentData[houseGroup] ?? 0;
                newValues[houseGroup] = Math.max(0, currentAmount + newValue);
              }
            }
          } 
        } else {
          const newValue = parseInt(adjustData['totalAmount']);
          if (adjustData['totalAmount'] != null) {
            if (isPercentageMode) {
              newValues['totalAmount'] = Math.round(
                (currentData['totalAmount'] ?? 0) * (1 + newValue / 100),
              );
            } else {
              // Piece mode - add/subtract the amount
              const currentAmount = currentData['totalAmount'] ?? 0;
              newValues['totalAmount'] = Math.max(0, currentAmount + newValue);
            }
          }
        }
        oModel.update(`${bindingPath}`, newValues, { groupId: sGroupId });
      }
    });

    // Submit all changes
    oModel.submitChanges({
      groupId: sGroupId,
      success: (response: any) => {
        const errorResponse = response.__batchResponses.find((r: any) => r.response?.statusCode >= 400);
        if (errorResponse) {
          const errorBody = JSON.parse(errorResponse?.response?.body);
          const errorMessage = errorBody?.error?.message?.value;
          MessageBox.error(errorMessage);
        } else {
          MessageToast.show(this.getText("adjustAmount.success")); 
        }
        this.loadBudgetData(this.planning_ID);
        this.loadBudgetKTData(this.planning_ID);
        this.onCancelAdjustAmount();
        (this.byId(this.sPlanningProductsSmartTable) as SmartTable).rebindTable(
          true,
        );
        (this.byId(this.sDeletePlanningProducts) as Button).setEnabled(false);
        (this.byId(this.sAmountChange) as Button).setEnabled(false);
        // (this.byId("planningProductsSmartTable") as SmartTable).rebindTable(
        //   true
        // );
        // (this.byId("deletePlanningProducts") as Button).setEnabled(false);
        // (this.byId("amountChange") as Button).setEnabled(false);
      },
      error: (error: any) => {
        MessageToast.show(this.getText("adjustAmount.error"));
      },
    });
  }
  private async loadBudgetData(
    planningId: string,
    initailload?: boolean,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const oModel = this.getView()?.getModel() as ODataModel;

        oModel.callFunction("/getBudgetHG", {
          urlParameters: {
            planning_ID: planningId,
          },
          success: async (data: any) => {
            // Create JSON model for budget data
            const budgetModel = new JSONModel(data.getBudgetHG);
            this.getView()?.setModel(budgetModel, "budgetData");
            this.getView()?.getModel("budgetData")?.refresh();
            if (!initailload) {
              this.refreshHGHeader(this.getView()?.getModel("budgetData"));
            }
            resolve("");
          },
          error: (error: any) => {
            this.getView()?.setModel(
              new JSONModel({
                houseGroupBudgets: null,
                overallBudget: {
                  houseCount: null,
                  plannedPurchaseLimit: null,
                  overallCosts: null,
                  remainingBudget: null,
                  remainingBudgetRatio: null,
                  productCountPerColor: null,
                  overallProductCount: null,
                },
              }),
              "budgetData",
            );
            console.error("Error loading budget data:", error);
            resolve(
              error?.responseText
                ? JSON.parse(error.responseText)?.error?.message?.value
                : this.getText("planning.budgetHG.error"),
            );
          },
        });
      } catch (error) {
        console.error("Error calling getBudgetHG function:", error);
        reject(error);
      }
    });
  }

  formatStatusState(status: string): string {
    switch (status) {
      case "InProgress":
        return "Information";
      case "ToCheck":
        return "Warning";
      case "RequestedToSAP":
        return "Information";
      case "CreationFailed":
        return "Error";
      case "CreatedInSAP":
        return "Success";
      case "MarkedForDeletion":
        return "Indication10";
      default:
        return "None";
    }
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
      case "MarkedForDeletion":
        return "sap-icon://delete";
      default:
        return "None";
    }
  }

  async onRelease(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("objectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("No planning selected");
      return;
    }
    MessageBox.confirm(this.getText("release.confirmation"), {
      title: this.getText("release.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                planningPath,
                { status_ID: "ToCheck" },
                {
                  success: () => {
                    this.editStateModel.setProperty("/editable", false);
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
                },
              );
            });
          } catch (error) {
            console.error("Error in release process:", error);
          }
        }
      },
    });
  }

  async onInProgress(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("objectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("No planning selected");
      return;
    }
    MessageBox.confirm(this.getText("inProgress.confirmation"), {
      title: this.getText("inProgress.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                planningPath,
                { status_ID: "InProgress" },
                {
                  success: () => {
                    MessageToast.show(this.getText("inProgress.success"));
                    oModel.refresh();
                    resolve();
                  },
                  error: (error: any) => {
                    const errorMessage = error?.responseText
                      ? JSON.parse(error.responseText)?.error?.message?.value
                      : this.getText("inProgress.error");
                    MessageBox.error(errorMessage);
                    console.error("Error releasing planning:", error);
                    reject(error);
                  },
                },
              );
            });
          } catch (error) {
            console.error("Error in release process:", error);
          }
        }
      },
    });
  }

  public async onConfirmSAPCreation(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("objectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("No planning selected");
      return;
    }
    MessageBox.confirm(this.getText("sapCreation.confirmation"), {
      title: this.getText("sapCreation.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                planningPath,
                {
                  status_ID: "CreatedInSAP",
                },
                {
                  success: () => {
                    MessageToast.show(this.getText("sapCreation.success"));
                    const oSmartTable = this.byId(
                      this.sPlanningProductsSmartTable,
                    ) as SmartTable;
                    oSmartTable?.setEditable(false);
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
                },
              );
            });
          } catch (error) {
            console.error("Error in SAP creation process:", error);
          }
        }
      },
    });
  }
  async onValidate(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    oModel.callFunction("/validatePlanning", {
      method: "GET",
      urlParameters: {
        planning_ID: String(this.planning_ID).trim(),
      },
      success: async (data: any) => {
        MessageBox.success(this.getText("planning.validate.success"));
        const planningSizeItemsTable = this.byId(
          "planningSizeItemsSmartTable",
        ) as SmartTable;
        const orderItemTable = this.byId(
          "sapOrderItemsSmartTable",
        ) as SmartTable;
        if (planningSizeItemsTable) {
          planningSizeItemsTable.rebindTable(true);
        }
        orderItemTable.rebindTable(true);
      },
      error: (error: any) => {
        console.error("Error loading budget data:", error);
        const errorMessage = error?.responseText
          ? JSON.parse(error.responseText)?.error?.message?.value
          : this.getText("planning.validate.error");
        MessageBox.error(errorMessage);
      },
    });
  }

  async onArchive(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("objectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("No planning selected");
      return;
    }
    MessageBox.confirm(this.getText("archive.confirmation"), {
      title: this.getText("archive.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.remove(planningPath, {
                success: () => {
                  MessageToast.show(this.getText("archive.success"));
                  this.getRouter().navTo("RouteMain");
                  resolve();
                },
                error: (error: any) => {
                  const errorMessage = error?.responseText
                    ? JSON.parse(error.responseText)?.error?.message?.value
                    : this.getText("archive.error");
                  MessageBox.error(errorMessage);
                  reject(error);
                },
              });
            });
          } catch (error) {
            console.error("Error archiving planning:", error);
          }
        }
      },
    });
  }

  async onMarkForDeletion(): Promise<void> {
    const oModel = this.getView()?.getModel() as ODataModel;
    const objectPageLayout = this.byId("objectPageLayout") as ObjectPageLayout;
    const bindingContext = objectPageLayout.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("No planning selected");
      return;
    }
    MessageBox.confirm(this.getText("deletion.confirmation"), {
      title: this.getText("deletion.title"),
      onClose: async (action: string) => {
        if (action === MessageBox.Action.OK) {
          try {
            const planningPath = bindingContext.getPath();

            await new Promise<void>((resolve, reject) => {
              oModel.update(
                planningPath,
                { status_ID: "MarkedForDeletion" },
                {
                  success: () => {
                    MessageToast.show(this.getText("deletion.success"));
                    oModel.refresh();
                    resolve();
                  },
                  error: (error: any) => {
                    const errorMessage = error?.responseText
                      ? JSON.parse(error.responseText)?.error?.message?.value
                      : this.getText("deletion.error");
                    MessageBox.error(errorMessage);
                    console.error(
                      "Error marking planning for deletion:",
                      error,
                    );
                    reject(error);
                  },
                },
              );
            });
          } catch (error) {
            console.error("Error in deletion process:", error);
          }
        }
      },
    });
  }

  public onEditGeneralInfo(): void {
    this.editStateModel.setProperty("/editable", true);
  }

  public onSaveGeneralInfo(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    oModel.submitChanges({
      success: () => {
        MessageToast.show(this.getText("planning.updateSuccess"));
        this.editStateModel.setProperty("/editable", false);
        this.bChangesGeneralInfo = true;
        const planningProductTable = this.byId(
          this.sPlanningProductsSmartTable,
        ) as SmartTable;
        planningProductTable.rebindTable(true);
      },
      error: (error: any) => {
        const errorMessage = error?.responseText
          ? JSON.parse(error.responseText)?.error?.message?.value
          : this.getText("planning.updateError");
        MessageBox.error(errorMessage);
      },
    });
  }

  public onCancelGeneralInfo(): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    oModel.resetChanges();
    this.editStateModel.setProperty("/editable", false);
  }

  private async loadBudgetKTData(planningId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const oModel = this.getView()?.getModel() as ODataModel;

        oModel.callFunction("/getBudgetKT", {
          urlParameters: {
            planning_ID: planningId,
          },
          success: (data: any) => {
            // Create JSON model for Budget KT data
            const budgetKTModel = new JSONModel(data.getBudgetKT);
            this.getView()?.setModel(budgetKTModel, "budgetKT");
            resolve();
          },
          error: (error: any) => {
            console.error("Error loading Budget KT data:", error);
            const errorMessage = error?.responseText
              ? JSON.parse(error.responseText)?.error?.message?.value
              : this.getText("planning.budgetKT.error");
            MessageBox.error(errorMessage);
            // Set empty model on error
            this.getView()?.setModel(
              new JSONModel({
                months: [],
                accounts: [],
              }),
              "budgetKT",
            );
            reject(error);
          },
        });
      } catch (error) {
        console.error("Error calling getBudgetKT function:", error);
        reject(error);
      }
    });
  }
  public getBudgetKTAccountText(account: string) {
    return this.getText(`budgetKT.${account}`);
  }

  public async onPlanningListChange(oEvent: any): Promise<void> {
    const oItem = oEvent.getParameter("item");
    const selectedKey = oItem.getKey();
    const oModel = this.getView()?.getModel() as ODataModel;
    let actionName: string = "";

    if (selectedKey === "option") {
      actionName = "/updateProductsSizeKey";
    } else if (selectedKey === "variant") {
      actionName = "/validateProductSizesDistribution";
    }

    try {
      await new Promise<any>((resolve, reject) => {
        oModel.callFunction(actionName, {
          method: "POST",
          urlParameters: {
            planning_ID: this.planning_ID,
          },
          success: async () => {
            this.sCurrentLevel = selectedKey;
            await this.loadPlanningFragment(selectedKey);
            resolve("");
          },
          error: (error: any) => {
            const errorMessage = error?.responseText
              ? JSON.parse(error.responseText)?.error?.message?.value
              : this.getText(
                  "planning.productSize.sizeDistribution.update.error",
                );
            MessageBox.error(errorMessage);
            reject(error);
          },
        });
      });
      await this.loadBudgetData(this.planning_ID);
    } catch (error) {
      console.log("Error updating product sizes distribution:", error);
    }
  }

  public formatColumnHeader(month: string, year: string): string {
    if (!month || !year) return "";
    return this.getText(`budgetKT.month.${month}`) + " " + year;
  }

  public formatBudgetNumber(num: number): string {
    return Number(num).toLocaleString("de-DE", {
      maximumFractionDigits: 0,
    });
  }

  public getDateAccountText(month: string) {
    return this.getText(`budgetKT.month.${month}`) + 2025;
  }

  public formatBudgetValue(value: any, label: string): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (
      label &&
      (label === "BUDGET" || label === "COSTS" || label === "REMAININGBUDGET")
    ) {
      return this.formatBudgetNumber(value) + "€";
    } else if (label && label === "REMAININGBUDGETRATIO") {
      return value + "%";
    } else if (label && label === "OVERALLPRODUCTS") {
      return this.formatBudgetNumber(value);
    }

    return value.toString();
  }

  public onHouseGroupSelectionChange(event: Event): void {
    const oModel = this.getView()?.getModel() as ODataModel;
    const multiComboBox = event.getSource() as MultiComboBox;
    const selectedKeys = multiComboBox.getSelectedKeys();
    const bindingContext = multiComboBox.getBindingContext();

    if (!bindingContext) {
      MessageToast.show("No context available");
      return;
    }

    const productId = bindingContext.getProperty("product_ID");
    const writingAppointmentId = bindingContext.getProperty(
      "writingAppointment_ID",
    );

    // Get existing entries
    const existingPath = `/PlanningProducts(product_ID='${productId}',writingAppointment_ID='${writingAppointmentId}')/differingHouseGroups`;

    oModel.read(existingPath, {
      success: (data: any) => {
        const existingHouseGroups = data.results || [];
        const existingKeys = existingHouseGroups.map(
          (hg: any) => hg.houseGroup_ID,
        );

        // Determine which to delete and which to create
        const toDelete = existingKeys.filter(
          (key: string) => !selectedKeys.includes(key),
        );
        const toCreate = selectedKeys.filter(
          (key: string) => !existingKeys.includes(key),
        );

        // Delete removed house groups
        toDelete.forEach((houseGroupId: string) => {
          const deletePath = `/PlanningProducts_differingHouseGroups(up__product_ID='${productId}',up__writingAppointment_ID='${writingAppointmentId}',houseGroup_ID='${houseGroupId}')`;
          oModel.remove(deletePath);
        });

        // Create new house groups
        toCreate.forEach((houseGroupId: string) => {
          oModel.create("/PlanningProducts_differingHouseGroups", {
            up__product_ID: productId,
            up__writingAppointment_ID: writingAppointmentId,
            houseGroup_ID: houseGroupId,
          });
        });

        // Submit all changes
        oModel.submitChanges({
          success: () => {
            MessageToast.show(this.getText("houseGroups.updateSuccess"));
            this.loadBudgetData(this.planning_ID);
            this.loadBudgetKTData(this.planning_ID);
          },
          error: (error: any) => {
            const errorMessage = error?.responseText
              ? JSON.parse(error.responseText)?.error?.message?.value
              : this.getText("houseGroups.updateError");
            MessageBox.error(errorMessage);
            oModel.resetChanges();
          },
        });
      },
      error: (error: any) => {
        MessageBox.error(this.getText("houseGroups.readError"));
      },
    });
  }

  public formatDifferingHouseGroups(differingHouseGroups: string[]): string[] {
    if (!differingHouseGroups) {
      return [];
    }
    const oModel = this.getView()?.getModel() as ODataModel;
    const resolvedIds: string[] = [];

    differingHouseGroups.forEach((path: string) => {
      const data = oModel.getProperty("/" + path);
      if (data && data.houseGroup_ID) {
        resolvedIds.push(data.houseGroup_ID);
      }
    });

    return resolvedIds;
  }

  public onBudgetTreeToggleOpenState(event: any): void {
    const budgetTreeTable = this.byId("budgetTreeTable") as TreeTable;
    const oBinding = budgetTreeTable.getBinding("rows");
    const oRowMode = this.byId("budgetTreeRowMode") as any;
    if (!oBinding || !oRowMode) return;
    const rowCount = oBinding.getLength();
    oRowMode.setRowCount(Math.max(rowCount, 6));
  }

  private onDefaultBudgetTreeToggleOpenState(defaultRowCount: number): void {
    const budgetTreeTable = this.byId("budgetTreeTable") as TreeTable;
    const oBinding = budgetTreeTable.getBinding("rows");
    const oRowMode = this.byId("budgetTreeRowMode") as any;
    if (!oBinding || !oRowMode) return;
    oRowMode.setRowCount(defaultRowCount);
  }
}
