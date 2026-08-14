namespace com.valantic.schema.aviation;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Aircrafts : cuid, managed {
    Manufacturer : String(100);
    Model        : String(50);
    Capacity     : Integer;
    Range        : Integer;
    EngineType   : String(100);
    Wingspan     : String(30);
}

entity Suppliers : cuid, managed {
    SupplierName : String(100);
    Country      : String(50);
    TaxId        : String(30);
    PaymentTerms : String(50);
    ContactEmail : String(100);
}
