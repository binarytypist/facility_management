import { Routes } from '@angular/router'; // triggers rebuild
import { Login } from './pages/login/login';
import { Landing } from './pages/landing/landing';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { Layout } from './components/layout/layout';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'landing', component: Landing },
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'map', loadComponent: () => import('./pages/map/map').then(m => m.MapComponent) },
      { path: 'users/list', loadComponent: () => import('./pages/users/user-list/user-list').then(m => m.UserList) },
      { path: 'users/create', loadComponent: () => import('./pages/users/user-create/user-create').then(m => m.UserCreate) },
      { path: 'users/edit/:id', loadComponent: () => import('./pages/users/user-update/user-update').then(m => m.UserUpdate) },
      { path: 'users/credentials', loadComponent: () => import('./pages/users/user-credentials/user-credentials').then(m => m.UserCredentials) },
      { path: 'designations', loadComponent: () => import('./pages/designations/designations').then(m => m.Designations) },
      { path: 'company-types', loadComponent: () => import('./pages/company-types/company-types').then(m => m.CompanyTypes) },
      { path: 'clients/list', loadComponent: () => import('./pages/clients/client-list/client-list').then(m => m.ClientList) },
      { path: 'clients/create', loadComponent: () => import('./pages/clients/client-create/client-create').then(m => m.ClientCreate) },
      { path: 'clients/edit/:id', loadComponent: () => import('./pages/clients/client-update/client-update').then(m => m.ClientUpdate) },
      { path: 'agencies/list', loadComponent: () => import('./pages/agencies/agency-list/agency-list').then(m => m.AgencyList) },
      { path: 'agencies/create', loadComponent: () => import('./pages/agencies/agency-create/agency-create').then(m => m.AgencyCreate) },
      { path: 'agencies/edit/:id', loadComponent: () => import('./pages/agencies/agency-update/agency-update').then(m => m.AgencyUpdate) },
      { path: 'business-types', loadComponent: () => import('./pages/business-types/business-types').then(m => m.BusinessTypes) },
      { path: 'facility/create', loadComponent: () => import('./pages/facility/facility-create/facility-create').then(m => m.FacilityCreate) },
      { path: 'facility/list', loadComponent: () => import('./pages/facility/facility-list/facility-list').then(m => m.FacilityList) },
      { path: 'facility/assignment/create', loadComponent: () => import('./pages/facility/assignment/create/assignment-create').then(m => m.AssignmentCreate) },
      { path: 'facility/assignment/list', loadComponent: () => import('./pages/facility/assignment/list/assignment-list').then(m => m.AssignmentList) },
      { path: 'work/item/list', loadComponent: () => import('./pages/work/work-item/list/work-item-list').then(m => m.WorkItemListComponent) },
      { path: 'work/item/create', loadComponent: () => import('./pages/work/work-item/create/work-item-create').then(m => m.WorkItemCreateComponent) },
      { path: 'work/item/edit/:id', loadComponent: () => import('./pages/work/work-item/create/work-item-create').then(m => m.WorkItemCreateComponent) },
      { path: 'configuration/event-config', loadComponent: () => import('./pages/configuration/event-config/event-config').then(m => m.EventConfigComponent) }
    ]
  }
];
