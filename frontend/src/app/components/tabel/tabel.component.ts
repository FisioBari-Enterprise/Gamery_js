import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabel',
  templateUrl: './tabel.component.html',
  styleUrls: ['./tabel.component.css']
})
export class TabelComponent implements OnInit {

  /** Lista parole da inserire */
  @Input() words: string[] = ['Apple', 'Orange', 'Banana', 'caio', 'Apple', 'Orange', 'Banana', 'caio']
  /** Lista parole inserite dall'utente */
  @Input() userWords : String[]

  /** Titolo indicante la fase in corso */
  title : String = "MEMORIZATION PHASE"
  /** Indica se si è in fase di inserimento o di memorizzazione */ 
  isInsert : Boolean = true
  

  /**Mostra le parole all'interno dell'area. */
  showWord : Boolean = true;

  constructor() {
    this.userWords = []
  }

  ngOnInit(): void {
  }

  addWord(word : String){
    this.userWords.push(word)
  }

}
