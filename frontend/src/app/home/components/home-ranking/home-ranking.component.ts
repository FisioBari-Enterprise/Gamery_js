import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UserInfo} from "../../../classes/UserResponse";
import { LeaderboardPos } from '../../classes/leaderboardPos';
import {Subscription} from "rxjs";
import {HomeService} from "../../services/home.service";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import * as moment from 'moment';

@Component({
  selector: 'app-home-ranking',
  templateUrl: './home-ranking.component.html',
  styleUrls: ['./home-ranking.component.css']
})
export class HomeRankingComponent implements OnInit, OnChanges, OnDestroy {

  /**Tutte le sottoscrizioni delle richieste web*/
  allSubscriptions: Subscription[];

  /**Link della bandiera associata all'utente*/
  userFlag: string = '';
  /**Indica che il bottone global è selezionato*/
  globalSelect: boolean = true;
  /**Indica se sono accessibili i bottoni*/
  buttonActive: boolean = true;
  /**La classifica trovata*/
  leaderboard: LeaderboardPos[];
  /**Posizione in classifica dell'utente*/
  userLeaderboard: LeaderboardPos | null;

  /** Informazioni dell'utente attivo */
  @Input() user: UserInfo | null = null;

  constructor(
    private homeService: HomeService,
    private dialogService: DialogManagerService
  ) { }

  ngOnInit(): void {
    this.resetData();
  }

  ngOnDestroy() {
    this.allSubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Resetta le variabili globali con i dati di default
   */
  resetData() {
    if (this.allSubscriptions == null) {
      this.userFlag = '';
      this.globalSelect = true;
      this.leaderboard = [];
      this.userLeaderboard = null;
      this.allSubscriptions = [];
    }
  }

  /**
   * Ottiene il link dell'immagine della bandiera
   */
  getFlagLink(){
    if (this.user == null || this.user!.country == null){
      return '';
    }
    return `https://flagcdn.com/84x63/${this.user!.country.code}.png`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Controlla il cambiamento del input user
    if (changes['user'] != null) {
      this.resetData();
      this.userFlag = this.getFlagLink();
      // Carica la prima istanza della classifica
      this.getLeaderboard(this.globalSelect ? 0 : 1);
    }
  }

  /**
   * Azione dei bottoni per il cambio della visualizzazione della classifica
   * @param {Boolean} isGlobal Indica che è stato eseguita l'azione in global
   */
  onButtonSelect(isGlobal: boolean) {
    // Controlla che non sia già selezionato il bottone
    if (this.globalSelect == isGlobal) {
      return;
    }
    this.globalSelect = isGlobal;
    // Resetta i dati della leaderboard
    this.leaderboard = [];
    this.userLeaderboard = null;
    // Aggiorna la classifica
    this.getLeaderboard(this.globalSelect ? 0 : 1);
  }

  /**
   * Ottiene i dati della classifica in base al tipo
   */
  getLeaderboard(type: number) {
    // Mostra il loading del caricamento della partita
    this.dialogService.closeDialog();
    this.dialogService.showLoading('Carico classifica...');
    // Prende l'id del country da inviare nella richiesta nel caso in cui il type == 1
    const countryId = this.user?.country != null ? this.user!.country._id : '';
    this.allSubscriptions.push(
      this.homeService.getLeaderboard(type, countryId).subscribe(res => {
        // Aggiorna i dati della classifica
        this.leaderboard = res.data;
        // Richiede la posizione in classifica dell'utente
        this.getUserLeaderboard(type, countryId);
      }, error => {
        this.dialogService.closeDialog();
        // Mostra l'errore a video e riprova a eseguire l'azione
        this.dialogService.showError(error.error.error, () => {
          this.getLeaderboard(type);
        });
      })
    );
  }

  /**
   * Posizione in classifica dell'utente
   * @param {Number} type Tipo di classifica
   * @param {String} countryId Id del country nelle preferenze dell'utente
   */
  getUserLeaderboard(type: number, countryId: string) {
    this.allSubscriptions.push(
      this.homeService.getUserLeaderboard(type, countryId).subscribe(res => {
        // Salva la posizione in classifica
        this.userLeaderboard = res.data;
        this.dialogService.closeDialog();
      }, error => {
        this.dialogService.closeDialog();
        // Mostra l'errore a video e riprova a eseguire l'azione
        this.dialogService.showError(error.error.error, () => {
          this.getUserLeaderboard(type, countryId);
        });
      })
    );
  }

  /**
   * Converte in stringa la data di ultimo aggiornamento della classifica
   */
  getLastUpdateDateString(): string{
    if (this.leaderboard.length === 0){
      return 'No update available';
    }
    return 'Last update: ' + moment(this.leaderboard[0].createdAt).format('MM/DD/YYYY HH:mm:ss');
  }

}
