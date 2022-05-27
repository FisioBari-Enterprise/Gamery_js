import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthField} from "../../classes/authField";
import {ColorButtons} from "../../../shared/enum/colorButtons";
import {Subscription} from "rxjs";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  /** Campo per la nuova password */
  password : AuthField
  /** Campo per la conferma della nuova password */
  passwordConfirm : AuthField
  /** Colo del bottone di cancel */
  colorCancel = ColorButtons.Blue;
  /** Subscription per fare la richiesta*/
  subscriptions : Subscription[]

  constructor(
    private userService : UserService
  ) { }

  ngOnInit(): void {
    this.subscriptions = []
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach( item => item.unsubscribe())
  }

  confirm(){
    this.password.error = '';
    this.passwordConfirm.error = '';
    this.subscriptions.push(this.userService.changePassword(this.password.value,this.passwordConfirm.value).subscribe(res => {
      console.log("Password cambiata con successo")
    }, err => {
      let error = err.error.split(':')
      if(error[1] === undefined) {
        console.log(err.error)
        return
      }
      switch (error[0]){
        case 'password': this.password.error = error[1]; break;
        case 'passwordConfirm': this.passwordConfirm.error = error[1]; break;
      }
    }))
  }

  cancel(){

  }

}
