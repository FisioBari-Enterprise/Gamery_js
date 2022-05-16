import { Component, OnInit } from '@angular/core';
import {UserService} from "../auth/user.service";
import {CookieService} from "ngx-cookie-service";
import {Subscription} from "rxjs";
import {TokenData} from "../classes/web/TokenResponse";
import {MatDialog} from "@angular/material/dialog";
import {BaseService} from "../base.service";
import {ErrorComponent} from "../dialogs/error/error.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  /**Sottoscrizioni delle richieste web*/
  allSubscriptions: Subscription[] = [];

  /**Indica il caricamento*/
  loading: boolean = false;
  /**Testo del login*/
  loadingText: string = "";

  constructor(
    private base: BaseService,
    private userService: UserService,
    private cookieService: CookieService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    //Controllo sul uuid dell'utente temporaneo
    const uuid = this.cookieService.get('uuid');
    if (uuid === "") {
      //this.newTemporaryUser();
    } else {
      this.loginUserTemporary(uuid)
    }
  }

  test() {
    let dialogRef = this.dialog.open(ErrorComponent, {
      height: '400px',
      width: '600px',
    });
  }

  /**
   * Mostra oppure oscura il loading
   * @param show Indica se mostrarlo o meno
   * @param text Testo da mostrare. Con show = false mettere null
   * @private
   */
  private showLoading(show: boolean = true, text: string | null = "") {
    this.loading = show
    this.loadingText = text == null ? "" : text
  }

  /**
   * Ottiene un nuovo utente temporaneo
   * @private
   */
  private newTemporaryUser() {
    this.showLoading(true, "Creo utente temporaneo...")
    this.allSubscriptions.push(
      this.userService.registerUserTemporary().subscribe(data => {
        this.saveTokenData(data.data)
        this.showLoading(false)
      }, error => {
        this.showLoading(false)
      })
    )
  }

  /**
   * Login con utente temporaneo
   * @private
   */
  private loginUserTemporary(uuid: string) {

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
