import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GameRound} from "../../game/classes/game";

@Component({
  selector: 'app-word-list',
  templateUrl: './word-list.component.html',
  styleUrls: ['./word-list.component.css']
})
export class WordListComponent implements OnInit , OnDestroy{

  constructor(
    public dialogRef: MatDialogRef<WordListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameRound,
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy() {
  }

  close(){
    this.dialogRef.close();
  }
}
