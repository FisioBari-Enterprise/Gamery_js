import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';



@NgModule({
    declarations: [
        NavBarComponent,
        ButtonComponent,
        CardComponent
    ],
    exports: [
        NavBarComponent,
        ButtonComponent,
        CardComponent
    ],
    imports: [
        CommonModule
    ]
})
export class SharedModule { }
