export class Word {
  en : string;
  en_length: number;
  it : string;
  it_length: number;
}

export class RoundWord {
  word : Word;
  word_insert: string;
  correct: Boolean;
  points:  number;
}
