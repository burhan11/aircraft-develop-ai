interface ColumnState {
    key: string;
    visible: boolean;
    position: number;
}

interface SortState {
    key: string;
    descending: boolean;
}

interface FilterState {
    key: string;
    value: string;
}

interface GroupState {
    key: string;
}

export interface PersonalizationState {
    Columns?: ColumnState[];
    Sorter?: SortState[];
    Filter?: FilterState[];
    Groups?: GroupState[];
}

export interface MetadataItem {
    key: string;
    label: string;
    path: string;
}
