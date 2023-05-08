'use strict';

const { mongo, Database } = require('./Database');
let database = new Database();

class Message{
    constructor() {}

    async newSession(sessionInfo){
        try{
            const p1 = sessionInfo.p1;
            const p2 = sessionInfo.p2;
            // const created_at = sessionInfo.created_at;
            sessionInfo.created_at = new Date();
            const sid = await database.create_new('Session', sessionInfo);
            this._updateUser(sid, p1);
            this._updateUser(sid, p2);
            return {p2, sid};
        }
        catch (err){
            return {sid, sid};
        }
    }

    async _updateUser(sid, pid){
        const person = await database.get(pid, 'Personnel');
        console.log(`${pid} info:`,person);
        person.sessions.push(sid);
        database.update_one(person._id, person, 'Personnel');     
    }

    async getSession(sid){
        var msgList = database.search_chat_history(sid, null);
        return msgList;
    }

}

module.exports = Message;