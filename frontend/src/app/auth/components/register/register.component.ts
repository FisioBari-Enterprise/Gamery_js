import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  /**Cambiamento del campo login*/
  @Output() isLoginChange = new EventEmitter<Boolean>();

  constructor(

  ) { }

  ngOnInit(): void {

  }

  /**
   * Azione di registrazione
   */
  register(){

  }

  /**
   * Ritorno al login
   */
  cancel(){
    this.isLoginChange.emit(true);
  }

}
