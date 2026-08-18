using {com.valantic.schema.aviation} from '../../db/aviation/schema';

service AviationService {

    entity Aircrafts as projection on aviation.Aircrafts;
    entity Suppliers as projection on aviation.Suppliers;

    // The generic AI action used by the chat fragment
    action processGenericInput(userPrompt: String, entityName: String, chatHistory: String) returns String;

}
