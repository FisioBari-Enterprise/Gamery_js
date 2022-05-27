import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginComponent} from "./components/login/login.component";
import {RegisterComponent} from "./components/register/register.component";
import {SharedModule} from "../shared/shared.module";
import {FormsModule} from "@angular/forms";
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { SendEmailComponent } from './components/send-email/send-email.component';



@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    SendEmailComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule
    ]
})

export class AuthModule { }
