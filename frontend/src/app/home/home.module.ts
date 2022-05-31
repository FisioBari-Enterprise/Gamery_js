import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomeComponent} from "./components/home/home.component";
import {SharedModule} from "../shared/shared.module";
import { HomePlayComponent } from './components/home-play/home-play.component';
import { HomeRankingComponent } from './components/home-ranking/home-ranking.component';



@NgModule({
  declarations: [
    HomeComponent,
    HomePlayComponent,
    HomeRankingComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class HomeModule { }
