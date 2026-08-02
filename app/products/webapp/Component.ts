import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import { ModelNames } from "./utils/enums/ModelNames";
import ViewModels from "./model/View/ViewModels";
import ViewModelsArticle from "./model/View/ViewModelsArticle";
import ViewModelsVariant from "./model/View/ViewModelsVariant";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.valantic.preorder.products
 */
export default class Component extends BaseComponent {

    public static metadata = {
        manifest: "json",
        interfaces: [
            "sap.ui.core.IAsyncContentCreation"
        ]
    };

    public init(): void {
        // call the base component's init function
        super.init();

        // set the device model
        this.setModel(createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();



        var viewModel = this.getModel(ModelNames.ViewModel);
        if (!viewModel) {
            viewModel = new JSONModel(new ViewModels());
            viewModel.setSizeLimit(99999);
            this.setModel(viewModel, ModelNames.ViewModel);
        } else {
            viewModel.refresh();
        }

        var viewModelArticle = this.getModel(ModelNames.ViewModelArticle);
        if (!viewModelArticle) {
            viewModelArticle = new JSONModel(new ViewModelsArticle());
            viewModelArticle.setSizeLimit(99999);
            this.setModel(viewModelArticle, ModelNames.ViewModelArticle);
        } else {
            viewModelArticle.refresh();
        }

        var viewModelVariant = this.getModel(ModelNames.ViewModelVariant);
        if (!viewModelVariant) {
            viewModelVariant = new JSONModel(new ViewModelsVariant());
            viewModelVariant.setSizeLimit(99999);
            this.setModel(viewModelVariant, ModelNames.ViewModelVariant);
        } else {
            viewModelVariant.refresh();
        }
    }
}