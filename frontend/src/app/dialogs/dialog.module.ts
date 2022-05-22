import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error/error.component';
import { LoadingComponent } from './loading/loading.component';
import { PauseComponent } from './pause/pause.component';
import { CompleteLevelComponent } from './complete-level/complete-level.component';
import { LoseComponent } from './lose/lose.component';



@NgModule({
  declarations: [
    ErrorComponent,
    LoadingComponent,
    PauseComponent,
    CompleteLevelComponent,
    LoseComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DialogModule { }
