import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserInfo} from "../../../classes/UserResponse";
import {Game, GameRound} from "../../../game/classes/game";
import {UserManagerService} from "../../services/user-manager.service";
import {Subscription} from "rxjs";
import {SimpleTextComponent} from "../../../dialogs/simple-text/simple-text.component";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {WordListComponent} from "../../../dialogs/word-list/word-list.component";

@Component({
  selector: 'app-match-info',
  templateUrl: './match-info.component.html',
  styleUrls: ['./match-info.component.css']
})
export class MatchInfoComponent implements OnInit, OnDestroy {

  /** Informazioni relative al game selezionato*/
  game : Game;
  /** Informazioni di base relative a tutti i round*/
  rounds : GameRound[];
  /** Informazioni specifiche per un round*/
  roundInfo : GameRound;
  /** Lista delle subscription per fare le richieste*/
  subscriptions : Subscription[]

  constructor(
    public dialogRef: MatDialogRef<MatchInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Game,
    private userManager : UserManagerService,
    private dialogManager : DialogManagerService
  ) {

  }

  ngOnInit(): void {
    this.game = this.data;
    this.subscriptions = [];
    this.getGameInfo()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(item => item.unsubscribe())
    close();
  }

  close(){
    this.dialogRef.close();
  }

  getGameInfo(){
    this.subscriptions.push(this.userManager.getGame(this.game._id).subscribe(res => {
      this.rounds = res.data
    }, err => {
      this.dialogManager.showDialog(SimpleTextComponent,() => { close()}, {data : err})
    }))
  }

  onRoundClick(i){
    this.subscriptions.push(this.userManager.getRound(this.game._id, this.rounds[i].round).subscribe(res =>{
      this.dialogManager.showDialog(WordListComponent, () => {} , {data : res.data});
    } , err => {
      this.dialogManager.showDialog(SimpleTextComponent,() => { }, {data : err})
    }))
  }
}
