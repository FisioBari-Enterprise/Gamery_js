import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/components/home/home.component';
import { LoginComponent } from './auth/components/login/login.component';
import {HomeGameComponent} from "./game/components/home-game/home-game.component";
import {UserGuard} from "./auth/guards/user.guard";
import {PathRedirectGuard} from "./guards/path-redirect.guard";

const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    canLoad: [PathRedirectGuard],
    canActivate: [PathRedirectGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canLoad: [PathRedirectGuard],
    canActivate: [PathRedirectGuard]
  },
  {
    path: 'game',
    component: HomeGameComponent,
    // Da attivare non appena il componente sarà completato
    canLoad: [UserGuard, PathRedirectGuard],
    canActivate: [UserGuard, PathRedirectGuard]
  },
  {
    path:'**',redirectTo : 'home'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
