import ProductDashboard from "./ProductDashboard";
import ProductDetails from "./ProductDetails";


/**
 * Contains all data which is used for mulitple uses
 */
export default class ViewModels {
  public constructor() {
    this.productDetails_ = new ProductDetails();
    this.productDashboard_ = new ProductDashboard();
  }

  // Product details view
  private productDetails_: ProductDetails;

  public get productDetails(): ProductDetails {
    return this.productDetails_;
  }

  public set productDetails(value: ProductDetails) {
    this.productDetails_ = value;
  }

  // Product dashboard
  private productDashboard_: ProductDashboard;

  public get productDashboard(): ProductDashboard {
    return this.productDashboard_;
  }

  public set productDashboard(value: ProductDashboard) {
    this.productDashboard_ = value;
  }
}