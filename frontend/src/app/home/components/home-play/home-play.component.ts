import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserInfo} from "../../../classes/UserResponse";
import {ColorButtons} from "../../../shared/enum/colorButtons";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {SimpleTextComponent} from "../../../dialogs/simple-text/simple-text.component";

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

  constructor(
    private dialogManager : DialogManagerService
  ) { }

  ngOnInit(): void {

  }

  /**
   * Viene premuto il bottone di play
   */
  onPlayClick(): void {
    this.playClick.emit();
  }

  info() {
    let text = 'This is a game to improve your memory. You have to read and memorize the words that are shown on the screen. \n\n ' +
      'The rounds of the game are divided in two phases: \n ' +
      'MEMORIZATION PHASE: Some words are shown on the screen. Memorize as much words as possible in the given time\n' +
      'INSERT PHASE: Insert the words that you remember. If you insert all the words correctly you move on to the next round. \n\n If you forget or spell incorrectly one or more words, the game is over.';
    this.dialogManager.showDialog(SimpleTextComponent, () => {} , {data : text});
  }

}
