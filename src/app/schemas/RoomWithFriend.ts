import { RoomStats } from "./RoomStats";

export interface RoomWithFriend{
    server_name:	string,
    code:	string,
    creation_date: string,
    users_in_room: [string],
    roomStats:	RoomStats,
    levels:	[number],
    id:	number,
    public: boolean,
    online: boolean,
    friend: string
}