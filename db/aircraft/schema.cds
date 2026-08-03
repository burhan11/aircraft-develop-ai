namespace com.valantic.schema.aircraft;

using {
  cuid,
  managed
} from '@sap/cds/common';


entity Aeroplanes : cuid, managed {
  model        : String(100); // e.g. "Boeing 737 MAX 8"
  manufacturer : String(100); // e.g. "Boeing"
  category     : String(50); // e.g. "Narrow-body Commercial Jet"
  capacity     : Integer; // passenger count, e.g. 178
  range        : Integer; // in km or nautical miles, e.g. 6570
  rawInput     : String;
  confidence   : Decimal(3, 2);
}
