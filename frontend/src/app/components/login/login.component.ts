import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public isLogin : Boolean

  constructor() { }

  ngOnInit(): void {
    this.isLogin = true;
  }


  passwordForgotten(){
    console.log("sdfgh")
  }

  login(){
  }

  register(){
    this.isLogin=false

  }
}