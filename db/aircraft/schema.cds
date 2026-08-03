namespace com.valantic.schema.aircraft;

using {
  cuid,
  managed
} from '@sap/cds/common';


entity Aeroplanes : cuid, managed {
  model        : String(100);
  manufacturer : String(100);
  category     : String(50);
  capacity     : Integer;
  range        : Integer;
  userPrompt   : String(1000);
  confidence   : Decimal(3, 2);
}
