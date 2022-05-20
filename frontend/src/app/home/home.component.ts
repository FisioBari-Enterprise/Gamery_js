import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../auth/services/user.service";
import {Subscription} from "rxjs";
import {TokenData} from "../classes/web/TokenResponse";
import {DialogManagerService} from "../services/dialog-manager.service";
import { HomeService } from '../services/home.service';
import { User } from '../classes/User';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  /**Sottoscrizioni delle richieste web*/
  allSubscriptions: Subscription[] = [];
  /**Utente attivo */
  user : User;

  username : String = ''
  charUsername : String = ''

  constructor(
    private dialog: DialogManagerService,
    private userService: UserService,
    private homeService : HomeService
  ) { }

  ngOnInit(): void {
    // Cancella tutti i dati presenti nel local storage
    // localStorage.clear();

    //Controllo sul uuid dell'utente temporaneo
    this.dialog.showLoading("Checking data...");
    const uuid = localStorage.getItem('uuid');
    if (uuid === null) {
      this.newTemporaryUser();
    } else {
      this.checkToken();
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
        HomeComponent.saveTokenData(data.data);
        this.getUserInfo()
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
        HomeComponent.saveTokenData(data.data);
        this.getUserInfo()
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
        this.getUserInfo()
      }, error => {
        if(error.status == 403 || error.status == 401) {
          //Il token non è più valido quindi fa il login
          const uuid = localStorage.getItem('uuid')!;
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
  private static saveTokenData(data: TokenData) {
    sessionStorage.setItem('auth_token', data.access)
    if (data.uuid !== null && data.uuid !== undefined) {
      localStorage.setItem('uuid', data.uuid);
    }
  }

  getUserInfo(){
    this.allSubscriptions.push(
      this.homeService.getUserInfo().subscribe(
        res => {
          this.user = res;
          this.setUserInfo();
          this.dialog.closeDialog();
        },
        err => {
          console.log(err);
          this.dialog.closeDialog();
        }
      )
    )
  }

  setUserInfo(){
    this.username = this.user.data.username;
    this.charUsername = this.user.data.username.charAt(0);
  }

}
