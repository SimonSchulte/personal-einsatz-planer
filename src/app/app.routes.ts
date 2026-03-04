import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/planning-list/planning-list').then((m) => m.PlanningList),
  },
  {
    path: 'editor',
    loadComponent: () =>
      import('./pages/planning-editor/planning-editor').then((m) => m.PlanningEditor),
  },
  { path: '**', redirectTo: '' },
];
