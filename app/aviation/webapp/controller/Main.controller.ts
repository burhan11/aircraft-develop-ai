import JSONModel from "sap/ui/model/json/JSONModel"
import BaseController from "./BaseController.controller";
import Event from "/sap/ui/base/Event";

/**
 * @namespace com.valantic.aviation.controller
 */
export default class Main extends BaseController {

  public onInit(): void {

  };

  public async onSendCopilotMessage(): Promise<void> {
    const userPrompt = this.byId("chatInputField")?.getValue();
    const chatMessages = this.getLocalModel("copilotModel").getProperty(
      "/aircraft/chatMessages",
    );
    const newUserChat = {
      "userType": "user",
      "message": userPrompt,
      "hasSuggestion": false,
      "suggestions": []
    }
    chatMessages.push(newUserChat);
    this.getLocalModel("copilotModel").setProperty(
      "/aircraft/chatMessages",
      chatMessages
    );
    // const response = await this.processChatInput(
    //     "/processGenericInput", 
    //     { userPrompt: userPrompt, entityName: "Aircrafts" }
    // );
    const tempModel = new JSONModel(
      {
        "extracted": {
          "Model": "A380",
          "Capacity": 200,
          "Range": 7000
        },
        "suggestions": {
          "Manufacturer": "Airbus",
          "EngineType": "Piston engines",
          "Wingspan": "79.75 meters"
        },
        "message": "Succesfuly processed."
      }
    );
    const extractedData = tempModel.getData().extracted;
    this.getLocalModel("copilotModel").setProperty(
      "/aircraft/formData",
      extractedData
    );
    const suggestionData = tempModel.getData().suggestions;
    const message = tempModel.getData().message;
    const newAIChat = {
      "userType": "AI",
      "message": message,
      "hasSuggestion": Object.keys(suggestionData).length > 0,
      "suggestions": Object.entries(suggestionData)
        .map(([key, value]) => {
          return { "fieldName": key, "value": value }
        })
    }
    chatMessages.push(newAIChat);
    this.getLocalModel("copilotModel").setProperty(
      "/aircraft/chatMessages",
      chatMessages
    );
    this.byId("chatInputField").setValue("");
  };

  public onAcceptSuggestions(event: Event): void {
    const oBindingContext = event.getSource().getBindingContext("copilotModel");
    const sPath = oBindingContext.getPath();     // Gives a path like "/chatMessages/0/suggestions/1"
    const oClickedData = oBindingContext.getObject();
    const filledFormData = this.getLocalModel("copilotModel").getProperty(
      "/aircraft/formData"
    );
    const fieldName = oClickedData.fieldName;
    const value = oClickedData.value;
    const addToFormData = {
      ...filledFormData,
      [fieldName]: value
    }
    this.getLocalModel("copilotModel").setProperty(
      "/aircraft/formData",
      addToFormData
    );
    this.removeSuggestedItem(oBindingContext, sPath);
  };

  public onRejectSuggestions(event: Event): void {
    var oBindingContext = event.getSource().getBindingContext("copilotModel");
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

  formatSuggestionText(fieldname: string, value: any): string {
    return `Suggested value for ${fieldname}: ${value}`;
  };
}