import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  /**Indica di leggere le richieste da file*/
  readonly _localRequest: boolean = false;
  /**Header di base per le richieste*/
  private readonly _jsonHeader: HttpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
  /**Tipo di host che si vuole usare per l'applicazione*/
  private readonly hostType: 'local' | 'production' = 'local';
  /**Host per lo sviluppo locale*/
  private readonly localHost: string = 'http://localhost:3000';
  /**Host per la produzione*/
  private readonly productionHost: string = '';

  //ENDPOINT
  private readonly _base = 'api';
  private readonly _client = 'api/client';
  private readonly _game = 'api/game';

  constructor(

  ) { }

  /**
   * Ottiene host selezionato in base al tipo
   * @private
   */
  get Host() {
    switch (this.hostType) {
      case "local": return this.localHost;
      case "production": return this.productionHost;
    }
  }

  /**
   * @returns Header con il content type
   */
  get CommonHeader() {
    return this._jsonHeader;
  }

  /**
   * @return Header con il token assegnato se presente
   */
  get TokenHeader(){
    let header = this.CommonHeader;
    const token = sessionStorage.getItem('auth_token');
    if(token !== undefined) {
      header = header.set('Authorization', 'Bearer ' + token);
    }
    return header;
  }

  /**
   * Ottiene l'url completo
   * @param key Tipo di service richiesto
   * @param subUrl subUrl dopo il service
   * @returns Url completo
   */
  apiUrl(key: 'base' | 'client' | 'game' = 'base', subUrl: string = '') {
    let service = '';
    switch (key) {
      case "base": service = this._base; break;
      case "client": service = this._client; break;
      case "game": service = this._game; break;
    }
    return `${this.Host}/${service}/${subUrl}`;
  }

  /**
   * Formatta la data in stringa con dd/mm/yyyy
   * @param date Data da serializzare
   * @return La stringa formatta
   */
  getStringDate(date: Date): string{
    return moment(date).format('MM/DD/YYYY');
  }

}
