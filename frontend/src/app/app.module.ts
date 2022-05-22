import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import {HttpClientModule} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {MatDialogModule} from "@angular/material/dialog";
import {DialogModule} from "./dialogs/dialog.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { RegisterComponent } from './components/register/register.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TabelComponent } from './game/components/tabel/tabel.component';
import {GameModule} from "./game/game.module";
import {SharedModule} from "./shared/shared.module";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        DialogModule,
        GameModule,
        SharedModule,
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
