import { Component, OnInit } from '@angular/core';
import {AuthField} from "../../classes/authField";
import {ColorButtons} from "../../../shared/enum/colorButtons";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  /** Campo per la nuova password */
  password : AuthField
  /** Campo per la conferma della nuova password */
  passwordConfirm : AuthField
  /** Colo del bottone di cancel */
  colorCancel = ColorButtons.Blue;


  constructor() { }

  ngOnInit(): void {
  }

  confirm(){

  }

  cancel(){

  }

}
