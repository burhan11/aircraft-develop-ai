import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController.controller";
import Event from "sap/ui/base/Event";
import { entityName, ModelName } from "../utils/constants";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace com.valantic.aviation.controller
 */
export default class Main extends BaseController {

  private _chatMessages: Array<any> = [];
  private _chatHistory: Array<any> = [];

  public onInit(): void {
    const oModel = this.getLocalModel(ModelName.viewModel);
    if (oModel && !oModel.getProperty("/selectedEntity")) {
      oModel.setProperty("/selectedEntity", entityName.Aircrafts);
    }
  };

  public onAfterRendering(): void {
    this._chatMessages = this.getLocalModel(ModelName.viewModel).getProperty(
      "/aircraft/chatMessages"
    ) || [];
  }

  public onEntityChange(event: Event): void {
    const selectedKey = (event.getSource() as any).getSelectedKey();
    const oModel = this.getLocalModel(ModelName.viewModel);
    oModel.setProperty("/selectedEntity", selectedKey);
    oModel.setProperty("/aircraft/formData", {});
    oModel.setProperty("/aircraft/chatMessages", []);
    this._chatMessages = [];
    this._chatHistory = [];
    MessageToast.show(`Switched object context to ${selectedKey}`);
  };

  public async onSendCopilotMessage(): Promise<void> {
    const userPrompt = (this.byId("chatInputField") as any)?.getValue();
    if (!userPrompt || userPrompt.trim().length === 0) return;

    const newUserPrompt = {
      "userType": "user",
      "message": userPrompt,
      "hasSuggestion": false,
      "suggestions": []
    };
    this._chatMessages.push(newUserPrompt);
    this.getLocalModel(ModelName.viewModel).setProperty(
      "/aircraft/chatMessages",
      this._chatMessages
    );
    (this.byId("chatInputField") as any)?.setValue("");
    await this.getAIResponse(userPrompt);
  };

  public async getAIResponse(prompt: string): Promise<void> {
    const chatHistory = JSON.stringify(this._chatHistory);
    const selectedEntity = this.getLocalModel(ModelName.viewModel).getProperty("/selectedEntity") || entityName.Aircrafts;

    const responseModel: any = await this.processChatInput(
      "/processGenericInput",
      { userPrompt: prompt, entityName: selectedEntity, chatHistory: chatHistory }
    );
    const response = JSON.parse(responseModel.processGenericInput);

    if (response.extracted && Object.keys(response.extracted).length > 0) {
      const currentForm = this.getLocalModel(ModelName.viewModel).getProperty("/aircraft/formData") || {};
      this.getLocalModel(ModelName.viewModel).setProperty(
        "/aircraft/formData",
        { ...currentForm, ...response.extracted }
      );
    }

    if (response.changes && Object.keys(response.changes).length > 0) {
      const currentForm = this.getLocalModel(ModelName.viewModel).getProperty("/aircraft/formData") || {};
      this.getLocalModel(ModelName.viewModel).setProperty(
        "/aircraft/formData",
        { ...currentForm, ...response.changes }
      );
    }

    const suggestions = response.suggestions || {};
    const newAIResponse = {
      "userType": "AI",
      "message": response.message || "Processed prompt.",
      "hasSuggestion": Object.keys(suggestions).length > 0,
      "suggestions": Object.entries(suggestions).map(([key, value]) => {
        return { "fieldName": key, "value": value };
      })
    };

    this._chatMessages.push(newAIResponse);
    this.getLocalModel(ModelName.viewModel).setProperty(
      "/aircraft/chatMessages",
      this._chatMessages
    );
    this.updateChatHistory(prompt, responseModel.processGenericInput);
  };

  public onAcceptSuggestions(event: Event): void {
    const oBindingContext = (event.getSource() as any).getBindingContext(ModelName.viewModel);
    const sPath = oBindingContext.getPath();
    const oClickedData = oBindingContext.getObject();
    const filledFormData = this.getLocalModel(ModelName.viewModel).getProperty(
      "/aircraft/formData"
    ) || {};
    const addToFormData = {
      ...filledFormData,
      [oClickedData.fieldName]: oClickedData.value
    };
    this.getLocalModel(ModelName.viewModel).setProperty(
      "/aircraft/formData",
      addToFormData
    );
    this.removeSuggestedItem(oBindingContext, sPath);
  };

  public onRejectSuggestions(event: Event): void {
    const oBindingContext = (event.getSource() as any).getBindingContext(ModelName.viewModel);
    const sPath = oBindingContext.getPath();
    this.removeSuggestedItem(oBindingContext, sPath);
  };

  public removeSuggestedItem(oBindingContext: any, sPath: string): void {
    const oModel = oBindingContext.getModel();
    const iIndexToRemove = parseInt(sPath.split("/").pop());
    const sParentArrayPath = sPath.substring(0, sPath.lastIndexOf("/"));
    const aSuggestions = oModel.getProperty(sParentArrayPath);
    aSuggestions.splice(iIndexToRemove, 1);
    oModel.setProperty(sParentArrayPath, aSuggestions);
    oModel.refresh();
  };

  public updateChatHistory(userPrompt: string, AIResponse: string): void {
    this._chatHistory.push(
      { role: 'user', content: userPrompt },
      { role: 'AI', content: AIResponse }
    );
  };

  public formatSuggestionText(fieldname: string, value: any): string {
    return `Suggested value for ${fieldname}: ${value}`;
  };
}