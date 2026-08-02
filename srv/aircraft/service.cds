using { com.valantic.schema.aircraft } from '../../db/aircraft/schema';

service AircraftService {
    entity Aeroplanes as projection on aircraft.Aeroplanes 
        actions {
            action generateAeroplaneData() returns Aeroplanes;
        };
}
