import { Injectable } from '@angular/core';
import {BaseService} from "../../services/base.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Game} from "../../game/classes/game";

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {

  constructor(
    private base : BaseService,
    private http : HttpClient
  ) { }


  getGames() : Observable<Game[]>{
    let headers = this.base.TokenHeader;
    return this.http.get<Game[]>(this.base.apiUrl("game","recent"),{headers});
  }
}
