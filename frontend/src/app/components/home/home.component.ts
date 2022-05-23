import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {DialogManagerService} from "../../services/dialog-manager.service";
import {Router} from "@angular/router";
import {ColorButtons} from "../../shared/enum/colorButtons";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  /**Colore del bottone play*/
  colorButton = ColorButtons.Yellow;

  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  /**
   * Evento del bottone di play
   */
  onPlayClick() {
    this.route.navigateByUrl('game');
  }

}
