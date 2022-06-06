import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ColorButtons} from "../../shared/enum/colorButtons";
import {DialogManagerService} from "../../services/dialog-manager.service";
import {WordListComponent} from "../word-list/word-list.component";
import {GameRound} from "../../game/classes/game";

@Component({
  selector: 'app-lose',
  templateUrl: './lose.component.html',
  styleUrls: ['./lose.component.css']
})
export class LoseComponent implements OnInit {

  /**Colore del bottone*/
  colorButton = ColorButtons.Blue;

  constructor(
    public dialogRef: MatDialogRef<LoseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      point : number,
      round : GameRound
    },
    private dialogManager : DialogManagerService
  ) { }

  ngOnInit(): void {
  }

  /**
   * Andiamo alla
   */
  goToHome(){
    this.dialogRef.close()
  }

  showWord(){
    this.dialogManager.showDialog(WordListComponent, () => {}, {data : this.data.round})
  }

}
