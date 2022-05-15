import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BaseService} from "../base.service";
import {Observable} from "rxjs";
import {BaseDataResponse} from "../classes/web/baseResponse";

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
}
