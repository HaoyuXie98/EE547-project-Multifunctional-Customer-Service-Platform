'use strict';

const { mongo, Database } = require('./Database');
const database = new Database();

class Personnel{
    constructor() {}

    async _signUpValidate(signupInfo) {
        const { username, password } = signupInfo;
        if (await database.password(username) == null){
            return true;
        }
        else{
            return false;
        }
    }

    async _logInValidate(loginInfo) {
        const { username, password } = loginInfo;
        if (await database.password(username) == password){
            console.log(password);
            return true;
        }
        else{
            return false;
        }
    }

    async signup(signupInfo) {
        if (await this._signUpValidate(signupInfo)) {
            database.create_new('Personnel', signupInfo);
            return true;
        }
        else{
            return false;
        }
    }

    async login(loginInfo){
        return await this._logInValidate(loginInfo);
    }

    async getPersonnel(pid){
        var personList = [];
        const personnelInfo = await database.get(pid, 'Personnel');
        // console.log('here', personnelInfo);
        if (personnelInfo == null) return [];
        const sidList = await personnelInfo.sessions;
        // console.log('sidList', sidList);
        for (const sid of sidList) {
            let sessionInfo = await database.get(sid, 'Session');
            // console.log('sessionInfo', sessionInfo);
            let p1 = sessionInfo.p1;
            let p2 = sessionInfo.p2;
            // console.log('p1', p1, 'pid', pid);
            if (p1 == pid){
                personList.push(p2);
            }
            else{
                personList.push(p1);
            }
        };
        console.log('personList', personList);
        return {sidList, personList};
    }

    async getAgent() {
        const personList = await database.get_all('Personnel');
        console.log("personList", personList);
        const agent = personList.find(person => person.name == 'colin');
        console.log("agent", agent);
        return agent;
    }
}

module.exports = Personnel;