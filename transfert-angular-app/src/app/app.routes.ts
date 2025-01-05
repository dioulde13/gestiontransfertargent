import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DasboardComponent } from './pages/dasboard/dasboard.component';
import { ListeEntreComponent } from './pages/liste-entre/liste-entre.component';
import { ListeSortieComponent } from './pages/liste-sortie/liste-sortie.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DasboardComponent,
      },
      {
        path: 'entre',
        component: ListeEntreComponent,
      },
      {
        path: 'sortie',
        component: ListeSortieComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
