import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {DialogManagerService} from "../../services/dialog-manager.service";

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
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(item => item.unsubscribe());
  }

}
