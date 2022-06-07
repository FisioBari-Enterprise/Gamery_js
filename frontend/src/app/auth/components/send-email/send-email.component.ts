import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthField} from "../../classes/authField";
import {ColorButtons} from "../../../shared/enum/colorButtons";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {UserService} from "../../services/user.service";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {SimpleTextComponent} from "../../../dialogs/simple-text/simple-text.component";

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})
export class SendEmailComponent implements OnInit, OnDestroy {

  /** Campo per la email */
  email : AuthField
  /**Colore del bottone cancel*/
  colorCancel = ColorButtons.Blue;
  /** subscriptions per le richieste */
  subscriptions : Subscription[]

  constructor(
    private router : Router,
    private userService : UserService,
    private dialogManager : DialogManagerService
  ) { }

  ngOnInit(): void {
    this.subscriptions = []

  }

  ngOnDestroy() {
    this.subscriptions.forEach(item => item.unsubscribe())
  }

  sendEmail(){
    this.subscriptions.push(this.userService.sendEmail(this.email.value).subscribe(res => {
      this.dialogManager.showDialog(SimpleTextComponent,() => {},{data: "Email sent successfully"})
    }, err => {
      this.email.error = err.error
    }))
  }

  cancel(){
    this.router.navigateByUrl('home')
  }

}
