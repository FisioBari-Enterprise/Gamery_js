import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserManagerService} from "../../services/user-manager.service";
import {Game} from "../../../game/classes/game";
import {Subscription} from "rxjs";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {SimpleTextComponent} from "../../../dialogs/simple-text/simple-text.component";

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit, OnDestroy {

  matches : string[] = ["aa","aa","aa","afe","aa","rhi"]
  games : Game[]

  subscriptions : Subscription[]

  constructor(
    private userManager : UserManagerService,
    private dialogManager : DialogManagerService
  ) { }

  ngOnInit(): void {
    this.games = []
    this.subscriptions = []
    this.getMatches();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(item => item.unsubscribe());
  }

  getMatches(){
     this.subscriptions.push(this.userManager.getGames().subscribe(res => {
       this.games = res;
     }, err => {
       if(err.error.error === 'No game found for this user'){
         this.dialogManager.showDialog(SimpleTextComponent, 'No game found for this user');
       }
     }))
  }

  showMatch(i : number){

  }

}
