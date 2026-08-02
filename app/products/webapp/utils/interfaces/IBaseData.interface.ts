interface IBaseData {
    ID: string;
    name: string;
}

export interface IWritingAppointment extends IBaseData {
    date: string; // The OData service will send it as an ISO string
}
