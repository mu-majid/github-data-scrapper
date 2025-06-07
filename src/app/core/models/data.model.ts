export interface Collection {
  name: string;
  label: string;
  count: number;
}

export interface CollectionsResponse {
  success: boolean;
  collections: Collection[];
}

export interface FieldDefinition {
  field: string;
  headerName: string;
  type: string;
  sortable: boolean;
  filter: boolean;
  resizable: boolean;
  width: number;
  cellRenderer?: string;
}

export interface FieldsResponse {
  success: boolean;
  fields: FieldDefinition[];
  message?: string;
}

export interface CollectionDataResponse {
  success: boolean;
  data: any[];
  flattenedData: any[]
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fields: string[];
  search: string;
  sortBy: string;
  sortOrder: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  activeFilterId?: string;
  facets?: string;
  facetQuery?: string
}

export interface VisualisationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  author?: string;
  status?: string;
  repositoryId?: string;
}