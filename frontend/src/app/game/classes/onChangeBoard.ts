export class OnChangeBoard {
  value: number;
  reset: boolean;
  resetWithValue: boolean;
  isTime: boolean;
  valuetime : number;

  /**
   * Costrutto per settare i dati
   * @param value
   * @param reset
   * @param resetWithValue
   */
  constructor(value=0, reset=false, resetWithValue=false, isTime = false) {
    this.value = value;
    this.valuetime = value;
    this.reset = reset;
    this.resetWithValue = resetWithValue;
    this.isTime = isTime;
    this.changeTime();
  }

  changeTime(){
    if(this.isTime){
      let time = [Math.trunc(this.valuetime / 60), this.valuetime % 60]
      let timeS = time.map(item => item.toString());
      this.value = parseInt(timeS.join(''))
    }
  }

  updateValue(newValue = -1){
    this.value += newValue;
    if(this.isTime)
    {
      this.valuetime += newValue;
    }
    this.changeTime();
  }
}
