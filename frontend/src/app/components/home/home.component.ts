import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../auth/services/user.service";
import {Subscription} from "rxjs";
import {TokenData} from "../../classes/web/TokenResponse";
import {DialogManagerService} from "../../services/dialog-manager.service";
import { HomeService } from '../../services/home.service';
import { UserResponse } from '../../classes/UserResponse';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  /**Sottoscrizioni delle richieste web*/
  allSubscriptions: Subscription[] = [];

  constructor(
    private dialog: DialogManagerService,
    private userService: UserService,
    private homeService : HomeService
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(item => item.unsubscribe());
  }

}
