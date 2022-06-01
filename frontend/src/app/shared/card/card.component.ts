import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  /** Immagine da inserire */
  @Input() image : String = "";
  /** Testo della card*/
  @Input() text : String = "";
  /** Imposta una lunghezza al componente */
  @Input() width: number | null = null;
  /** Indica se visualizzare o meno la freccia */
  @Input() showArrow : boolean = true;
  /**Indica se il bottone è selezionato*/
  @Input() isSelected : boolean = false;

  /** Azione da eseguire premendo la card*/
  @Output() OnClick : EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  onClick(){
    this.OnClick.emit();
  }

}
