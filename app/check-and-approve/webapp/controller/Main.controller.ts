import Button from "sap/m/Button";
import Select from "sap/m/Select";
import Table from "sap/m/Table";
import MessageBox from "sap/m/MessageBox";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Container from "sap/ushell/Container";

/**
 * @namespace com.valantic.preorder.checkandapprove.controller
 */
export default class Main extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public onBeforeRebindTable(oEvent: any): void | undefined {
        // Filter by type
        const oCustomSelect = this.byId("customSelect") as Select;
        var mBindingParams = oEvent.getParameter("bindingParams"),
            sRatingValue = oCustomSelect.getSelectedKey();
        if (sRatingValue && sRatingValue !== "Alle") {
            mBindingParams.filters.push(
                new Filter("entityType", FilterOperator.EQ, sRatingValue)
            );
        }
    }

    public async onItemPress(e: any): Promise<void> {
        const selectedItem = e.getSource().getBindingContext().getObject()
        const Navigation = await Container.getServiceAsync("Navigation");

        if (selectedItem.entityType === 'Auftrag') {
            await (Navigation as any).navigate({
                target: {
                    semanticObject: "Planning",
                    action: "display"
                },
                appSpecificRoute: `Details/${selectedItem.ID}`
            })
        } else if (selectedItem.entityType === 'Artikel') {
            await (Navigation as any).navigate({
                target: {
                    semanticObject: "Products",
                    action: "display"
                },
                appSpecificRoute: `ArticleDetails/${selectedItem.ID}`
            });
        } else if (selectedItem.entityType === 'Option') {
            await (Navigation as any).navigate({
                target: {
                    semanticObject: "Products",
                    action: "display"
                },
                appSpecificRoute: `ProdDetails/${selectedItem.ID}`
            });
        } else {
            await (Navigation as any).navigate({
                target: {
                    semanticObject: "Products",
                    action: "display"
                },
                appSpecificRoute: `VariantDetails/${selectedItem.ID}`
            });
        }
    }

    public onSelectionChange(e: any): void {
        const oSmartTable = this.byId("lineItemsTable") as Table;
        const aSelectedItems = oSmartTable?.getSelectedItems();
        const oApproveBtn = this.getView()?.byId("approveBtn") as Button;
        if (aSelectedItems.length > 0) {
            oApproveBtn.setEnabled(true);
        } else {
            oApproveBtn.setEnabled(false);
        }
    }

    public async onApprovePress(): Promise<void> {
        const oInnerTable = this.byId("lineItemsTable") as Table;
        const oSmartTable = this.byId("smartTable") as SmartTable
        const aSelectedItems = oInnerTable?.getSelectedItems();
        const oModel = this.getView()?.getModel() as ODataModel;
        for (const item of aSelectedItems) {
            const context = item?.getBindingContext()?.getObject() as any;
            oModel.callFunction("/approve", {
                method: "POST",
                urlParameters: {
                    entity: context?.entityType,
                    ID: context?.ID
                },
                success: (data: any) => {
                    oSmartTable.rebindTable(true);
                },
                error: (reject: any) => {
                    oSmartTable.rebindTable(true);
                    let errorText = "";
                    try {
                        const parsed = JSON.parse(reject.responseText);
                        errorText = parsed.error.message.value;
                    } catch (e) {
                        errorText = reject.responseText;
                    }
                    MessageBox.error(errorText);
                }
            });
        }
    }
}