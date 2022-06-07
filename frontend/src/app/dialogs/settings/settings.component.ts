import {Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DialogManagerService} from "../../services/dialog-manager.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl} from "@angular/forms";
import {ColorButtons} from "../../shared/enum/colorButtons";
import {UserInfo} from "../../classes/UserResponse";
import {UserManagerService} from "../../user/services/user-manager.service";
import {Subscription} from "rxjs";
import {SimpleTextComponent} from "../simple-text/simple-text.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})


export class SettingsComponent implements OnInit, OnDestroy {

  font_size : number = 10;
  volumeValue : number = 10;
  isSound : boolean = true;

  /**Dati dell'utente da modificare*/
  @Input() userInfo: UserInfo;
  /**Evento di modifica dello user*/
  @Output() changeUserinfo: EventEmitter<UserInfo> = new EventEmitter<UserInfo>();

  subscription : Subscription[];


  /**Colore del bottone registrazione*/
  colorSave = ColorButtons.Blue;

  constructor(
    private userService: UserManagerService,
    private dialogManager: DialogManagerService,
    public dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.font_size= this.userInfo.settings.font_size;
    this.volumeValue= this.userInfo.settings.volume;
    this.isSound= this.userInfo.settings.sound;
  }

  ngOnInit(): void {
    this.subscription = [];
  }

  ngOnDestroy() {
    this.subscription.forEach(item => item.unsubscribe())
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

  save(){
    this.subscription.push(
      this.userService.changeSettings(this.font_size, this.volumeValue, this.isSound).subscribe(res => {
        // Aggiorna i dati dell'utente
        this.userInfo = res.data;
        this.changeUserinfo.emit(res.data);
      }, err =>{
        this.dialogManager.showDialog(SimpleTextComponent, () => {
        },{data: err.error});
      })
    )
  }

}
