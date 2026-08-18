export default class copilotModelAircraft {
    public extracted: Record<string, any> = {};
    public suggestions: Record<string, any> = {};
    public message: string = "";
    public isUser: boolean = false;
    public chatMessages: Array<any> = [];
}