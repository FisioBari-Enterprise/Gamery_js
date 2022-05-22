import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {OnChangeBoard} from "../../classes/onChangeBoard";

@Component({
  selector: 'app-home-game',
  templateUrl: './home-game.component.html',
  styleUrls: ['./home-game.component.css']
})
export class HomeGameComponent implements OnInit {
  /**Modifiche al tempo*/
  timeSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();
  /**Modifiche allo score*/
  scoreSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();
  /**Modifiche al livello*/
  livelloSubject: Subject<OnChangeBoard> = new Subject<OnChangeBoard>();

  /**Indica se creare una nuova partita o meno*/
  @Input() newGame: boolean = true;

  constructor(

  ) {  }

  ngOnInit(): void {

  }

}
