import VariantDashboard from "./VariantDashboard";
import VariantDetails from "./VariantDetails";


/**
 * Contains all data which is used for mulitple uses
 */
export default class ViewModelsVariant {
  public constructor() {
    this.variantDetails_ = new VariantDetails();
    this.VariantDashboard_ = new VariantDashboard();
  }

  // Product details view
  private variantDetails_: VariantDetails;

  public get variantDetails(): VariantDetails {
    return this.variantDetails_;
  }

  public set variantDetails(value: VariantDetails) {
    this.variantDetails_ = value;
  }

  // Product dashboard
  private VariantDashboard_: VariantDashboard;

  public get VariantDashboard(): VariantDashboard {
    return this.VariantDashboard_;
  }

  public set VariantDashboard(value: VariantDashboard) {
    this.VariantDashboard_ = value;
  }
}