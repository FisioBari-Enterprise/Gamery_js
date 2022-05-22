import { Component, OnInit } from '@angular/core';
import {BoardType} from "../../enum/boardType";
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

  constructor() {
  }

  ngOnInit(): void {
    const asd = setInterval( () => {
      this.testInterval();
      clearInterval(asd);
    }, 1000);
  }

  testInterval() {
    let n = -1;
    let i = setInterval(() => {
      if (n < 0) {
        this.timeSubject.next(new OnChangeBoard(20, false, true));
        n = 20;
      } else {
        this.timeSubject.next(new OnChangeBoard(-1));
        n -= 1;
      }
      if (n === 0){
        clearInterval(i)
      }
    }, 1000);
  }

}
