using PlanningService.PlanningSizeItems from '../../srv/pre-order-volume-planning/planning-service';

annotate PlanningService.PlanningSizeItems with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: supplierProductNumber,
        Label: '{i18n>product.supplierProductNumber}'
    },
    {
        $Type: 'UI.DataField',
        Value: size_1_CODE,
        Label: '{i18n>product.size1}'
    },
    {
        $Type: 'UI.DataField',
        Value: size_2_CODE,
        Label: '{i18n>product.size2}'
    },
    {
        $Type: 'UI.DataField',
        Value: supplierProductNumber,
        Label: '{i18n>product.supplierProductNumber}'
    },
    {
        $Type: 'UI.DataField',
        Value: size_GTIN,
        Label: '{i18n>product.GTIN}'
    },
    {
        $Type: 'UI.DataField',
        Value: sapArticleNumber,
        Label: '{i18n>product.sapNumber}'
    },
    {
        $Type: 'UI.DataField',
        Value: totalAmount,
        Label: '{i18n>planning.totalAmount}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup1,
        Label: '{i18n>planning.houseGroup1}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup2,
        Label: '{i18n>planning.houseGroup2}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup3,
        Label: '{i18n>planning.houseGroup3}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup4,
        Label: '{i18n>planning.houseGroup4}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup5,
        Label: '{i18n>planning.houseGroup5}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup6,
        Label: '{i18n>planning.houseGroup6}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup7,
        Label: '{i18n>planning.houseGroup7}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup8,
        Label: '{i18n>planning.houseGroup8}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup9,
        Label: '{i18n>planning.houseGroup9}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup10,
        Label: '{i18n>planning.houseGroup10}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup11,
        Label: '{i18n>planning.houseGroup11}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup12,
        Label: '{i18n>planning.houseGroup12}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup13,
        Label: '{i18n>planning.houseGroup13}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup14,
        Label: '{i18n>planning.houseGroup14}'
    },
    {
        $Type: 'UI.DataField',
        Value: houseGroup15,
        Label: '{i18n>planning.houseGroup15}'
    },
], );

annotate PlanningService.PlanningSizeItems with {
    writingAppointment @UI.Hidden;
    sapStatus          @UI.Hidden;
    sapHttpStatus      @UI.Hidden;
    sapHttpStatusText  @UI.Hidden;
    sapStatusText      @UI.Hidden;
    sapTransactionId   @UI.Hidden;
    name               @UI.Hidden;
    description        @UI.Hidden;
    isImported         @UI.Hidden;
    product_ID         @UI.Hidden;
}
