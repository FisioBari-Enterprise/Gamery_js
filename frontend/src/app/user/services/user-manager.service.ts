import { Injectable } from '@angular/core';
import {BaseService} from "../../services/base.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Game, GameResponse, GameRound, GameRoundResponse, GameRounds, Games} from "../../game/classes/game";
import {AllCountryResponse} from "../../home/classes/country";

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {

  constructor(
    private base : BaseService,
    private http : HttpClient
  ) { }


  getGames() : Observable<Games>{
    let headers = this.base.TokenHeader;
    return this.http.get<Games>(this.base.apiUrl("game","recent"),{headers});
  }

  getGame(id : string) : Observable<GameRounds>{
    let headers = this.base.TokenHeader;
    let subUrl = id + "/rounds";
    return this.http.get<GameRounds>(this.base.apiUrl("game", subUrl),{headers})
  }

  getRound(id : string, round : number) : Observable<GameRoundResponse>{
    let headers = this.base.TokenHeader;
    let subUrl = id + '/round/' + round;
    return this.http.get<GameRoundResponse>(this.base.apiUrl("game",subUrl), {headers});
  }

  /**
   * Ottiene tutte le nazioni
   */
  getAllCountries(): Observable<AllCountryResponse> {
    let headers = this.base.TokenHeader;
    return this.http.get<AllCountryResponse>(this.base.apiUrl('country'), {headers});
  }
}
