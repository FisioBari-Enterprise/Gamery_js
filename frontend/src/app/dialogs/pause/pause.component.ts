import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ColorButtons} from "../../shared/enum/colorButtons";

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.css']
})
export class PauseComponent implements OnInit {

  /**Colore del bottone di pausa*/
  colorSchema = ColorButtons.Yellow

  constructor(
    public dialogRef: MatDialogRef<PauseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  /**
   * Pressione del bottone di resume
   */
  resume(){
    this.dialogRef.close()
  }

}
