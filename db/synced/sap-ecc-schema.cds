//@cds.persistence.exists
entity LFA1 {
    key ID              : String;
        NAME            : String;
        COUNTRY         : String;
        TRANSPORT_CHAIN : String;
        INCO1           : String;
}


//@cds.persistence.exists
entity WRF_BRANDS {
    key ID   : String;
        NAME : String;
}


//@cds.persistence.exists
entity WRF_CHARVAL {
    key CODE        : String;
        ATINN       : String;
        SRTPO       : String;
        ATNAM       : String;
        DESCRIPTION : String;
}

//@cds.persistence.exists
entity ZSTTA_ZIELGR_T {
    key ID   : String;
        NAME : String;
}

//@cds.persistence.exists
entity ZBMTA0081_SERIE {
    key ID : String;
}

//@cds.persistence.exists
entity ZSTTA_GROE_SYS {
    key ID   : String;
        NAME : String;
}

//@cds.persistence.exists
entity ZSTTA_MUSTER_T {
    key ID   : String;
        NAME : String;
}


//@cds.persistence.exists
entity ZSTTA_SONDERARTT {
    key ID   : String;
        NAME : String;
}

//@cds.persistence.exists
entity T6WFGT {
    key ID   : String;
        NAME : String;
}

//@cds.persistence.exists
entity T023T {
    key ID          : String;
        NAME        : String;
        DESCRIPTION : String;
}

//@cds.persistence.exists
entity PRICAT_K001 {
    key ID               : String;
        LIFNR            : String;
        UNIQUE_REFERENCE : String;
}

//@cds.persistence.exists
entity EINA {
    key ID    : String;
        LIFNR : String;
        IDNLF : String;
        INFNR : String;
}

//@cds.persistence.exists
entity MARA {
    key ID              : String;
        NAME            : String;
        TYPE            : String         @UI.Hidden;
        EAN             : String         @UI.Hidden;
        WLADG           : String         @UI.Hidden; //loading group
        ZZNH_ZERTNR     : String         @UI.Hidden; //sustainabilityCertificateNumber
        ZZNH_GSNR       : String         @UI.Hidden; //sustainabilitySealOfApproval
        ZZ9GRIDBOX      : String         @UI.Hidden; //gridBox
        ZZNH_ZERTI      : String         @UI.Hidden; //sustainabilityCertifier
        ZZNH_ANTEIL     : String         @UI.Hidden; //sustainabilityPortion
        ZZMUSTER        : String         @UI.Hidden; //pattern
        ETIAR           : String         @UI.Hidden;
        ETIFO           : String         @UI.Hidden;
        ZZZIELGRUPPE    : String         @UI.Hidden; //targetGroup
        ZZGROE_SYS      : String         @UI.Hidden; //sizeSystem
        ZZENDLZ         : String         @UI.Hidden; //endOfLifeCycle
        ZZUVP_TYP       : String         @UI.Hidden; //uvpType
        ZZUVP_PREIS     : Decimal(11, 2) @UI.Hidden; //uvpPrice
        ZZSONDERARTIKEL : String         @UI.Hidden; //specialProduct
        ZZLIFAB         : String         @UI.Hidden; //availableFrom
        ZZLIFBI         : String         @UI.Hidden; //availableUntil
        ZZHG_AKT        : String         @UI.Hidden; //houseGroup
        ZZFAZ_MERKMAL   : String         @UI.Hidden;
        SAISJ           : String         @UI.Hidden; //seasonYear
        COLOR           : String         @UI.Hidden;
        SIZE1           : String         @UI.Hidden; //size1
        SIZE2           : String         @UI.Hidden; //size2
        BRAND_ID        : String         @UI.Hidden;
        FIBER_CODE1     : String         @UI.Hidden; //material1
        FIBER_CODE2     : String         @UI.Hidden; //material2
        FIBER_CODE3     : String         @UI.Hidden; //material3
        FIBER_CODE4     : String         @UI.Hidden; //material4
        FIBER_CODE5     : String         @UI.Hidden; //material5
        FIBER_PART1     : String         @UI.Hidden; //portion1
        FIBER_PART2     : String         @UI.Hidden; //portion2
        FIBER_PART3     : String         @UI.Hidden; //portion3
        FIBER_PART4     : String         @UI.Hidden; //portion4
        FIBER_PART5     : String         @UI.Hidden; //portion5
        FASHGRD         : String         @UI.Hidden; //program
        ZZMARKE         : String         @UI.Hidden; //brand_id
        ZZSERIE         : String         @UI.Hidden; //series
        ZZMATNR_COLOR   : String         @UI.Hidden; //evaluationColor
        ZZMATNR_NAME    : String         @UI.Hidden; //supplierProductNumber
        WEKGR           : String         @UI.Hidden; //consumerTopic
        HIERNODE2       : String         @UI.Hidden;
        HIERNODE3       : String         @UI.Hidden;
        HIERNODE4       : String         @UI.Hidden;
        HIERNODE5       : String         @UI.Hidden;
        HIERNODE6       : String         @UI.Hidden;
        HIERNODE7       : String         @UI.Hidden;
        HIERNODE8       : String         @UI.Hidden;
        HIERNODE9       : String         @UI.Hidden;
        HIERNODE10      : String         @UI.Hidden;
        ZZMAXVAR        : String         @UI.Hidden;
        SATNR           : String         @UI.Hidden;
        MATKL           : String         @UI.Hidden;

}

