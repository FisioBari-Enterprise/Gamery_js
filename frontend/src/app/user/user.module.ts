import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainUserComponent } from './components/main-user/main-user.component';
import { CountryComponent } from './components/country/country.component';
import { MatchesComponent } from './components/matches/matches.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import {SharedModule} from "../shared/shared.module";



@NgModule({
  declarations: [
    MainUserComponent,
    CountryComponent,
    MatchesComponent,
    StatisticsComponent
  ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class UserModule { }
