import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogManagerService } from 'src/app/services/dialog-manager.service';
import { AuthField } from '../../classes/authField';
import { UserService } from '../../services/user.service';

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
  

  constructor(
    private userService : UserService,
    private dialogService : DialogManagerService,
    private router : Router
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if(this.subscription != null){
      this.subscription.unsubscribe();
    }
  }

  /**
   * Azione di registrazione
   */
  register(){
    this.username.error = "";
    this.email.error = "";
    this.password.error = "";
    this.subscription = 
      this.userService.registerNewUser(this.username.value, this.email.value, this.password.value,localStorage.getItem("uuid")!).subscribe( res => {
        //aggiorno il token e lo uuid salvandoli nel localStorage
        localStorage.setItem('auth_token',res.data.access);
        localStorage.setItem('uuidUser',res.data.uuid!);
        this.router.navigateByUrl("home");
      }, err =>  {
        let errore = err.error.error
        console.log(errore)
        //gestisco l'errore capendo prima il campo di riferimento e poi settando il relativo errore nella sezione corretta
        let field = errore.split(':')[0];
        let error = errore.split(':')[1];

        console.log(error)
        switch(field){
          case 'username' : this.username.error = error; break;
          case 'email' : this.email.error = error; break;
          case 'password' : this.password.error = error; break;
          default : {
            this.dialogService.showError(error, () => {})
          }
        }
      })
  }

  /**
   * Ritorno al login
   */
  cancel(){
    this.isLoginChange.emit(true);
  }

}
