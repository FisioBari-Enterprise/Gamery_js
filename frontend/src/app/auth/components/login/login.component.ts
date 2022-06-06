import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {ColorButtons} from "../../../shared/enum/colorButtons";
import {AuthField} from "../../classes/authField";
import {Subscription} from "rxjs";
import { UserService } from '../../services/user.service';
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {Router} from "@angular/router";
import {getLocalePluralCase} from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  /**Richiesta di login*/
  subscription: Subscription

  /**Indica se è attivo il login*/
  public isLogin: Boolean = true;
  /** Indica se sto facendo un recupero della mail */
  public forgotPassword : Boolean = false

  /**Colore del bottone registrazione*/
  colorRegister = ColorButtons.Blue;

  /**username_email data*/
  usernameEmail: AuthField = new AuthField();
  /**password data*/
  password: AuthField = new AuthField();

  constructor(
    private userService: UserService,
    private dialogManager: DialogManagerService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.isLogin = true;
    this.resetField();
  }

  ngOnDestroy(): void {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
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
    this.forgotPassword = true;
  }

  /**
   * Effettua il login
   */
  login(){
    this.usernameEmail.error = "";
    this.password.error = "";
    this.dialogManager.showLoading('Checking credentials...');
    this.subscription = this.userService.login(this.usernameEmail.value, this.password.value).subscribe(res => {
      this.dialogManager.closeDialog();
      // Salva le credenziali e fa il redirect
      this.userService.saveCredentials(this.usernameEmail.value, this.password.value, res.data);
      this.router.navigateByUrl("home");
    }, error => {
      this.dialogManager.closeDialog();
      const err = error.error;
      if (err.error != null) {
        // Visualizzazione errore
        const key = err.error.split(":")[0]
        const value = err.error.split(":")[1]
        // Assegna l'errore
        switch (key){
          case "usernameEmail": this.usernameEmail.error = value; break;
          case "password": this.password.error = value; break;
          default: this.dialogManager.showError(err.error, () => {});
        }
      } else {
        this.dialogManager.showError(err, () => {});
      }
    });
  }

  /**
   * Effettua la registrazione
   */
  register(){
    this.isLogin = false;
    this.resetField();
  }

}
