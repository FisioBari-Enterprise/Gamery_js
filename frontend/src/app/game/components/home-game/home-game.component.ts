import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Subject, Subscription, timer} from "rxjs";
import { CompleteLevelComponent } from 'src/app/dialogs/complete-level/complete-level.component';
import { LoseComponent } from 'src/app/dialogs/lose/lose.component';
import { DialogManagerService } from 'src/app/services/dialog-manager.service';
import {OnChangeBoard} from "../../classes/onChangeBoard";
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home-game',
  templateUrl: './home-game.component.html',
  styleUrls: ['./home-game.component.css']
})
export class HomeGameComponent implements OnInit {
  /**Modifiche al tempo*/
  timeSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();
  /**Modifiche allo score*/
  scoreSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();
  /**Modifiche al livello*/
  livelloSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();

  /**Indica se creare una nuova partita o meno*/
  @Input() newGame: boolean = true;

  /**Indica se si è in fase di memorizzazione o di inserimento */
  isMemorization : boolean = true

  /** Timer del round*/
  timeLeft : number = 0;
  /** Tempo per la memorizzazione */
  memorizationTime : number = 0;
  /** Tempo per l'inserimento */
  insertTime : number = 0;

  /** Array delle parole inserite dall'utente */
  userWords : string[]

  /**Array di subscription per le richieste */
  private subscriptions : Subscription[]

  constructor(
    private dialogService : DialogManagerService,
    private gameService : GameService,
    private router : Router
  ) {  
    this.subscriptions = []
    this.userWords = []
  }

  ngOnInit(): void {

  }

  ngOnDestroy() : void {
    this.subscriptions.forEach(item => item.unsubscribe());
  }

  setUpTimer(){
    let timeleft = this.isMemorization ? this.memorizationTime : this.insertTime;

    let timerId = setInterval(() => {
      this.timeLeft--
      if(this.timeLeft == 0){
        clearInterval(timerId);
        if(this.isMemorization){
          this.isMemorization =  !this.isMemorization;
          this.setUpTimer();
        } else {
          this.checkRoundEnd()
        }
      }
    },1000)
  }

  startRound(){

  }

  checkRoundEnd(){
    this.subscriptions.push(this.gameService.checkRound(this.userWords,this.insertTime - this.timeLeft).subscribe(res => {
      if(res.data.game.complete == true){
        this.dialogService.showDialog(LoseComponent,() => {
          this.router.navigateByUrl('home');
        },{});
      }
      else{
        this.dialogService.showDialog(CompleteLevelComponent,this.startRound(),{});
      }
    }, err => {
      console.log(err);
    }))
  }
}
