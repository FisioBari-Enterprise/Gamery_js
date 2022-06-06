import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/services/base.service';
import {Observable} from "rxjs";
import {LeaderboardPosClientResponse, LeaderboardPosResponse} from "../classes/leaderboardPos";

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
    private http: HttpClient,
    private base: BaseService
  ) { }

  /**
   * Ottiene la classifica
   * @param {Number} type Tipo di leaderboard
   * @param {String} country Id o codice dello stato se il type = 1
   */
  getLeaderboard(type: number, country: string): Observable<LeaderboardPosResponse> {
    const headers = this.base.TokenHeader;
    const url = this.base.apiUrl('leaderboard', `?type=${type}${type === 1 ? `&country=${country}` : ''}`);
    return this.http.get<LeaderboardPosResponse>(url, {headers});
  }

  /**
   * Ottiene la posizione in classifica dell'utente
   * @param {Number} type Tipo di classifica richiesta
   * @param {String} country Id o codice dello stato se il type = 1
   */
  getUserLeaderboard(type: number, country: string): Observable<LeaderboardPosClientResponse> {
    const headers = this.base.TokenHeader;
    const url = this.base.apiUrl('leaderboard', `/client?type=${type}${type === 1 ? `&country=${country}` : ''}`);
    return this.http.get<LeaderboardPosClientResponse>(url, {headers});
  }
}
