import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Subject, Subscription, timer} from "rxjs";
import { CompleteLevelComponent } from 'src/app/dialogs/complete-level/complete-level.component';
import { LoseComponent } from 'src/app/dialogs/lose/lose.component';
import { DialogManagerService } from 'src/app/services/dialog-manager.service';
import {OnChangeBoard} from "../../classes/onChangeBoard";
import { GameService } from '../../services/game.service';
import {Game, GameRound} from "../../classes/game";

// TODO: Gestione inserimento delle parole da parte dell'utente. Per ora in modo infinito
// TODO: Visualizzazione livello e score
// TODO: Gestione della pausa

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
  livelloSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();

  /**Partita in corso*/
  game: GameRound | null = null;

  /**Indica se si è in fase di memorizzazione o di inserimento */
  isMemorization : boolean = true

  /** Timer del round*/
  timeLeft : number = 0;

  /** Array delle parole inserite dall'utente */
  userWords : string[]

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
  }

  /**
   * Controlla l'esistenza di una partita giò esistente
   */
  checkLastGame() {
    this.allSubscriptions.push(
      this.gameService.lastGame().subscribe(res => {
        this.game = new GameRound();
        this.game.game = res.data;
        // Se il gioco è completato ne crea un altro
        if (this.game.game.complete) {
          this.newGame();
        } else {
          // Carico le informazioni dell'ultimo round
          this.getLastRound();
        }
      }, error => {
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
        this.newRound();
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
        console.log(this.game);
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
        console.log(this.game);
        // Richiama le funzioni di aggiornamento
        this.startRound();
      }, error => {
        this.dialogManager.showError(error.message, () => this.dialogManager.closeDialog());
      })
    );
  }

  setUpTimer(){
    let time = this.isMemorization ? this.game!.game.memorize_time_for_round : this.game!.game.writing_time_for_round;
    let timeBoard = new OnChangeBoard(time, false, true)
    this.timeSubject.next(timeBoard);
    // Gestione timer
    let timerId = setInterval(() => {
      timeBoard.value--;
      this.timeSubject.next(timeBoard);
      if (timeBoard.value === 0) {
        clearInterval(timerId);
        if(this.isMemorization){
          this.isMemorization = !this.isMemorization;
          this.setUpTimer();
        } else {
          this.checkRoundEnd();
        }
      }
    },1000)
  }

  startRound(){
    this.setUpTimer();
  }

  checkRoundEnd(){
    this.allSubscriptions.push(this.gameService.checkRound(this.userWords, this.game!.game.writing_time_for_round).subscribe(res => {
      if(res.data.game.complete){
        this.dialogManager.showDialog(LoseComponent,() => {
          this.router.navigateByUrl('home');
        },{});
      }
      else{
        this.dialogManager.showDialog(CompleteLevelComponent, this.startRound, {});
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
    console.log(`Pausa ricevuta: ${event.toString()}`);
  }
}
