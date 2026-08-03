import { UUID } from "node:crypto";

export default class DetailView {
    public aeroplaneId: UUID = `${"0000"}-${"0000"}-${"0000"}-${"0000"}-${"0000"}`;
    public aeroplanePath: string = "";
    public bInEditMode: boolean = false;
}