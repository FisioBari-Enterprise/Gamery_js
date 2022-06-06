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
    let text = 'This is a memory game where you have to remember the word the are shown on screen. \n\n ' +
      'The game is divided in two phases: \n ' +
      'MEMORIZATION PHASE: Some word are shown on screen. Try to remember more that you can in the time that is given \n' +
      'INSERT PHASE: Insert the word that you remember. If you insert all the word you pass the level. \n\n If you forget at least one the game is over';
    this.dialogManager.showDialog(SimpleTextComponent, () => {} , {data : text});
  }

}
