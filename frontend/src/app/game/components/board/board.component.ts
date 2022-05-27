import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BoardType, BoardTypeMaxValue} from "../../enum/boardType";
import {Observable, Subscription} from "rxjs";
import {OnChangeBoard} from "../../classes/onChangeBoard";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {
  /**Numero massimo che può raggiungere*/
  maxValue: number = 0;
  /**Valore di ogni numero*/
  valueNumbers: number[] = [];
  /**Numero da mostrare*/
  valueNumbersString: string = "";

  /**Subscription dell'evento di cambiamento*/
  private onChangeSubscription: Subscription;

  /**Tipo di tabellone. Default = BoardType.Score*/
  @Input() boardType: BoardType = BoardType.Time;
  /**Evento per incrementare il numero */
  @Input() onChange: Observable<OnChangeBoard>;

  constructor() { }

  ngOnInit(): void {
    this.loadMaxValueAndFont();
    this.resetValueNumbers();
    // Evento per l'aggiornamento
    if (this.onChange != null) {
      this.onChangeSubscription = this.onChange.subscribe((data) => {
        this.updateValueNumbers(data);
      });
    }
  }

  ngOnDestroy(): void {
    if(this.onChangeSubscription != undefined)
      this.onChangeSubscription.unsubscribe();
  }

  /**
   * Imposta il valore massimo
   */
  loadMaxValueAndFont() {
    switch(this.boardType) {
      case BoardType.Time:
        this.maxValue = BoardTypeMaxValue.Time;
        break;
      case BoardType.Score:
        this.maxValue = BoardTypeMaxValue.Score;
        break;
      case BoardType.Level:
        this.maxValue = BoardTypeMaxValue.Level;
        break;
    }
  }

  /**
   * In base al tipo di tabellone ritorna la locazione dell'immagine
   * @returns Locazione dell'immagine in base al tipo
   */
  getImageUrl(): string {
    let name: string | null = null;
    switch (this.boardType) {
      case BoardType.Time: name = 'time.png'; break;
      case BoardType.Score: name = 'score.png'; break;
      case BoardType.Level: name = 'level.png'; break;
    }
    return `url(../assets/game/${name})`;
  }

  /**
   * Incrementa il valore di valueNumbers
   * @param data dati per l'incremento
   */
  updateValueNumbers(data: OnChangeBoard) {
    // Numero corrente
    let currentNumber = parseInt(this.valueNumbersToString(false));
    // Modifica i dati
    if(!data.reset && !data.resetWithValue) {
      currentNumber += data.value;
    } else if (data.resetWithValue) {
      currentNumber = data.value;
    } else {
      this.resetValueNumbers();
    }
    // Salva il cambiamento. Se va in overflow riparte da 0
    if (currentNumber <= this.maxValue && currentNumber >= 0) {
      const division = currentNumber.toString().split('');
      for (let i = this.valueNumbers.length - 1, y = division.length - 1; i >= 0; i--, y--) {
        this.valueNumbers[i] = y >= 0 ? parseInt(division[y]) : 0;
      }
      // Controlla se si trova nel caso del tempo così da fare un translate left di uno
      if (this.boardType === BoardType.Time) {
        for(let i = 1; i < this.valueNumbers.length - 1; i++) {
          this.valueNumbers[i] = this.valueNumbers[i + 1];
        }
        this.valueNumbers[0] = -1;
        this.valueNumbers[5] = -1;
      }
    } else {
      this.resetValueNumbers();
    }
    // Aggiorna il numero da mostrare
    this.valueNumbersString = this.valueNumbersToString();
  }


  /**
   * Resetta valueNumbers
   */
  resetValueNumbers() {
    for(let i = 0; i < 6; i++) {
      this.valueNumbers.push(this.boardType === BoardType.Time && (i === 0 || i === 5) ? -1 : 0);
    }
    this.valueNumbersString = this.valueNumbersToString();
  }

  /**
   * Converte in stringa il numero rappresentato nel array
   */
  valueNumbersToString(addSignature: boolean = true): string {
    let newValue = this.valueNumbers.map(item => item > -1 ? item.toString() : "").join('');
    if (addSignature) {
      if (this.boardType == BoardType.Time) {
        newValue = `${newValue.slice(0, 2)} : ${newValue.slice(2, 4)}`
      } else if (this.boardType == BoardType.Score) {
        newValue = `${newValue.slice(0, 3)}.${newValue.slice(3, 6)}`
      } else if (this.boardType == BoardType.Level) {
        newValue = parseInt(newValue).toString();
      }
    }
    return newValue;
  }

}
