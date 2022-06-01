import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserInfo} from "../../../classes/UserResponse";
import {Game, GameRound} from "../../../game/classes/game";
import {UserManagerService} from "../../services/user-manager.service";
import {Subscription} from "rxjs";
import {SimpleTextComponent} from "../../../dialogs/simple-text/simple-text.component";
import {DialogManagerService} from "../../../services/dialog-manager.service";

@Component({
  selector: 'app-match-info',
  templateUrl: './match-info.component.html',
  styleUrls: ['./match-info.component.css']
})
export class MatchInfoComponent implements OnInit, OnDestroy {

  game : Game

  rounds : GameRound[]

  subscriptions : Subscription[]

  constructor(
    public dialogRef: MatDialogRef<MatchInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Game,
    private userManager : UserManagerService,
    private dialogManager : DialogManagerService
  ) {

  }

  getGameInfo(){
    this.subscriptions.push(this.userManager.getGame(this.game._id).subscribe(res => {
      this.rounds = res.data
    }, err => {
      this.dialogManager.showDialog(SimpleTextComponent,() => { close()}, {data : err})
    }))
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
}
