import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface WorkType {
  id: string;
  name: string;
  category: 'Structured' | 'SemiStructured' | 'Unstructured';
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-event-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-config.html'
})
export class EventConfigComponent {
  workTypes = signal<WorkType[]>([
    { id: '1', name: 'Cleaning', category: 'Structured', status: 'Active' },
    { id: '2', name: 'Laundry', category: 'Structured', status: 'Active' },
    { id: '3', name: 'Waste Collection', category: 'Structured', status: 'Active' },
    { id: '4', name: 'Preventive Maintenance', category: 'Structured', status: 'Active' },
    { id: '5', name: 'Security Patrol', category: 'Structured', status: 'Active' },
    { id: '6', name: 'Room Preparation', category: 'SemiStructured', status: 'Active' },
    { id: '7', name: 'Equipment Setup', category: 'SemiStructured', status: 'Active' },
    { id: '8', name: 'Minor Repair', category: 'SemiStructured', status: 'Active' },
    { id: '9', name: 'Inspection', category: 'SemiStructured', status: 'Active' },
    { id: '10', name: 'Furniture Move', category: 'SemiStructured', status: 'Active' },
    { id: '11', name: 'Emergency Repair', category: 'Unstructured', status: 'Active' },
    { id: '12', name: 'Water Leak', category: 'Unstructured', status: 'Active' },
    { id: '13', name: 'Flood Cleanup', category: 'Unstructured', status: 'Active' },
    { id: '14', name: 'Power Failure', category: 'Unstructured', status: 'Active' },
    { id: '15', name: 'Accident Response', category: 'Unstructured', status: 'Active' },
  ]);

  categories = ['Structured', 'SemiStructured', 'Unstructured'];

  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');

  filteredConfigs = computed(() => {
    return this.workTypes().filter(wt => {
      const matchCategory = !this.selectedCategory() || wt.category === this.selectedCategory();
      const matchSearch = !this.searchQuery() || 
        wt.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        wt.category.toLowerCase().includes(this.searchQuery().toLowerCase());
      
      return matchCategory && matchSearch;
    });
  });

  clearFilters() {
    this.selectedCategory.set('');
    this.searchQuery.set('');
  }
}
