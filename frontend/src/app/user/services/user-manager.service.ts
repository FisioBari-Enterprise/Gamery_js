import { Injectable } from '@angular/core';
import {BaseService} from "../../services/base.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Game, GameResponse, GameRound, GameRoundResponse, GameRounds, Games} from "../../game/classes/game";
import {AllCountryResponse} from "../../home/classes/country";
import {Settings, UserResponse} from "../../classes/UserResponse";

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

  /**
   * Aggiorna la preferenza del country dell'utente
   * @param {String | null} id Nuovo id o null se si vuole eliminare
   */
  updateCountry(id: string | null): Observable<UserResponse> {
    console.log(id);
    let headers = this.base.TokenHeader;
    // Elimina la preferenza
    if (id === null) {
      return this.http.delete<UserResponse>(this.base.apiUrl('country', 'client'), {headers});
    }
    // Modica la preferenza
    const body = {id: id};
    return this.http.put<UserResponse>(this.base.apiUrl('country', 'client'), body, {headers});
  }

  changeSettings(font_size : string, volume : string, sound : boolean) : Observable<any>{
    let body = {
      "font_size": parseInt(font_size),
      "volume": parseInt(volume),
      "sound": sound
    }
    console.log(body);
    let headers = this.base.TokenHeader;
    return this.http.put<any>(this.base.apiUrl("client", "settings"),body,{headers});
  }

  getSettings() : Observable<Settings>{
    let headers = this.base.TokenHeader;
    return this.http.get<Settings>(this.base.apiUrl("client", "settings"), {headers});
  }
}
