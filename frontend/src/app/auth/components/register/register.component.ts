import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthField } from '../../classes/authField';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

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
    private subscription : Subscription,
    private router : Router
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Azione di registrazione
   */
  register(){
    this.subscription = 
      this.userService.registerNewUser(this.username.value, this.email.value, this.password.value,localStorage.getItem("uuid")!).subscribe( res => {
        localStorage.setItem('auth_token',res.data.access);
        localStorage.setItem('uuidUser',res.data.uuid!);
        this.router.navigateByUrl("home");
      }, err =>  {
        console.log(err);
      })
  }

  /**
   * Ritorno al login
   */
  cancel(){
    this.isLoginChange.emit(true);
  }

}
