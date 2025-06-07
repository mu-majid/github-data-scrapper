import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Filter } from '../../core/models/filter.model';
import { FilterService } from '../../core/services/filter.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-filter-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  templateUrl: './filter-management.component.html',
  styleUrls: ['./filter-management.component.scss']
})
export class FilterManagementComponent implements OnInit {
  separatorKeysCodes = []

  removeStatusValue(valueToRemove: string): void {
    console.log('remove > ', valueToRemove)
    const currentValues = this.filterForm.get('status.values')?.value || [];
    const updatedValues = currentValues.filter((value: string) => value !== valueToRemove);
    this.filterForm.get('status.values')?.setValue(updatedValues);
  }
  addStatusValue(event: MatChipInputEvent): void {
    
    const value = (event.value || '').trim();
    console.log('add > ', value)
    if (value) {
      const currentValues = this.filterForm.get('status.values')?.value || [];
      if (!currentValues.includes(value)) {
        const updatedValues = [...currentValues, value];
        this.filterForm.get('status.values')?.setValue(updatedValues);
      }
    }
    event.chipInput!.clear();
  }
  @Input() collection: string = '';
  @Output() filterApplied = new EventEmitter<Filter>();

  filters: Filter[] = [];
  showCreateForm = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collection'] && changes['collection'].currentValue) {
      console.log('>> entity change', changes['collection'].currentValue)
      this.showCreateForm = false;
      this.loadFilters();
    }
  }

  loadFiltersForCollection(collection: string): void {
    const allFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
    this.filters = allFilters.filter((f: any) => f.collection === collection);
  }

  filterForm: FormGroup;
  editingFilter: Filter | null = null;
  availableFields: string[] = [];
  operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'in', label: 'In' },
    { value: 'notIn', label: 'Not In' }
  ];

  constructor(
    private fb: FormBuilder,
    private filterService: FilterService,
    private dataService: DataService
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadFilters();
    this.loadAvailableFields();
  }

  createFilterForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      enableDateRange: [false],
      dateRange: this.fb.group({
        field: [''],
        startDate: [null],
        endDate: [null]
      }),
      enableStatus: [false],
      status: this.fb.group({
        field: [''],
        values: [[]]
      }),
      customFields: this.fb.array([])
    });
  }

  get customFields(): FormArray {
    return this.filterForm.get('customFields') as FormArray;
  }

  addCustomField(): void {
    const customField = this.fb.group({
      field: ['', Validators.required],
      operator: ['equals', Validators.required],
      value: ['', Validators.required]
    });
    this.customFields.push(customField);
  }

  removeCustomField(index: number): void {
    this.customFields.removeAt(index);
  }

  loadFilters(): void {
    this.filterService.getUserFilters().subscribe(filters => {
      this.filters = filters.filter(f => f.collection === this.collection);
      this.loadAvailableFields()
    });
  }

  loadAvailableFields(): void {
    this.dataService.getCollectionFields(this.collection).subscribe((fields: any) => {
      const { fields: fieldsDef } = fields
      this.availableFields = fieldsDef.filter((f: any) => !f.includes('__v') || !f.includes('buffer'))
    });
  }

  saveFilter(): void {
    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;
      const filter: Filter = {
        name: formValue.name,
        description: formValue.description,
        collection: this.collection,
        filters: {
          ...(formValue.enableDateRange && {
            dateRange: formValue.dateRange
          }),
          ...(formValue.enableStatus && {
            status: formValue.status
          }),
          ...(formValue.customFields.length > 0 && {
            customFields: formValue.customFields
          })
        },
        isActive: false
      };

      if (this.editingFilter) {
        this.filterService.updateFilter(this.editingFilter._id!, filter).subscribe(() => {
          this.loadFilters();
          this.resetForm();
        });
      } else {
        this.filterService.createFilter(filter).subscribe(() => {
          this.loadFilters();
          this.resetForm();
        });
      }
    }
  }

  editFilter(filter: Filter): void {
    this.editingFilter = filter;
    this.showCreateForm = true;
    this.filterForm.patchValue({
      name: filter.name,
      description: filter.description,
      enableDateRange: !!filter.filters.dateRange,
      dateRange: filter.filters.dateRange || {},
      enableStatus: !!filter.filters.status,
      status: filter.filters.status || {}
    });
    this.customFields.clear();
    if (filter.filters.customFields) {
      filter.filters.customFields.forEach(field => {
        this.customFields.push(this.fb.group(field));
      });
    }
  }

  deleteFilter(filter: Filter): void {
    if (confirm(`Are you sure you want to delete the filter "${filter.name}"?`)) {
      this.filterService.deleteFilter(filter._id!).subscribe(() => {
        this.loadFilters();
      });
    }
  }

  toggleFilter(filter: Filter): void {
    this.filterService.toggleFilter(filter._id!).subscribe(updatedFilter => {
      this.loadFilters();
      if (updatedFilter.isActive) {
        console.log('updatedFilter ', updatedFilter)
        this.filterApplied.emit(updatedFilter);
      } else {
        this.filterApplied.emit(null as any);
      }
    });
  }

  resetForm(): void {
    this.filterForm.reset();
    this.customFields.clear();
    this.showCreateForm = false;
    this.editingFilter = null;
  }
}