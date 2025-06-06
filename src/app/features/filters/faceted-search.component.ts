import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { DataService } from '../../core/services/data.service';

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

@Component({
  selector: 'app-faceted-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './faceted-search.component.html',
  styleUrls: ['./faceted-search.component.scss']
})
export class FacetedSearchComponent implements OnInit {
  @Input() collection: string = '';
  @Input() availableFields: any[] = [];
  @Output() facetsChanged = new EventEmitter<Facet[]>();

  facets: Facet[] = [];
  activeFacets: Facet[] = [];
  showAllFacets = false;
  
  // Common facet configurations
  commonFacets = {
    'repos': ['owner.login', 'language', 'private', 'fork', 'created_at'],
    'commits': ['author.login', 'committer.login', 'commit.author.date'],
    'pulls': ['user.login', 'state', 'merged', 'created_at', 'closed_at'],
    'issues': ['user.login', 'state', 'labels', 'created_at', 'closed_at'],
    'users': ['type', 'site_admin', 'created_at']
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.initializeFacets();
  }

  initializeFacets(): void {
    console.log(this.collection)
    const fields = this.commonFacets[this.collection as keyof typeof this.commonFacets] || [];
    
    fields.forEach((field: any) => {
      const fieldDef = this.availableFields.find(f => f.field === field);
      if (fieldDef) {
        const facet: Facet = {
          field: field,
          type: this.getFieldType(fieldDef),
          values: [],
          selectedValues: []
        };
        
        this.facets.push(facet);
        this.loadFacetValues(facet);
      }
    });
  }

  getFieldType(fieldDef: any): 'string' | 'number' | 'date' | 'boolean' {
    // Determine type based on field definition or name
    if (fieldDef.field.includes('date') || fieldDef.field.includes('_at')) {
      return 'date';
    } else if (fieldDef.field.includes('count') || fieldDef.field.includes('size')) {
      return 'number';
    } else if (fieldDef.field === 'private' || fieldDef.field === 'fork' || 
               fieldDef.field === 'merged' || fieldDef.field === 'site_admin') {
      return 'boolean';
    }
    return 'string';
  }

  loadFacetValues(facet: Facet): void {
    // Call backend to get facet values with counts
    this.dataService.getFacetValues(this.collection, facet.field).subscribe(values => {
      if (facet.type === 'string' || facet.type === 'boolean') {
        facet.values = values.map(v => ({
          value: v._id,
          count: v.count,
          selected: false
        }));
      } else if (facet.type === 'number' || facet.type === 'date') {
        facet.range = {
          min: values[0]?.min || 0,
          max: values[0]?.max || 0
        };
      }
    });
  }

  toggleFacetValue(facet: Facet, value: FacetValue): void {
    value.selected = !value.selected;
    
    if (value.selected) {
      facet.selectedValues = facet.selectedValues || [];
      facet.selectedValues.push(value.value);
    } else {
      facet.selectedValues = facet.selectedValues?.filter(v => v !== value.value) || [];
    }
    
    this.updateActiveFacets();
  }

  updateRangeFacet(facet: Facet): void {
    if (facet.selectedRange?.min || facet.selectedRange?.max) {
      this.updateActiveFacets();
    }
  }

  updateActiveFacets(): void {
    this.activeFacets = this.facets.filter(f => 
      (f.selectedValues && f.selectedValues.length > 0) ||
      (f.selectedRange && (f.selectedRange.min || f.selectedRange.max))
    );
    
    this.facetsChanged.emit(this.activeFacets);
  }

  clearFacet(facet: Facet): void {
    facet.selectedValues = [];
    facet.selectedRange = undefined;
    
    if (facet.values) {
      facet.values.forEach(v => v.selected = false);
    }
    
    this.updateActiveFacets();
  }

  clearAllFacets(): void {
    this.facets.forEach(facet => this.clearFacet(facet));
    this.updateActiveFacets();
  }

  getSelectedCount(facet: Facet): number {
    return facet.selectedValues?.length || 0;
  }
}