import JSONModel from "sap/ui/model/json/JSONModel"
import BaseController from "./BaseController.controller";
import Event from "/sap/ui/base/Event";
import { entityName, ModelName } from "../utils/constants";

/**
 * @namespace com.valantic.aviation.controller
 */
export default class Main extends BaseController {

  private _chatMessages: Array<any> = [];
  private _chatHistory: Array<any> = [];

  public onInit(): void {

  };

  public onAfterRendering(): void {
    this._chatMessages = this.getLocalModel(ModelName.viewModel).getProperty(
      "/aircraft/chatMessages",
    );
  }

  public async onSendCopilotMessage(): Promise<void> {
    const userPrompt = this.byId("chatInputField")?.getValue();
    const newUserPrompt = {
      "userType": "user",
      "message": userPrompt,
      "hasSuggestion": false,
      "suggestions": []
    }
    this._chatMessages.push(newUserPrompt);
    this.getLocalModel(ModelName.viewModel).setProperty(
      "/aircraft/chatMessages",
      this._chatMessages
    );
    this.getAIResponse(userPrompt);
    this.byId("chatInputField").setValue("");
  };

  public async getAIResponse(prompt: string): Promise<void> {
    debugger;
    const chatHistory = JSON.stringify(this._chatHistory);
    const responseModel: any = await this.processChatInput(
      "/processGenericInput",
      { userPrompt: prompt, entityName: entityName.Aircrafts, chatHistory: chatHistory }
    );
    const response = JSON.parse(responseModel.processGenericInput);
    if (Object.keys(response.extracted).length > 0) {
      this.getLocalModel(ModelName.viewModel).setProperty(
        "/aircraft/formData",
        response.extracted
      );
    }
    const newAIResponse = {
      "userType": "AI",
      "message": response.message,
      "hasSuggestion": Object.keys(response.suggestions).length > 0,
      "suggestions": Object.entries(response.suggestions)
        .map(([key, value]) => {
          return { "fieldName": key, "value": value }
        })
    }
    this._chatMessages.push(newAIResponse);
    this.getLocalModel(ModelName.viewModel).setProperty(
      "/aircraft/chatMessages",
      this._chatMessages
    );
    this.updateChatHistory(prompt, responseModel.processGenericInput);
  }

  public onAcceptSuggestions(event: Event): void {
    const oBindingContext = event.getSource().getBindingContext(ModelName.viewModel);
    const sPath = oBindingContext.getPath();     // Gives a path like "/chatMessages/0/suggestions/1"
    const oClickedData = oBindingContext.getObject();
    const filledFormData = this.getLocalModel(ModelName.viewModel).getProperty(
      "/aircraft/formData"
    );
    const addToFormData = {
      ...filledFormData,
      [oClickedData.fieldName]: oClickedData.value
    }
    this.getLocalModel(ModelName.viewModel).setProperty(
      "/aircraft/formData",
      addToFormData
    );
    this.removeSuggestedItem(oBindingContext, sPath);
  };

  public onRejectSuggestions(event: Event): void {
    var oBindingContext = event.getSource().getBindingContext(ModelName.viewModel);
    var sPath = oBindingContext.getPath();     // Gives a path like "/chatMessages/0/suggestions/1"
    this.removeSuggestedItem(oBindingContext, sPath);
  };

  public removeSuggestedItem(oBindingContext: any, sPath: string): void {
    var oModel = oBindingContext.getModel();
    // Extract the index of the clicked item from the path (e.g., extraction of "1" from ".../suggestions/1")
    const iIndexToRemove = parseInt(sPath.split("/").pop()); // pop() remove + returns removed value
    // Get the parent suggestions array path by cutting off the index part
    const sParentArrayPath = sPath.substring(0, sPath.lastIndexOf("/"));
    // Fetch the actual array from the model
    const aSuggestions = oModel.getProperty(sParentArrayPath);
    // Remove the item from the JavaScript array
    aSuggestions.splice(iIndexToRemove, 1);
    oModel.setProperty(sParentArrayPath, aSuggestions);
    oModel.refresh();
  };

  public updateChatHistory(userPrompt: string, AIResponse: string): void {
    this._chatHistory.push(
      { role: 'user', content: userPrompt },
      { role: 'AI', content: AIResponse }
    )
  }

  formatSuggestionText(fieldname: string, value: any): string {
    return `Suggested value for ${fieldname}: ${value}`;
  };
}