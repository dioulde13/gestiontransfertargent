import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DasboardComponent } from './pages/dasboard/dasboard.component';
import { ListeEntreComponent } from './pages/liste-entre/liste-entre.component';
import { ListeSortieComponent } from './pages/liste-sortie/liste-sortie.component';
import { ListePartenaireComponent } from './pages/liste-partenaire/liste-partenaire.component';
import { ListeDeviseComponent } from './pages/liste-devise/liste-devise.component';


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
      {
        path: 'partenaire',
        component: ListePartenaireComponent,
      },
      {
        path: 'devise',
        component: ListeDeviseComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
