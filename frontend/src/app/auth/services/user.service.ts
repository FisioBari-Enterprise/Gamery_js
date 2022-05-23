import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BaseService} from "../../services/base.service";
import {Observable} from "rxjs";
import {BaseDataResponse} from "../../classes/web/BaseResponse";
import {TokenDataResponse} from "../../classes/web/TokenResponse";
import {UserResponse} from "../../classes/UserResponse";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private base: BaseService
  ) { }

  /**
   * Invia la richiesta per controllare il token
   */
  validToken(): Observable<BaseDataResponse> {
    const headers = this.base.TokenHeader;
    return this.http.get<BaseDataResponse>(this.base.apiUrl('client', 'check'), {headers});
  }

  /**
   * Effettua il login con l'utente temporaneo
   */
  loginUserTemporary(uuid: string): Observable<TokenDataResponse>{
    const headers = this.base.CommonHeader
    const body = {uuid: uuid}
    return this.http.post<TokenDataResponse>(this.base.apiUrl('client', 'login'), body, {headers})
  }

  /**
   * Registra un utente temporaneo
   */
  registerUserTemporary(): Observable<TokenDataResponse>{
    const headers = this.base.CommonHeader
    return this.http.get<TokenDataResponse>(this.base.apiUrl('client', 'register/temporary'), {headers})
  }

  /**
   * Richiesta per la registrazione dell'utente
   * @param username username inserito dall'utente
   * @param email email inserita dall'utente
   * @param password password inserito dalla password
   * @param uuid uuid relativo all'utente temporaneo che è stato creato in precedenza
   * @returns token e nuovo uuid legato al nuovo profilo. 
   */
  registerNewUser(username : string, email : String, password : string, uuid : string) : Observable<TokenDataResponse>{
    let headers = this.base.CommonHeader;

    return this.http.post<TokenDataResponse>(this.base.apiUrl('client',"register"),{
      "username" : username,
      "email" : email,
      "password" :  password,
      "uuid" : uuid
    },{headers})
  }

  /**
   * Ottengo i dati dell'utente attivo
   * @returns Dati dell'utente che sta giocando
   */
  getUserInfo():Observable<UserResponse>{
    let headers = this.base.TokenHeader;
    return this.http.get<UserResponse>(this.base.apiUrl("client"),{headers});
  }
}
