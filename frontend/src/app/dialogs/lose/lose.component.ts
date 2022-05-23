import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ColorButtons} from "../../shared/enum/colorButtons";

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
    @Inject(MAT_DIALOG_DATA) public data: number,
  ) { }

  ngOnInit(): void {
  }

  /**
   * Andiamo alla
   */
  goToHome(){
    this.dialogRef.close()
  }

}
