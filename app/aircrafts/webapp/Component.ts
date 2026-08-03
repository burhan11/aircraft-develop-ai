import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import detailViewModel from "./model/view/detailViewModel";
import { ModelNames } from "./utils/enums/ModelNames";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.valantic.aircrafts
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

        var viewModel = this.getModel(ModelNames.detailViewModel);
        if(!viewModel) {
            const viewModel = new JSONModel(new detailViewModel());
            viewModel.setSizeLimit(9999);
            this.setModel(viewModel, ModelNames.detailViewModel);
        } else {
            viewModel.refresh();
        }
	}
}