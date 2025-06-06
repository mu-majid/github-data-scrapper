export interface DateRangeFilter {
  field: string;
  startDate: Date;
  endDate: Date;
}

export interface StatusFilter {
  field: string;
  values: string[];
}

export interface CustomFieldFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 
            'greaterThan' | 'lessThan' | 'in' | 'notIn';
  value: any;
}

export interface Filter {
  _id?: string;
  name: string;
  description?: string;
  collection: string;
  filters: {
    dateRange?: DateRangeFilter;
    status?: StatusFilter;
    customFields?: CustomFieldFilter[];
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Facet {
  field: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  values?: FacetValue[];
  range?: { min: number | Date; max: number | Date };
  selectedValues?: any[];
  selectedRange?: { min: number | Date; max: number | Date };
}

export interface FacetValue {
  value: any;
  count: number;
  selected?: boolean;
}