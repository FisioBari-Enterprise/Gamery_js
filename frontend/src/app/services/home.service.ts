import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { UserResponse } from '../classes/UserResponse';
import {GameResponse} from "../game/classes/gameResponse";

@Injectable({
  providedIn: 'root'
})
export class HomeService {


  constructor(
    private http: HttpClient,
    private base: BaseService
  ) {   }

  /**
   * Ottiene le informazioni dell'ultimo match creato
   * @returns Dati della partita
   */
  getLastMatch(): Observable<GameResponse> {
    let headers = this.base.TokenHeader;
    return this.http.get<GameResponse>(this.base.apiUrl('game'), {headers});
  }
}
