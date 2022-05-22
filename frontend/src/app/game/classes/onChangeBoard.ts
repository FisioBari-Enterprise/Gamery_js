export class OnChangeBoard {
  value: number;
  reset: boolean;
  resetWithValue: boolean;

  /**
   * Costrutto per settare i dati
   * @param value
   * @param reset
   * @param resetWithValue
   */
  constructor(value=0, reset=false, resetWithValue=false) {
    this.value = value;
    this.reset = reset;
    this.resetWithValue = resetWithValue;
  }
}
