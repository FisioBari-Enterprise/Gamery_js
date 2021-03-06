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
import {MainUserComponent} from "../../user/components/main-user/main-user.component";
import {SettingsComponent} from "../../dialogs/settings/settings.component";
import {SimpleTextComponent} from "../../dialogs/simple-text/simple-text.component";
import {UserManagerService} from "../../user/services/user-manager.service";


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
  /**Colore del bottone di login*/
  colorSchemaLogin = ColorButtons.Blue;
  /**Colore del bottone di logout*/
  colorSchemaLogout = ColorButtons.Red;
  /**Colore del bottone delle impostazioni*/
  colorSchemaSettings = ColorButtons.Yellow;


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
  /**Indica la pressione del bottone skipTime*/
  @Output() isSkipTime = new EventEmitter<Boolean>();
  /**Indica la pressione del bottone delle impostazioni*/
  @Output() isSettings = new EventEmitter<Boolean>();

  /**Evento sollevato quando viene caricato correttamente l'utente*/
  @Output() onUserInfo = new EventEmitter<UserInfo>();

  constructor(
    private userService: UserService,
    private userManagerService : UserManagerService,
    private dialog: DialogManagerService,
    private router: Router
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
    const uuidUser = localStorage.getItem('uuidUser');
    // Controlla il login da fare
    if (uuidUser != null && this.currentType !== NavBarType.ShowHome) {
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
        // Se non sono in game mode aggiorna il tipo
        if (this.currentType != NavBarType.Game) {
          this.currentType = NavBarType.Logged;
        }
        // Salva il token
        sessionStorage.setItem('auth_token', res.data.access)
        this.getUserInfo();
      }, error => {
        this.dialog.closeDialog();
        let err = error.error.error;
        // Controlla credenziali errate
        if (err === 'password: password not correct') {
          // Login con l'utente temporaneo salvato
          const uuid = localStorage.getItem('uuid')!;
          localStorage.removeItem('uuidUser');
          this.loginUserTemporary(uuid);
          return;
        }
        if (err != null) {
          err = err.split(':')[1];
        }
        this.dialog.showError(err, () => {});
      })
    );
  }

  /**
   * Apre la visualizzazione della schermata dello user
   */
  openUser(){
    this.dialog.showDialog(MainUserComponent,() => {

    },{data : this.userInfo})
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
          // Il token non è più valido quindi fa il login
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
          this.onUserInfo.emit(this.userInfo);
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
   * Evento pressione del bottone Skip time
   */
  skipTime() {
    //Mando l'evento di skipTime
    this.isSkipTime.emit(true);
  }

  openSettings() {
    //Mostro dialog delle impostazioni
    this.dialog.showDialog(SettingsComponent, () => {
      this.allSubscriptions.push(
        this.userManagerService.getSettings().subscribe( res => {

        }, err => {
          console.log(err.error.error);
          this.dialog.showDialog(SimpleTextComponent, () => {
          },{data: err.error.error});
        })
      )
    },{data : this.userInfo});
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
