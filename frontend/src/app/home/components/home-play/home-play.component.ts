import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserInfo} from "../../../classes/UserResponse";
import {ColorButtons} from "../../../shared/enum/colorButtons";

@Component({
  selector: 'app-home-play',
  templateUrl: './home-play.component.html',
  styleUrls: ['./home-play.component.css']
})
export class HomePlayComponent implements OnInit {

  /**Colore del bottone play*/
  colorButton = ColorButtons.Yellow;

  /**Dati dell'utente*/
  @Input() user: UserInfo | null = null;
  /**Indica che è stato premuto il tasto di play*/
  @Output() playClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  /**
   * Viene premuto il bottone di play
   */
  onPlayClick(): void {
    this.playClick.emit();
  }

}
