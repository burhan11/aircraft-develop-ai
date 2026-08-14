import DetailView from "./DetailView"

export default class detailViewModel {
    private detail: DetailView;

    public constructor() {
        this.detail = new DetailView()
    }

    public get details(): DetailView {
        return this.detail;
    }

    public set details(value: DetailView) {
        this.detail = value;
    }
}