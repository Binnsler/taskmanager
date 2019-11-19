const jwt = require( "jsonwebtoken" );
const mongoose = require( "mongoose" );
const User = require( "../../src/models/user" );
const Task = require( "../../src/models/task" );

const firstUserId = new mongoose.Types.ObjectId();
const firstUser = {
    "_id": firstUserId,
    "name": "First User",
    "email": "firstuser@gmail.com",
    "password": "firstSecret1!",
    "tokens": [
        {
            "token": jwt.sign( { "_id": firstUserId }, process.env.JWT_SECRET )
        }
    ]
};

const secondUserId = new mongoose.Types.ObjectId();
const secondUser = {
    "_id": secondUserId,
    "name": "Second User",
    "email": "seconduser@gmail.com",
    "password": "secondSecret1!",
    "tokens": [
        {
            "token": jwt.sign( { "_id": secondUserId }, process.env.JWT_SECRET )
        }
    ]
};

const firstTask = {
    "_id": new mongoose.Types.ObjectId(),
    "description": "Description of firstTask",
    "completed": false,
    "owner": firstUser._id
};

const secondTaskId = new mongoose.Types.ObjectId();
const secondTask = {
    "_id": secondTaskId,
    "description": "Description of secondTask",
    "completed": true,
    "owner": firstUser._id
};

const thirdTask = {
    "_id": new mongoose.Types.ObjectId(),
    "description": "Description of thirdTask",
    "completed": true,
    "owner": secondUser._id
};

const populateDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User( firstUser ).save();
    await new User( secondUser ).save();
    await new Task( firstTask ).save();
    await new Task( secondTask ).save();
    await new Task( thirdTask ).save();
};

module.exports = {
    "firstUserId": firstUserId,
    "firstUser": firstUser,
    "secondUser": secondUser,
    "secondTaskId": secondTaskId,
    "populateDatabase": populateDatabase
};
