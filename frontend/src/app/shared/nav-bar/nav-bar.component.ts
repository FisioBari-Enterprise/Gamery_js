import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserInfo} from "../../classes/UserResponse";
import {UserService} from "../../auth/services/user.service";
import {DialogManagerService} from "../../services/dialog-manager.service";
import {TokenData} from "../../classes/web/TokenResponse";
import {Subscription} from "rxjs";
import {NavBarType} from "../enum/navBarType";
import { PauseComponent } from 'src/app/dialogs/pause/pause.component';
import {Router} from "@angular/router";
import {ColorButtons} from "../enum/colorButtons";

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

  /**Colore del bottone di home*/
  colorSchemaHome = ColorButtons.Blue;
  /**Colore del bottone di home*/
  colorSchemaSkip = ColorButtons.Green;

  /**Tipo di navbar da visualizzare in base agli input*/
  @Input() currentType: number = NavBarType.NoLogged;
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
    private router: Router
  ) { }

  ngOnInit(): void {
    // Cancella tutti i dati presenti nel local storage
    //localStorage.clear();

    // Carica il tipo
    if (this.gameMode) {
      this.currentType = NavBarType.Game;
    }
    if (this.currentType === NavBarType.ShowHome) {
      return;
    }
    // Controllo sul uuid dell'utente temporaneo
    this.dialog.showLoading("Checking data...");
    const uuid = localStorage.getItem('uuid');
    const uuidUser = localStorage.getItem('uuidUser');
    // Controlla il login da fare
    if (uuidUser != null) {
      this.login();
    } else {
      if (uuid === null) {
        this.newTemporaryUser();
      } else {
        this.checkToken();
      }
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
   * Effettua il login con le credenziali salvate
   * @private
   */
  private login() {
    const usernameEmail = localStorage.getItem('usernameEmail');
    const password = localStorage.getItem('password')
    if (usernameEmail == null || password == null) {
      this.dialog.closeDialog();
      this.dialog.showError('No save credentials found', () => {});
      return
    }
    this.allSubscriptions.push(
      this.userService.login(usernameEmail, password).subscribe(res => {
        this.currentType = NavBarType.Logged;
        // Salva il token
        sessionStorage.setItem('auth_token', res.data.access)
        this.getUserInfo();
      }, error => {
        this.dialog.closeDialog();
        let err = error.error.error;
        if (err != null) {
          err = err.split(':')[1];
        }
        this.dialog.showError(err, () => {});
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
          this.firstCharUsername = this.userInfo.username.charAt(0).toUpperCase();
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

  /**
   * Pressione del bottone Skip time
   */
  skipTime() {

  }

  /**
   * Pressione del bottone di login
   */
  onLoginClick() {
    this.router.navigateByUrl('login');
  }

  /**
   * Torna alla home
   */
  backHome() {
    this.router.navigateByUrl('home');
  }

  /**
   * Effettua il logout
   */
  onLogoutClick() {
    this.dialog.showLoading('Logging out...');
    this.allSubscriptions.push(
      this.userService.logout().subscribe(res => {
        this.dialog.closeDialog();
        // Resetta i dati
        const uuid = localStorage.getItem('uuid');
        localStorage.removeItem('uuidUser');
        const isLogin = localStorage.getItem('isLogin') === 'true';
        this.currentType = NavBarType.NoLogged;
        // In base ai dati crea o meno un nuovo utente temporaneo
        if (!isLogin) {
          this.newTemporaryUser();
        } else {
          this.loginUserTemporary(uuid!);
        }
      }, error => {
        this.dialog.closeDialog();
        this.dialog.showError(error.error, () => {});
      })
    );
  }

}
