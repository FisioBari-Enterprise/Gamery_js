import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../auth/user.service";
import {CookieService} from "ngx-cookie-service";
import {Subscription} from "rxjs";
import {TokenData} from "../classes/web/TokenResponse";
import {BaseService} from "../services/base.service";
import {DialogManagerService} from "../services/dialog-manager.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  /**Sottoscrizioni delle richieste web*/
  allSubscriptions: Subscription[] = [];

  constructor(
    private dialog: DialogManagerService,
    private userService: UserService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    //Controllo sul uuid dell'utente temporaneo
    this.dialog.showLoading("Checking data...");
    const uuid = this.cookieService.get('uuid');
    if (uuid === "") {
      this.newTemporaryUser();
    } else {
      this.loginUserTemporary(uuid);
    }
  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(item => item.unsubscribe());
  }

  /**
   * Ottiene un nuovo utente temporaneo
   * @private
   */
  private newTemporaryUser() {
    this.allSubscriptions.push(
      this.userService.registerUserTemporary().subscribe(data => {
        this.saveTokenData(data.data);
        this.dialog.closeDialog();
      }, error => {
        this.dialog.closeDialog();
        this.dialog.showError(error.message, (res) => this.newTemporaryUser());
      })
    );
  }

  /**
   * Login con utente temporaneo
   * @private
   */
  private loginUserTemporary(uuid: string) {
    this.allSubscriptions.push(
      this.userService.loginUserTemporary(uuid).subscribe(data => {
        this.saveTokenData(data.data);
        this.dialog.closeDialog();
      }, error => {
        this.dialog.closeDialog();
        this.dialog.showError(error.message, (res) => this.newTemporaryUser());
      })
    );
  }

  /**
   * Salva i dati ricevuti dal server
   * @param data Dati ricevuti
   * @private
   */
  private saveTokenData(data: TokenData) {
    sessionStorage.setItem('auth_token', data.access)
    if (data.uuid !== null && data.uuid !== undefined) {
      this.cookieService.set('uuid', data.uuid);
    }
  }

}
