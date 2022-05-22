import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error/error.component';
import { LoadingComponent } from './loading/loading.component';
import { PauseComponent } from './pause/pause.component';



@NgModule({
  declarations: [
    ErrorComponent,
    LoadingComponent,
    PauseComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DialogModule { }
