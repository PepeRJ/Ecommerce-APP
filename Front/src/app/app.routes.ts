import { Routes } from '@angular/router';
import { StoreComponent } from './components/pages/store/store.component';
import { LoginComponent } from './components/pages/login/login.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { CarritoComponent } from './components/pages/carrito/carrito.component';
import { httpGuardGuard } from './guards/http-guard.guard';


export const routes: Routes = [
    {path:'', component: StoreComponent},
    {path: 'login', component: LoginComponent},
    {path: 'perfil/:id', canActivate: [httpGuardGuard], component: ProfileComponent},
    {path: 'carrito', canActivate: [httpGuardGuard], component: CarritoComponent}

];
