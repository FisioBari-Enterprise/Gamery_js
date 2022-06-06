import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserManagerService} from "../../services/user-manager.service";
import {Game} from "../../../game/classes/game";
import {Subscription} from "rxjs";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {SimpleTextComponent} from "../../../dialogs/simple-text/simple-text.component";
import {MatchInfoComponent} from "../match-info/match-info.component";

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit, OnDestroy {

  games : Game[]
  text: string[]

  @Output() showChange = new EventEmitter<boolean>();

  subscriptions : Subscription[]

  constructor(
    private userManager : UserManagerService,
    private dialogManager : DialogManagerService
  ) { }

  ngOnInit(): void {
    this.games = []
    this.text = []
    this.subscriptions = []
    this.getMatches();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(item => item.unsubscribe());
  }

  getMatches(){
     this.subscriptions.push(this.userManager.getGames().subscribe(res => {
       this.games = res.data
       for(let i = 0; i < this.games.length; i++){
         let stringa = "Data: " + this.games[i].createdAt.toString().split('T')[0] + " - Points:" + this.games[i].points
         this.text.push(stringa)
       }
     }, err => {
       if(err.error.error === 'No game found for this user'){
         this.dialogManager.showDialog(SimpleTextComponent, () => {
           this.showChange.emit(false)
         },{data: 'No game found for this user'});
       }
     }))
  }

  showMatch(i : number){
    this.dialogManager.showDialog(MatchInfoComponent, () => {}, {data: this.games[i]})
  }

}
