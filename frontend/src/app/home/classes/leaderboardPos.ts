import {Country} from "./country";
import {UserInfo} from "../../classes/UserResponse";

export class LeaderboardPosResponse {
  data: LeaderboardPos[];
}

export class LeaderboardPosClientResponse {
  data: LeaderboardPos;
}

export class LeaderboardPos {
  _id: String;
  game: LeaderboardGame;
  type: number;
  country: Country;
  position: number;
  prev_position: number;
  createdAt: Date;
}

export class LeaderboardGame {
  _id: string;
  user: UserInfo;
  points: number;
}
