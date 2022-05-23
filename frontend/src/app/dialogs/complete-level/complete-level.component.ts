import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-complete-level',
  templateUrl: './complete-level.component.html',
  styleUrls: ['./complete-level.component.css']
})
export class CompleteLevelComponent implements OnInit {

  /** Punteggio totale della partita */
  score : Number = 0;

  /** Id del timer */
  timerId : any;
  /** Tempo rimasto prima dell'inizio di un nuovo livello */
  timeLeft : number = 15;

  constructor(
    //public dialogRef: MatDialogRef<CompleteLevelComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: {
      //score : number,
    //}
  ) {

  }

  ngOnInit(): void {
    this.setUpTimer();
    //this.score = this.data.score;
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
    //this.dialogRef.close()
  }

}
