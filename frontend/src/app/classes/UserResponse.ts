export class UserResponse {
    data : UserInfo
}

export class UserInfo{
    _id : String;
    username : String;
    uuid : String;
    active : Boolean;
    statistics: Statistics;
    preferences: Preferences;
    settings : Settings;
    createdAt : Date;
    updatedAt : Date;
    __v : Number
}

export class Statistics {
  game_time : Number;
  tot_game: Number;
  tot_point: Number;
  max_points : Number;
  best_placement : Number;
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
