import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  /** Immagine da inserire */
  @Input() image : String;
  /** Testo della card*/
  @Input() text : String;
  /** Azione da eseguire premendo la card*/
  @Output() OnClick : EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onClick(){
    this.OnClick.emit();
  }

}
