import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {UserInfo} from "../../../classes/UserResponse";

@Component({
  selector: 'app-home-ranking',
  templateUrl: './home-ranking.component.html',
  styleUrls: ['./home-ranking.component.css']
})
export class HomeRankingComponent implements OnInit, OnChanges {
  /**Link della bandiera associata all'utente*/
  userFlag: string = '';

  /** Informazioni dell'utente attivo */
  @Input() user: UserInfo | null = null;

  constructor() { }

  ngOnInit(): void {
    this.user = null;
    this.userFlag = '';
  }

  /**
   * Ottiene il link dell'immagine della bandiera
   */
  getFlagLink(){
    if (this.user == null || this.user!.country == null){
      return '';
    }
    return `https://flagcdn.com/84x63/${this.user!.country.code}.png`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Controlla il cambiamento del input user
    if (changes['user'] != null) {
      this.userFlag = this.getFlagLink();
      console.log(this.userFlag);
    }
  }

}
