import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Subject, Subscription, timer} from "rxjs";
import { CompleteLevelComponent } from 'src/app/dialogs/complete-level/complete-level.component';
import { LoseComponent } from 'src/app/dialogs/lose/lose.component';
import { DialogManagerService } from 'src/app/services/dialog-manager.service';
import {OnChangeBoard} from "../../classes/onChangeBoard";
import { GameService } from '../../services/game.service';
import {GameRound} from "../../classes/game";

@Component({
  selector: 'app-home-game',
  templateUrl: './home-game.component.html',
  styleUrls: ['./home-game.component.css']
})
export class HomeGameComponent implements OnInit, OnDestroy {
  /**Tutte le richieste web*/
  allSubscriptions: Subscription[] = [];

  /**Modifiche al tempo*/
  timeSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();
  /**Modifiche allo score*/
  scoreSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();
  /**Modifiche al livello*/
  levelSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();

  /**Partita in corso*/
  game: GameRound | null = null;

  /** Id del timer */
  timerId : any

  /**Indica se si è in fase di memorizzazione o di inserimento */
  isMemorization : boolean = true
  /** Indica se il gioco è in pausa */
  isPause : boolean = false;

  /** Array di parole da inserire */
  words : string[] = []
  /** Array delle parole inserite dall'utente */
  userWords : string[] = []


  /**Parola del input */
  word : string = ""

  constructor(
    private dialogManager: DialogManagerService,
    private gameService : GameService,
    private router : Router
  ) {

  }

  ngOnInit(): void {
    this.allSubscriptions = [];
    this.userWords = [];
    this.checkLastGame();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(item => item.unsubscribe());
    if(this.timerId !== null){
      clearInterval(this.timerId);
    }
  }

  /**
   * Controlla l'esistenza di una partita giò esistente
   */
  checkLastGame() {
    this.allSubscriptions.push(
      this.gameService.lastGame().subscribe(res => {
        this.game = res.data;
        // Se il gioco è completato ne crea un altro
        if (this.game.game.complete) {
          this.newGame();
        } else {
          // Carico le informazioni dell'ultimo round
          this.getLastRound();
        }
      }, error => {
        if (error.error.error === 'No game found for this user') {
          this.newGame();
          return
        }
        this.dialogManager.showError(error.message, () => this.checkLastGame());
      })
    );
  }

  /**
   * Genera un nuovo round
   */
  newGame() {
    this.allSubscriptions.push(
      this.gameService.newGame().subscribe(res => {
        // Dopo la generazione della partita carico un nuovo round
      }, error => {
        this.dialogManager.showError(error.message, () => this.dialogManager.closeDialog());
      })
    );
  }

  /**
   * Crea un nuovo round
   */
  newRound() {
    this.allSubscriptions.push(
      this.gameService.newRound().subscribe(res => {
        this.game = res.data;
        // Richiama le funzioni di aggiornamento
        this.startRound();
      }, error => {
        this.dialogManager.showError(error.message, () => this.dialogManager.closeDialog());
      })
    );
  }

  /**
   * Ottiene l'ultimo round
   */
  getLastRound() {
    this.allSubscriptions.push(
      this.gameService.lastRound().subscribe(res => {
        this.game = res.data;
        // Richiama le funzioni di aggiornamento
        this.startRound();
      }, error => {
        this.dialogManager.showError(error.message, () => this.dialogManager.closeDialog());
      })
    );
  }
  /**
   * Inizializzo il timer della partita
   */
  setUpTimer(){
    let time = this.isMemorization ? this.game!.game.memorize_time_for_round : this.game!.game.writing_time_for_round;
    let timeBoard = new OnChangeBoard(time, false, true, true)
    this.timeSubject.next(timeBoard);
    // Gestione timer
    this.timerId = setInterval(() => {
      //Blocco il timer nel caso in cui il gioco entri in pausa
      if(!this.isPause){
        //Faccio l'update del timer
        timeBoard.updateValue();
        this.timeSubject.next(timeBoard);
        //Se raggiungo lo zero entro in modalità inserimento o controllo le parole inserite
        if (timeBoard.value === 0) {
          clearInterval(this.timerId);
          if(this.isMemorization){
            this.isMemorization = !this.isMemorization;
            this.setUpTimer();
          } else {
            this.checkRoundEnd();
          }
        }
      }
    },1000)
  }

  /**
   * Evento d'inizio round
   */
  startRound(){
    this.userWords = [];
    this.words = this.game!.words.map(item => item.word);
    this.isMemorization = true;
    // Aggiorna i dati di score e level
    this.scoreSubject.next(new OnChangeBoard(this.game === null ? 0 : this.game.game.points, false, true));
    this.levelSubject.next(new OnChangeBoard(this.game === null ? 0 : this.game.game.max_round, false, true));
    this.setUpTimer();
  }

  /**
   * Controllo per la fine del round
   */
  checkRoundEnd(){
    this.allSubscriptions.push(this.gameService.checkRound(this.userWords, this.game!.game.writing_time_for_round).subscribe(res => {
      this.game = res.data
      //controllo se la partita è terminata o meno (se complete è a true vuol dire che non ho passato il livello)
      if(res.data.game.complete){
        this.dialogManager.showDialog(LoseComponent,() => {
          this.router.navigateByUrl('home');
        }, {data : this.game.game.points});
      }
      else{
        this.dialogManager.showDialog(CompleteLevelComponent, () => {
          this.startRound()
        }, {data : this.game.game.points});
      }
    }, err => {
      console.log(err);
    }))
  }

  /**
   * Evento di pausa
   * @param event
   */
  onPause(event: any) {
    this.isPause = event as boolean
  }

   /**
  * Evento di keypress in ascolto per ottenere il barcode
  * @param event Evento del KeyPress
  */
    @HostListener('window:keypress', ['$event'])
    beforeunloadHandler(event: KeyboardEvent) {
      if(event.key.includes('Enter')){
        //rimuovo lo spazio iniziale e finale dalle parole
        this.word = this.word.replace(/^\s+|\s+$/g, '');
        if(this.word != ''){
          this.userWords.push(this.word);
          this.word = '';
        }
      }
    }
}
