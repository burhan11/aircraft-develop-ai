namespace com.valantic.preorder.writingAppointments;


using {
    cuid,
    managed
} from '@sap/cds/common';

using {com.valantic.preorder.common.helper.topic} from '../common/helper/topic';
using {com.valantic.preorder.common.helper.classification} from '../common/helper/classification';
using {com.valantic.preorder.common} from '../common/supplier';
using {com.valantic.preorder.product} from '../product/schema';
using {com.valantic.preorder.common.helper.logistic} from '../common/helper/logistic';
using {
    LFA1,
    MATHIER_HIERNODE5_KT,
    WRF_BRANDS,
    T001W,
    ZSTTA_SUP_TYPE,
    WAKH,
    PRODUCTION_PLANT,
    WRF_PSCD_TCHAINH

} from '../synced/sap-ecc-schema';
using {com.valantic.preorder.planning} from '../pre-order-volume-planning/schema';

@cds.autoexpose
entity PlanningStatus {
    key ID   : String enum {
            InProgress;
            ToCheck;
            RequestedToSAP;
            CreationFailed;
            CreatedInSAP;
            MarkedForDeletion;
        };
        name : localized String;
};

@cds.autoexpose
entity AllocationMode {
    key ID   : String enum {
            AutomaticAllocation;
            PlanningWithSimulation;
            ManualAllocation;
        };
        name : localized String;
};

entity WritingAppointments : cuid, managed {
    name              : String                                   @mandatory              @title  : 'Name';
    consumerTopic     : Association to one MATHIER_HIERNODE5_KT  @mandatory              @title  : 'Konsumententhema';
    brand             : Association to one WRF_BRANDS            @mandatory              @title  : 'Markennummer';
    supplier          : Association to one LFA1                  @mandatory              @title  : 'Lieferantennummer';
    date              : Date                                     @title: 'Bestellfrist';
    isArchived        : Boolean default false                    @title  : 'Archiviert'  @mandatory;
    purchaseVolume    : Decimal(15, 2);
    status            : Association to one PlanningStatus        @assert.integrity       @default: 'InProgress';
    sapHttpStatus     : Integer;
    sapHttpStatusText : String;
    sapStatus         : String;
    sapStatusText     : String;
    sapTransactionId  : String;
    sapOrderNumber    : String                                   @title: 'SAP Bestellnummer';
    productionPlant   : Association to one T001W                 @default: 'C/Y)'        @title  : 'Betriebsstätte VZ';
    allocationMode    : Association to one AllocationMode        @title: 'Automatische Allokation';
    orderReleaseText  : String;

    to_Products       : Association to many product.ProductsToWritingAppointments
                            on to_Products.writingAppointment = $self;
    to_SAPOrderItems  : Composition of many SAPOrderItems
                            on to_SAPOrderItems.writingAppointment = $self;
}

entity SAPOrderItems : managed {
    key writingAppointment  : Association to one WritingAppointments;
    key sapArticleNumber    : String;
    key shop                : String                                        @default: 'VZ';
        orderQuantity       : Integer;
        orderNumber         : String;
        allocationNumber    : String;
        ltVz                : Date;
        ltBranch            : Date;
        storageLocation     : Association to one logistic.StorageLocations  @title: 'Lagerort'         @assert.integrity;
        ownershipStatus     : Association to one logistic.OwnershipStatus   @title: 'Konsi-Steuerung'  @assert.integrity;
        supplyType          : Association to one ZSTTA_SUP_TYPE             @title: 'SupplyType'       @assert.integrity;
        documentType        : Association to one T161                       @title: 'Bestellart'       @assert.integrity;
        itemCategory        : Association to one T163                       @title: 'Positionstyp'     @assert.integrity;

        product             : Association to one product.Products           @assert.integrity;
        productSize         : Association to one product.ProductSizes
                                                                            @assert.integrity;

        incoTerm            : Association to one logistic.IncoTerms         @title: 'Incoterm'         @assert.integrity;
        productionPlant     : Association to one PRODUCTION_PLANT           @title  : 'Produktionsstätte';
        transportChain      : Association to one WRF_PSCD_TCHAINH           @title  : 'Transportkette';
        purchaseOrderText   : String                                        @title  : 'Bestelltext';
        countryOfProduction : String                                        @title  : 'Ursprungsland';
        actionNumber        : Association to one WAKH                       @title  : 'Aktionsnummer';
        splitRelevance      : String(1)                                     @title  : 'Aufteilerrelevanz-Kennzeichen';

}

entity T163 {
    key PSTYP : String;
}

entity T161 {
    key BSART : String;
        NAME  : String;
}

entity OrderTypeDetermination {
    key supplyType      : Association to one ZSTTA_SUP_TYPE           @title: 'Supply Type';
    key ownershipStatus : Association to one logistic.OwnershipStatus @title: 'Konsignation';
    key isAction        : Boolean                                     @title: 'Aktion';
        documentType    : Association to one T161                     @title: 'Bestellart';
        itemCategory    : Association to one T163                     @title: 'Positionstyp';
}

entity StorageLocationDetermination {
    key supplyType      : Association to one ZSTTA_SUP_TYPE            @title: 'SupplyType';
    key isAction        : Boolean                                      @title: 'Aktionsbestellung';
        storageLocation : Association to one logistic.StorageLocations @title: 'Lagerort';
};
