import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tabel',
  templateUrl: './tabel.component.html',
  styleUrls: ['./tabel.component.css']
})
export class TabelComponent implements OnInit {

  /** Lista parole da inserire */
  @Input() words: string[] = []
  /** Lista parole inserite dall'utente */
  @Input() userWords : string[] = [];
  /** Indica parola selezionata */
  @Output() indexSelected : EventEmitter<number> = new EventEmitter<number>();

  /** Indica se si è in fase di inserimento o di memorizzazione */
  @Input() isMemorization : Boolean = false;

  /** Titolo indicante la fase in corso */
  title : String = "MEMORIZATION PHASE"

  /**Mostra le parole all'interno dell'area. */
  @Input() showWord : Boolean = true;

  constructor() {

  }

  ngOnInit(): void {
  }

  selectedBox(index : number){
    //ritorno la parola selezionata
    if (this.isMemorization) {
      return;
    }
    this.indexSelected.emit(index);
  }

}
