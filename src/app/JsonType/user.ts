import { gameStats } from 'src/app/JsonType/gameStats' 
import { room } from './room';

export interface user {
    id : number;
    nickname : string;
    mail: string;
    game_stats: gameStats,
    friends : user[],
    rooms : room[]
}