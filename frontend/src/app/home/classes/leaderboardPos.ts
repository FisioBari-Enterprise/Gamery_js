import {Game} from "../../game/classes/game";
import {Country} from "./country";

export class LeaderboardPosResponse {
  data: LeaderboardPos[];
}

export class LeaderboardPos {
  _id: String;
  game: Game;
  type: Number;
  country: Country;
  position: Number;
  prev_position: Number;
  createdAt: Date;
}
