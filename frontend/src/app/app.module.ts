import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/components/home/home.component';
import {HttpClientModule} from "@angular/common/http";
import {MatDialogModule} from "@angular/material/dialog";
import {DialogModule} from "./dialogs/dialog.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {GameModule} from "./game/game.module";
import {SharedModule} from "./shared/shared.module";
import {AuthModule} from "./auth/auth.module";
import {UserModule} from "./user/user.module";
import {HomeModule} from "./home/home.module";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        DialogModule,
        GameModule,
        AuthModule,
        HomeModule,
        SharedModule,
        MatDialogModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        UserModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
