import {Component, Input, OnInit} from '@angular/core';
import {Statistics} from "../../../classes/UserResponse";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  @Input() statistics : Statistics

  constructor() { }

  ngOnInit(): void {
  }

  getTime(time : number){
    let second = time;
    let minutes = 0;
    let hour = 0;
    if (second > 60){
      minutes = Math.trunc(time / 60);
      second = second % 60;

      if(minutes > 60){
        hour = Math.trunc(minutes / 60);
        minutes = minutes % 60;
      }
    }
    let timeS = ""
    if(hour !== 0){
      timeS = timeS + hour + "h"
    }
    if(minutes !== 0){
      timeS = timeS + minutes + "m"
    }
    timeS = timeS + second + "s"

    return  timeS
  }

}
