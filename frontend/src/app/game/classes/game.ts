import {RoundWord} from "./word";

export class GameResponse {
  data: Game
}

export class Games {
  data : Game[]
}

export class GameRoundResponse {
  data: GameRound
}

export class GameRounds {
  data : GameRound[]
}

export class GameRound {
  _id : string;
  game: Game;
  round: number;
  points: number;
  correct: boolean;
  words: RoundWord[];
}

export class Game {
  _id:                     string;
  user:                    string;
  game_time:               number;
  points:                  number;
  record:                  boolean;
  max_round:               number;
  remaining_pause:         number;
  memorize_time_for_round: number;
  writing_time_for_round:  number;
  complete:                boolean;
  language:                number;
  createdAt:               Date;
  updatedAt:               Date;
  __v:                     number;
}

export enum Languages{
  IT = 0,
  EN = 1
}
