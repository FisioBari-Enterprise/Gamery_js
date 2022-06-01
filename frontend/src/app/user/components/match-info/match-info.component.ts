import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserInfo} from "../../../classes/UserResponse";
import {Game} from "../../../game/classes/game";

@Component({
  selector: 'app-match-info',
  templateUrl: './match-info.component.html',
  styleUrls: ['./match-info.component.css']
})
export class MatchInfoComponent implements OnInit, OnDestroy {

  game : Game

  constructor(
    public dialogRef: MatDialogRef<MatchInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Game
  ) {

  }

  ngOnInit(): void {
    this.game = this.data;
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }

}
