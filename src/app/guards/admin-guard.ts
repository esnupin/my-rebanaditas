import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// este guard sirve para controlar qn puede entrar a las páginas de administrador
export const adminGuard: CanActivateFn = () => {

  const auth = inject(AuthService);

  const router = inject(Router);

  //si no hay sesión iniciasa el userno pueede entrar al panel admin y se redige a login
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // si se inicia sesión se comprieba si es admin y si es, se le permite entrar al panel admin
  if (auth.isAdmin()) {
    return true;
  }

  // si no es admin e intenta ir a panel admin lo redigige a productos
  return router.createUrlTree(['/productos']);
};
