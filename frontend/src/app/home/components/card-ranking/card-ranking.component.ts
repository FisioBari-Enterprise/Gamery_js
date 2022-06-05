import {Component, Input, OnInit} from '@angular/core';
import { LeaderboardPos } from '../../classes/leaderboardPos';

@Component({
  selector: 'app-card-ranking',
  templateUrl: './card-ranking.component.html',
  styleUrls: ['./card-ranking.component.css']
})
export class CardRankingComponent implements OnInit {
  /**Dati da mostrare a video*/
  @Input() leaderboardData: LeaderboardPos | null =  null;

  constructor() { }

  ngOnInit(): void {

  }

}
