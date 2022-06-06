import {Component, Inject, OnInit} from '@angular/core';
import {DialogManagerService} from "../../services/dialog-manager.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  /*Funzione che chiude il dialog quando viene cliccato il bottone di chiusura in alto a dx*/
  close() {
    this.dialogRef.close();
  }



}
