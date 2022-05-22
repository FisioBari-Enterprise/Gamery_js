import { Injectable } from '@angular/core';
import {BaseService} from "../../services/base.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {GameResponse, GameRoundResponse} from "../classes/game";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private base: BaseService,
    private http: HttpClient
  ) { }

  /**
   * Ottiene l'ultima partita giocata
   */
  lastGame(): Observable<GameResponse> {
    const headers = this.base.TokenHeader;
    return this.http.get<GameResponse>(this.base.apiUrl('game'), {headers});
  }

  /**
   * Avvia una nuova partita
   */
  newGame(): Observable<GameResponse> {
    const headers = this.base.TokenHeader;
    return this.http.post<GameResponse>(this.base.apiUrl('game'), {}, {headers});
  }

  /**
   * Ottiene l'ultimo round connesso alla partita
   */
  lastRound(): Observable<GameRoundResponse> {
    const headers = this.base.TokenHeader;
    return this.http.get<GameRoundResponse>(this.base.apiUrl('game', 'round'), {headers});
  }

  /**
   * Genera un nuovo round
   */
  newRound(): Observable<GameRoundResponse> {
    const headers = this.base.TokenHeader;
    return this.http.post<GameRoundResponse>(this.base.apiUrl('game', 'round'), {}, {headers});
  }

  /**
   * Controlla le parole inserite dall'utente
   * @param words Parole inserite dall'utente
   * @param gameTime tempo di gioco
   */
  checkRound(words: string[], gameTime: number): Observable<GameRoundResponse> {
    const headers = this.base.TokenHeader;
    return this.http.put<GameRoundResponse>(this.base.apiUrl('game', 'round'), { words : words, gameTime: gameTime }, {headers});
  }
}
