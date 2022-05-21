import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import {HttpClientModule} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {MatDialogModule} from "@angular/material/dialog";
import {DialogModule} from "./dialogs/dialog.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { RegisterComponent } from './register/register.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeGameComponent } from './game/components/home-game/home-game.component';
import { TabelComponent } from './tabel/tabel.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    HomeGameComponent,
    TabelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DialogModule,
    MatDialogModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule
  ],
  providers: [

    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
