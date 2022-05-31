import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {Router} from "@angular/router";
import {ColorButtons} from "../../../shared/enum/colorButtons";
import {UserInfo} from "../../../classes/UserResponse";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  /**Dati dell'utente*/
  userInfo: UserInfo | null = null;

  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  /**
   * Aggiorna i dati dell'utente
   * @param {UserInfo | null} event User passato dalla navbar
   */
  updateUser(event: any) {
    this.userInfo = event as UserInfo;
  }

  /**
   * Evento del bottone di play
   */
  onPlayClick() {
    this.route.navigateByUrl('game');
  }

}
