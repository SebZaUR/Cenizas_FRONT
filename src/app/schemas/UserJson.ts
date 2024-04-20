import { gameStats } from 'src/app/schemas/gameStats' 
import { FriendRequest } from './FriendRequest';

export interface UserJson {
    id : number;
    nickname : string;
    mail: string;
    game_stats: gameStats,
    friends : [string],
    rooms : [number],
    friendRequest:FriendRequest
}