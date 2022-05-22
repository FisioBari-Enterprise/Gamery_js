import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PauseComponent } from './dialogs/pause/pause.component';
import {HomeGameComponent} from "./game/components/home-game/home-game.component";
import {UserGuard} from "./auth/guards/user.guard";
import {BoardComponent} from "./game/components/board/board.component";
import {CompleteLevelComponent} from "./dialogs/complete-level/complete-level.component";

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
    path : 'pause',
    component : PauseComponent
  },
  {
    path : 'level',
    component : CompleteLevelComponent
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
