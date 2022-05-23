import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ColorButtons} from "../../shared/enum/colorButtons";

@Component({
  selector: 'app-complete-level',
  templateUrl: './complete-level.component.html',
  styleUrls: ['./complete-level.component.css']
})
export class CompleteLevelComponent implements OnInit {

  /** Id del timer */
  timerId : any;
  /** Tempo rimasto prima dell'inizio di un nuovo livello */
  timeLeft : number = 15;

  /**Colore del bottone*/
  colorButton = ColorButtons.Green;

  constructor(
    public dialogRef: MatDialogRef<CompleteLevelComponent>,
    @Inject(MAT_DIALOG_DATA) public data : number
  ) {

  }

  ngOnInit(): void {
    this.setUpTimer();
  }

  /**Timer per inizio del nuovo livello */
  setUpTimer(){
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if(this.timeLeft == 0){
        clearInterval(this.timerId);
        this.startNewLevel();
      }
    },1000)
  }

  startNewLevel(){
    this.dialogRef.close()
  }

}
