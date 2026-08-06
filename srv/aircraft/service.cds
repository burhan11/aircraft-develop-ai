using {com.valantic.schema.aircraft} from '../../db/aircraft/schema';

service AircraftService {
  entity Aeroplanes as projection on aircraft.Aeroplanes;

  function enrichAeroplaneData(userPrompt: String,
                               conversationHistory: String) returns array of Aeroplanes;
}
