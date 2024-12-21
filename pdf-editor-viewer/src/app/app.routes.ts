import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path:'home',
    loadComponent:()=>import('./components/home/home.component').then(m=>m.HomeComponent)
  },
  {
    path: 'pdftron',
    loadComponent: () =>
      import('./components/pdftron/pdftron.component').then(
        (m) => m.PdftronComponent
      ),
  },
  { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
