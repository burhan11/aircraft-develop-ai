import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import copilotModel from "./model/copilotModel/copilotModel";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.valantic.aviation
 */
export default class Component extends BaseComponent {

	public static metadata = {
		manifest: "json",
        interfaces: [
            "sap.ui.core.IAsyncContentCreation"
        ]
	};

	public init() : void {
		// call the base component's init function
		super.init();

        // set the device model
        this.setModel(createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();

        var viewModel = this.getModel("copilotModel")
        if(!viewModel) {
            viewModel = new JSONModel(new copilotModel());
            viewModel.setSizeLimit(9999);
            this.setModel(viewModel, "copilotModel");
        } else {
            viewModel.refresh();
        }
	}
}