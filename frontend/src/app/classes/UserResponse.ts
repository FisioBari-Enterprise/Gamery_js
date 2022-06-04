export class UserResponse {
    data : UserInfo
}

export class UserInfo{
    _id : String;
    username : String;
    uuid : String;
    active : Boolean;
    country: Country;
    statistics: Statistics;
    preferences: Preferences;
    settings : Settings;
    createdAt : Date;
    updatedAt : Date;
    __v : Number
}

export class Country{
  _id: String;
  code: String;
  name: String;
}

export class Statistics {
  game_time : number;
  tot_games: number;
  tot_points: number;
  max_points : number;
  best_placement : number;
}

export class Preferences {
  language : Number;
  colors_icon : String[];
  orientation_icon: Number;
}

export class Settings {
  font_size : Number;
  volume : Number;
  sound : Boolean;

}
