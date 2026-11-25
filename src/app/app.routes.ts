import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { NosotrosComponent } from './nosotros/nosotros';
import { Productos } from './productos/productos';

import { LoginComponent } from './login/login';
import { PanelAdminComponent } from './panel-admin/panel-admin'; // <-- Importar
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'productos', component: Productos },
  { path: 'login', component: LoginComponent },
    // RUTA PROTEGIDA: Solo entra 'johnd' (admin), los demás son redirigidos a productos
  { path: 'admin', component: PanelAdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }

];


