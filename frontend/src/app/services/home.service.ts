import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { User } from '../classes/User';

@Injectable({
  providedIn: 'root'
})
export class HomeService {


  constructor(
    private http: HttpClient,
    private base: BaseService
  ) {   }

  /**
   * Ottengo i dati dell'utente attivo
   * @returns Dati dell'utente che sta giocando
   */
  getUserInfo():Observable<User>{
    let headers = this.base.TokenHeader;

    return this.http.get<User>(this.base.apiUrl("client"),{headers});
  }
}
