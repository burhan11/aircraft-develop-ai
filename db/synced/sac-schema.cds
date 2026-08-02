//@cds.persistence.exists
entity TB_SAC_HGR {
    key DATE              : String;
    key HAUSGRUPPE        : String;
    key KT                : String;
    key FILIALE           : String;
    key MARKE             : String;
    key HAUSGRUPPENRASTER : String;
        WE                : Decimal(31, 7);
}

//@cds.persistence.exists
entity TB_SAC_SIZE_PLAN {
    key VERSION        : String;
    key DATE           : String;
    key MATERIAL_GROUP : String;
    key TBS            : String;
    key KT             : String;
    key SIZE           : String;
    key BRAND          : String;
    key LOTSIZE        : String;
    key SIZE_RUN       : String;
    key SIZE_KEY       : String;
        AMOUNT         : Decimal(31, 2);
}

//@cds.persistence.exists
entity TB_SAC_BUDGET {
    key DATE    : String;
    key ACCOUNT : String;
    key KT      : String;
    key BRAND   : String;
    key WRAP    : String;
    key HG      : String;
    key HGR     : String;
        AMOUNT  : String;
}