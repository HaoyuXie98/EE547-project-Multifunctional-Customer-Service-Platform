'use strict';

const { mongo, Database } = require('./Database');
let database = new Database();

class Message{
    constructor() {}

    async newMsg(messageInfo){
        try{
            const pid = messageInfo.pid;
            const sid = messageInfo.sid;
            // delete messageInfo.pid;
            delete messageInfo.sid;
            const mid = await database.create_new('Message', messageInfo);
            this._updateUser(mid, pid, sid);
            this._updateSession(mid, sid);
            return true;
        }
        catch (err){
            return false;
        }
    }

    async _updateUser(mid, pid, sid){
        const person = await database.get(pid, 'Personnel');
        const index = person.sessions.indexOf(sid);
        if (index !== -1) {
            const sess = person.sessions.splice(index, 1);
            person.sessions.push(sess[0]);
        }
        database.update_one(person._id, person, 'Personnel');       
    }

    async _updateSession(mid, sid){
        console.log('sid', sid);
        const sess = await database.get(sid, 'Session');
        sess.last_update = new Date();
        sess.messages.push(mid)
        database.update_one(sid, sess, 'Session');
        console.log(sid, sess);
    }
}

module.exports = Message;