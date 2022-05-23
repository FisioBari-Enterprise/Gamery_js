import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ColorButtons} from "../enum/colorButtons";

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  /**Immagine da mostrare*/
  @Input() image: string | null = "pause-button";
  /**Testo da mostrare*/
  @Input() title: string = "TITLE";
  /**Schema del colore da mostrare*/
  @Input() colorSchema: any = ColorButtons.Red;
  /**Imposta il left al 50% per metterlo al centro*/
  @Input() setCenter: boolean = false;
  /**Evento di onClick*/
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  /**
   * Evento di onClick
   */
  onClickButton() {
    this.onClick.emit();
  }

}
