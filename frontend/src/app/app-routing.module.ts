import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import {HomeGameComponent} from "./game/components/home-game/home-game.component";
import {UserGuard} from "./auth/guards/user.guard";
import {ButtonComponent} from "./shared/button/button.component";

const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'game',
    component: HomeGameComponent,
    // Da attivare non appena il componente sarà completato
    // canLoad: [UserGuard],
    // canActivate: [UserGuard]
  },
  {
    path : 'button',
    component : ButtonComponent
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
