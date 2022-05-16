import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {BaseService} from "../services/base.service";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate, CanLoad {

  constructor(
    private base: BaseService,
    private userService: UserService,
    private router: Router
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.check();
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.check();
  }

  /**
   * Controlla se l'utente può caricare la pagina
   * @return Esito della richiesta
   */
  check(): boolean | Observable<boolean> {
    if(this.base._localRequest){
      return true;
    }
    const token = sessionStorage.getItem('auth_token');
    if(token !== null){
      return this.userService.validToken().pipe(map(
          resp => {
            return true;
          },
          err => {
            return this.refuse();
          }),
        catchError((err) => {
          return of(this.refuse());
        })
      );
    }
    return this.refuse();
  }

  /**
   * Rifiuta la richiesta dell'utente
   * @return Sempre falso
   */
  refuse(): boolean {
    this.router.navigateByUrl('/');
    return false;
  }

}