//@cds.persistence.exists
entity PRICAT_K003 {
    key MANDT           : String;
    key PRINBR          : String;
    key EAN_UPC_ALTUNIT : String;
    key VALIDITY_UNIT   : String;
    key COND_QUALIFIER  : String;
    key COND_TYPE       : String;
        CONDITION_VALUE : Decimal;
        CURRENCY        : String;
    key EAN_UPC_BASE    : String;
    key VALIDITY_BASE   : String;
    key LANGU_ISO       : String;
    key CHARACTERISTIC  : String;
    key TEXTTYP         : String;
    key DESCRIPTION     : String;
    key TEXTLINE_NR     : String;
        INTERNAL_CHAR   : String;
        TRANSPORT       : String;
        MERKMALSTYP     : String;
        TEXT_LINE       : String;
        PROD_ID_SENDER  : String;
    key PRODUCTGROUP    : String;
        VALUE           : String;
        MAT_ID_SENDER   : String;
        CURRENCY_ISO    : String;
        COND_VALID_TO   : String;
        COND_VALID_FROM : String;
        CONDITION_UNIT  : String;
        SEASON          : String;
}

//@cds.persistence.exists
entity T161 {
    key BSART : String;
}

//@cds.persistence.exists
entity T001W {
    key WERKS       : String;
        NAME1       : String;
        KUNNR_NAME1 : String;
        KUNNR       : String;
}

//@cds.persistence.exists
entity T001L {
    key LGORT : String;
        LGOBE : String;
        RANK  : Integer;
}

//@cds.persistence.exists
entity ZSTTA_SUP_TYPE {
    key SUPPLY_TYPE  : String;
        BWVOR        : String;
        FPRFM_VZ     : String;
        FPRFM_FIL    : String;
        PRICAT_FPRFM : String;
        DESCRIPTION  : String;
}

//@cds.persistence.exists
entity EINE {
    key MANDT : String;
    key INFNR : String;
        EKORG : String;
        ESOKZ : String;
        WERKS : String;
        NETPR : String;
        PRDAT : String;
}

//@cds.persistence.exists
entity WRF_CCODES_REG {
    key CARE_TYPE        : String;
    key CARE_CODE_REGION : String;
        CARE_CODE_DESCR  : String;
}

//@cds.persistence.exists
entity ZSTTA_NH_GS_T {
    key GSNR      : String;
        GSNR_KTXT : String;
}

//@cds.persistence.exists
entity MATHIER_HIERNODE5_KT {
    key ID        : String;
        NAME      : String;
        DATE_FROM : String;
        HIERNODE4 : String;
        HIERNODE3 : String;
        HIERNODE2 : String;
        HIERNODE1 : String;
        DATE_TO   : String;
}

//@cds.persistence.exists
entity MATHIER_HIERNODE6_TBS {
    key ID        : String;
        NAME      : String;
        DATE_FROM : String;
        HIERNODE5 : String;
        HIERNODE4 : String;
        HIERNODE3 : String;
        HIERNODE2 : String;
        HIERNODE1 : String;
        DATE_TO   : String;
}

//@cds.persistence.exists
entity MATHIER_HIERNODE7_SBS {
    key ID        : String;
        NAME      : String;
        DATE_FROM : String;
        HIERNODE6 : String;
        HIERNODE5 : String;
        HIERNODE4 : String;
        HIERNODE3 : String;
        HIERNODE2 : String;
        HIERNODE1 : String;
        DATE_TO   : String;
}

//@cds.persistence.exists
entity WAKH {
    key AKTNR : String;
        AKART : String;
}

//@cds.persistence.exists
entity WRF_PSCD_TCHAINH {
    key TC_ID   : String;
        TC_NAME : String;
}

//@cds.persistence.exists
entity PRODUCTION_PLANT {
    key SUPPLIER        : String;
    key PRODUCTIONPLANT : String;
        NAME1           : String;
}
