import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ButtonComponent } from './button/button.component';



@NgModule({
    declarations: [
        NavBarComponent,
        ButtonComponent
    ],
    exports: [
        NavBarComponent
    ],
    imports: [
        CommonModule
    ]
})
export class SharedModule { }
