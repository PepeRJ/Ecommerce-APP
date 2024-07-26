import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';


export const httpGuardGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);

  if (loginService.estaAutenticado()) {
    return true;
  } else {
    loginService.redirigirALogin();
    return false;
  }
};

