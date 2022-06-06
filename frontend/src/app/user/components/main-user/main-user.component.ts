import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserInfo} from "../../../classes/UserResponse";

@Component({
  selector: 'app-main-user',
  templateUrl: './main-user.component.html',
  styleUrls: ['./main-user.component.css']
})
export class MainUserComponent implements OnInit{

  /**Info dell'utente*/
  user : UserInfo
  /** Indica se deve essere mostrato il pulsante di back*/
  showBack : boolean = false
  /** indica quale pagina deve essere aperta */
  selectedButton : string = ""
  /** Url per ottenere l'immagine del country*/
  urlCountry : String = "./assets/userInfo/earth_globe.png"

  constructor(
    public dialogRef: MatDialogRef<MainUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserInfo
  ) { }

  ngOnInit(): void {
    this.user = this.data
    if(this.user.country != null && this.user.country.code != null){
      this.urlCountry = "https://flagcdn.com/84x63/"+ this.user.country.code +".png"
    }
  }

  changeFlag(){
    this.showBack = true;
    this.selectedButton = "flags";
  }

  showStatistics(){
    this.showBack = true;
    this.selectedButton = "statistics";

  }

  showRecentMatch(){
    this.showBack = true;
    this.selectedButton = "matches";

  }

  back() {
    this.showBack = false
  }

  close(){
    this.dialogRef.close();
  }

}
