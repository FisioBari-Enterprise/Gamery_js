import { Component, Input, OnInit } from '@angular/core';
import {ColorButtons} from "../../../shared/enum/colorButtons";
import {AuthField} from "../../classes/authField";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  /**Indica se è attivo il login*/
  public isLogin: Boolean = true;

  /**Colore del bottone registrazione*/
  colorRegister = ColorButtons.Blue;

  /**username_email data*/
  usernameEmail: AuthField = new AuthField();
  /**password data*/
  password: AuthField = new AuthField();

  constructor(

  ) { }

  ngOnInit(): void {
    this.isLogin = true;
    this.resetField();
  }

  /**
   * Reset degli input utente
   */
  resetField() {
    this.usernameEmail = new AuthField();
    this.password = new AuthField();
  }

  /**
   * Bottone del bottone di reset
   */
  passwordForgotten(){

  }

  /**
   * Effettua il login
   */
  login(){

  }

  /**
   * Effettua la registrazione
   */
  register(){
    this.isLogin = false;
  }
}
