import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabel',
  templateUrl: './tabel.component.html',
  styleUrls: ['./tabel.component.css']
})
export class TabelComponent implements OnInit {

  @Input() words: string[] = ['Apple', 'Orange', 'Banana', 'caio', 'Apple', 'Orange', 'Banana', 'caio']

  title : String = "MEMORIZATION PHASE" 
  isInsert : Boolean = true
  userWords : String[]

  constructor() {
    this.userWords = []
  }

  ngOnInit(): void {
  }

  addWord(word : String){
    this.userWords.push(word)
  }

}
