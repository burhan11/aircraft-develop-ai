namespace com.valantic.preorder.common;

entity Suppliers {
    key ID              : String;
        name            : String;
        description     : String;
        country         : String(3) @title: 'Country Code';
        transportChain  : String;
        productionPlant : String;
}
