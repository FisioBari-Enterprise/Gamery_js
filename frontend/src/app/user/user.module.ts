import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainUserComponent } from './components/main-user/main-user.component';
import { CountryComponent } from './components/country/country.component';
import { MatchesComponent } from './components/matches/matches.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import {SharedModule} from "../shared/shared.module";
import { MatchInfoComponent } from './components/match-info/match-info.component';



@NgModule({
  declarations: [
    MainUserComponent,
    CountryComponent,
    MatchesComponent,
    StatisticsComponent,
    MatchInfoComponent
  ],
    imports: [
        CommonModule,
        SharedModule
    ]
})
export class UserModule { }
