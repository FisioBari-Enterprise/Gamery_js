import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogManagerService } from 'src/app/services/dialog-manager.service';
import { AuthField } from '../../classes/authField';
import { UserService } from '../../services/user.service';
import {ColorButtons} from "../../../shared/enum/colorButtons";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  /** Subscription dell'utente */
  subscription : Subscription

  /**Cambiamento del campo login*/
  @Output() isLoginChange = new EventEmitter<Boolean>();

  /**username data*/
  username: AuthField = new AuthField();
  /**username data*/
  email: AuthField = new AuthField();
  /**password data*/
  password: AuthField = new AuthField();
  /**Colore del bottone cancel*/
  colorCancel = ColorButtons.Blue;


  constructor(
    private userService : UserService,
    private dialogService : DialogManagerService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.resetField();
  }

  ngOnDestroy(): void {
    if(this.subscription != null){
      this.subscription.unsubscribe();
    }
  }

  /**
   * Reset degli input utente
   */
  resetField() {
    this.username = new AuthField();
    this.email = new AuthField();
    this.password = new AuthField();
  }

  /**
   * Azione di registrazione
   */
  register(){
    this.username.error = "";
    this.email.error = "";
    this.password.error = "";
    this.dialogService.showLoading('Checking credentials...');
    this.subscription =
      this.userService.registerNewUser(this.username.value, this.email.value, this.password.value,localStorage.getItem("uuid")!).subscribe( res => {
        this.dialogService.closeDialog();
        // Salva le credenziali e fa il redirect
        this.userService.saveCredentials(this.username.value, this.password.value, res.data, false);
        this.router.navigateByUrl("home");
      }, err =>  {
        this.dialogService.closeDialog();
        let errore = err.error.error
        if (errore != null) {
          //gestisco l'errore capendo prima il campo di riferimento e poi settando il relativo errore nella sezione corretta
          let field = errore.split(':')[0];
          let error = errore.split(':')[1];

          switch(field){
            case 'username' : this.username.error = error; break;
            case 'email' : this.email.error = error; break;
            case 'password' : this.password.error = error; break;
            default: this.dialogService.showError(error, () => {})
          }
        } else {
          this.dialogService.showError(err.error, () => {})
        }
      })
  }

  /**
   * Ritorno al login
   */
  cancel(){
    this.resetField();
    this.isLoginChange.emit(true);
  }

}
