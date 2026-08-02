import ArticleDashboard from "./ArticleDashboard";
import ArticleDetails from "./ArticleDetails";


/**
 * Contains all data which is used for mulitple uses
 */
export default class ViewModelsArticle {
  public constructor() {
    this.articleDetails_ = new ArticleDetails();
    this.ArticleDashboard_ = new ArticleDashboard();
  }

  // Product details view
  private articleDetails_: ArticleDetails;

  public get articleDetails(): ArticleDetails {
    return this.articleDetails_;
  }

  public set articleDetails(value: ArticleDetails) {
    this.articleDetails_ = value;
  }

  // Product dashboard
  private ArticleDashboard_: ArticleDashboard;

  public get ArticleDashboard(): ArticleDashboard {
    return this.ArticleDashboard_;
  }

  public set ArticleDashboard(value: ArticleDashboard) {
    this.ArticleDashboard_ = value;
  }
}