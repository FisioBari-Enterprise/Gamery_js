import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserInfo} from "../../classes/UserResponse";
import {UserService} from "../../auth/services/user.service";
import {DialogManagerService} from "../../services/dialog-manager.service";
import {TokenData} from "../../classes/web/TokenResponse";
import {Subscription} from "rxjs";
import {NavBarType} from "../enum/navBarType";
import { PauseComponent } from 'src/app/dialogs/pause/pause.component';

// TODO: Bottone di pausa e gestione
// TODO: Bottone di login se non ha un account registrato attivo e mostra la view dedicata
// TODO: Bottone di logout e gestione


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  /**Tutte le sottoscrizione di richieste web fatte dall'utente*/
  allSubscriptions: Subscription[] = [];

  /**Informazioni dell'utente*/
  userInfo: UserInfo | null = null;
  /**Prima lettera del username*/
  firstCharUsername: string | null = null;

  /**Tipo di navbar da visualizzare in base agli input*/
  currentType: number = NavBarType.NoLogged;

  /**Indica se si trova in una partita*/
  @Input() gameMode: Boolean = false;
  /**Indica che non ci sono più pause disponibili all'utente*/
  @Input() noPauseReaming: Boolean = false;
  /**Per il debug più veloce fa lo skip del login. Da rimuovere in produzione*/
  @Input() skipLogin: Boolean = false;
  /**Indica la pressione del bottone di pausa*/
  @Output() pauseSet = new EventEmitter<Boolean>();

  constructor(
    private userService: UserService,
    private dialog: DialogManagerService,
  ) { }

  ngOnInit(): void {
    // Cancella tutti i dati presenti nel local storage
    // localStorage.clear();

    // Carica il tipo
    if (this.gameMode) {
      this.currentType = NavBarType.Game;
    }

    // Controllo sul uuid dell'utente temporaneo
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
        NavBarComponent.saveTokenData(data.data);
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
        NavBarComponent.saveTokenData(data.data);
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
      this.userService.validToken().subscribe(_ => {
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

  /**
   * Ottiene le informazioni dell'utente sfruttando il token salvato
   */
  getUserInfo(){
    this.allSubscriptions.push(
      this.userService.getUserInfo().subscribe(
        res => {
          // Si prende i dati trovati
          this.userInfo = res.data;
          this.firstCharUsername = this.userInfo.username.charAt(0);
          this.dialog.closeDialog();
        },
        err => {
          this.dialog.closeDialog();
        }
      )
    )
  }

  /**
   * Evento di pausa
   */
  onPause() {
    // Apro il dialog di pausa
    this.dialog.showDialog(PauseComponent, () => {
      this.pauseSet.emit(false);
    }, { 'border-radius': '20px' });
    // Mando l'evento di pausa
    this.pauseSet.emit(true);
  }

}
