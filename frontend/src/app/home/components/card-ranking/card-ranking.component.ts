import {Component, Input, OnInit} from '@angular/core';
import { LeaderboardPos } from '../../classes/leaderboardPos';

@Component({
  selector: 'app-card-ranking',
  templateUrl: './card-ranking.component.html',
  styleUrls: ['./card-ranking.component.css']
})
export class CardRankingComponent implements OnInit {
  /**Dati della classifica da mostrare a video*/
  @Input() leaderboardData: LeaderboardPos | null =  null;
  /**Indica se aggiunge una certa quantità di margine alla base del componente*/
  @Input() spacingBottom: number | null = null;

  constructor() { }

  ngOnInit(): void {

  }

  /**
   * Ottiene la differenza della posizione
   */
  getPositionDiff() {
    if (this.leaderboardData == null) {
      return 0;
    }
    return Math.abs(this.leaderboardData.position - this.leaderboardData.prev_position);
  }

}
