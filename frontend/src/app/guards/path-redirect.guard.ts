import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PathRedirectGuard implements CanActivate, CanLoad {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkData(route);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  /**
   * Controlla se c'è un redirect
   */
  checkData(route: ActivatedRouteSnapshot): boolean {
    const path = route.queryParams['path'];
    if (path != null) {
      // Fa il redirect dal path indicato
      this.router.navigateByUrl(path);
    }
    return true;
  }

}
