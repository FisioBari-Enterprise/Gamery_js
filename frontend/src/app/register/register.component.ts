import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Output() isLoginChange = new EventEmitter<Boolean>();

  constructor() { }

  ngOnInit(): void {

  }

  register(){

  }

  cancel(){
    this.isLoginChange.emit(true);
  }

}
