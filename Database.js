'use strict';
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const {exit} = require("process");
const fs = require('fs');
const { compile } = require('ejs');


class Database {
    async create_new(new_type, object) { // type: String "Personnel", "Session", or "Message"; object: Dictionary 
        if (new_type == "Personnel") {
            object.created_at = new Date();
            console.log("new_type", new_type);
            object.name = object.username;
            object.role = null;
            object.sessions = [];
            object.recent = null;
        } else if (new_type == "Session") {
            object.created_at = new Date();
            console.log("new_type", new_type);
            object.last_update = new Date();
        } else if (new_type == "Message") {
            console.log("new_type", new_type);
        }
        let ans = await mongo.DB.collection(new_type).insertOne(object);
        const insertedId = ans.insertedId;
        return insertedId;
    }

    async add(id, type, id_added) { // type: String: "session" or "message", id: ObjectID 
        // const object = await mongo.DB.collection(type).findOne({"_id": new ObjectId(id)});
        if (type === "Personnel") mongo.DB.collection(type).findOne({"name": id}).sessions.pushback(id_added);
        else if (type === "Session") mongo.DB.collection(type).findOne({"_id": new ObjectId(id)}).message.pushback(id_added);
        await mongo.DB.collection(type).updateOne({"_id": new ObjectId(id)}, {"$set": object});
    }

    async update_one(id, object, type) {
      await mongo.DB.collection(type).updateOne({"_id": new ObjectId(id)}, {"$set": object});
    }

    async password(name) {
        let user = await mongo.DB.collection('Personnel').findOne({ name: name });
        if (user) return user.password;
        else return null;
    }

    async search_chat_history(sessionID, searchTerm) {
        // Step 1: Retrieve the session
        // console.log('here');
        const session = await mongo.DB.collection("Session").findOne({ _id: new ObjectId(sessionID) });
        const messageIDs = session.messages; 
        // console.log('messageIDs', messageIDs);
        if (searchTerm != null) {
          
          // Step 2: Retrieve the messages containing the search term
          const messages = await mongo.DB.collection("Message")
            .find({ _id: { $in: messageIDs }, "Message.content": { $regex: searchTerm, $options: "i" } })
            .toArray();
          return messages;
        } else if (searchTerm == null) {
            const messages = await mongo.DB.collection("Message").find({ _id:{ $in: messageIDs }}).toArray();
            // console.log('messages', messages);
            return messages;
        }
    }

    async get(id, type) { // type: String "Personnel", "Session", or "Message"; id: both String and ObjectID are ok 
        let object = null;
        if (type == "Session" || type == "Message") object = await mongo.DB.collection(type).findOne({ _id: new ObjectId(id) });
        else if (type == "Personnel") object = await mongo.DB.collection(type).findOne({ name: id });
        else return null;
        return object;
    }

    async get_all(type) { // type: String "Personnel", "Session", or "Message"
      let objects;
  
      if (type == "Personnel" || type == "Session" || type == "Message") {
          objects = await mongo.DB.collection(type).find().toArray();
      } else {
          return null;
      }
      return objects;
    }
}  
  
class MongoDB {
    constructor() {
        this.DB = null;
    }
    
    async connect() {
        let mongoConfig;
        try {
          let data = fs.readFileSync('./config/mongo.json');
          mongoConfig = JSON.parse(data);
        } catch (err) {
          console.error('Error reading mongo.json:', err);
          exit(2);
        }
        const uri = `mongodb://${mongoConfig.host}:${mongoConfig.port}?useUnifiedTopology=true`;
    
        try {
          const client = await MongoClient.connect(uri);
          this.DB = client.db(`${mongoConfig.db}`);
          console.log('Connected to MongoDB');
        } catch (err) {
          console.error('Error connecting to MongoDB:', err);
          exit(5);
        }
      }
}
  
const mongo = new MongoDB();
  mongo.connect()
  .then(() => {
    console.log('MongoDB connection established');
    // Additional initialization or code logic here
    // You can start using the `database` object
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    exit(5);
  });

module.exports = { mongo, Database };