import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/simulation/simulation.component').then(m => m.SimulationComponent)
  },
  {
    path: 'analysis',
    loadComponent: () => import('./components/analysis/analysis.component').then(m => m.AnalysisComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
