import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DialogManagerService} from "../../services/dialog-manager.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl} from "@angular/forms";
import {ColorButtons} from "../../shared/enum/colorButtons";
import {UserInfo} from "../../classes/UserResponse";
import {UserManagerService} from "../../user/services/user-manager.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})


export class SettingsComponent implements OnInit {

  @Input() font_size : number = 10;
  @Input() volumeValue : number = 10;
  @Input() isSound : boolean = true;

  /**Dati dell'utente da modificare*/
  @Input() userInfo: UserInfo;
  /**Evento di modifica dello user*/
  @Output() changeUserinfo: EventEmitter<UserInfo> = new EventEmitter<UserInfo>();

  /**Colore del bottone registrazione*/
  colorSave = ColorButtons.Blue;

  constructor(
    private userService: UserManagerService,
    private dialogManager: DialogManagerService,
    public dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  /*Funzione che chiude il dialog quando viene cliccato il bottone di chiusura in alto a dx*/
  close() {
    this.dialogRef.close();
  }


  changeFontValue(i: any){
    this.font_size = i;
  }

  changeVolume(i: any){
    this.volumeValue = i;
  }

  changeSound(i: any){
    this.isSound = !this.isSound;
  }

  /**
   * Cambia i parametri delle impostazioni dell'utente
   * @param font_size
   * @param volume
   * @param sound
   */
  onChangeSettings(font_size : number, volume : number, sound : boolean){
    this.dialogManager.showLoading("Updating settings...");

  }

}
