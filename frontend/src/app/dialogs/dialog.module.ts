import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error/error.component';
import { LoadingComponent } from './loading/loading.component';



@NgModule({
  declarations: [
    ErrorComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DialogModule { }
