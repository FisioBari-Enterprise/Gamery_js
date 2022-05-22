import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-complete-level',
  templateUrl: './complete-level.component.html',
  styleUrls: ['./complete-level.component.css']
})
export class CompleteLevelComponent implements OnInit {

  /** Punteggio ottenuto nel livello */
  levelScore : Number = 0;
  /** Punteggio totale della partita */
  totalScore : Number = 0;

  /** Id del timer */
  timerId : any;
  /** Tempo rimasto prima dell'inizio di un nuovo livello */
  timeLeft : number = 15;

  constructor(
    public dialogRef: MatDialogRef<CompleteLevelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    
  }

  ngOnInit(): void {
    this.setUpTimer();
  }

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
