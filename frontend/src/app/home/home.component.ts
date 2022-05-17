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
    /*this.dialog.showLoading("Checking data...");
    const uuid = this.cookieService.get('uuid');
    if (uuid === "") {
      this.newTemporaryUser();
    } else {
      this.checkToken();
    }*/
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
   * Controlla il token assegnato
   * Se non lo trova o non è valido fa l'accesso con l'account temporaneo
   * @private
   */
  private checkToken() {
    this.allSubscriptions.push(
      this.userService.validToken().subscribe(res => {
        this.dialog.closeDialog();
      }, error => {
        if(error.status == 403 || error.status == 401) {
          //Il token non è più valido quindi fa il login
          const uuid = this.cookieService.get('uuid');
          this.loginUserTemporary(uuid);
        } else {
          //Errore generico
          this.dialog.closeDialog();
          this.dialog.showError(error.message, (res) => this.checkToken());
        }
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
