import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeGameComponent } from './components/home-game/home-game.component';
import {SharedModule} from "../shared/shared.module";
import { BoardComponent } from './components/board/board.component';


@NgModule({
  declarations: [
    HomeGameComponent,
    BoardComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class GameModule { }
