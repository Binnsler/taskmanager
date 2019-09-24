const mongoose = require( "mongoose" );
const validator = require( "validator" );
const bcrypt = require( "bcryptjs" );
const jwt = require( "jsonwebtoken" );
const Task = require( "./task" );

const userSchema = new mongoose.Schema(
    {
        "name": {
            "type": String,
            "required": true,
            "trim": true
        },

        "age": {
            "type": Number,
            "default": 0,
            validate( value ){
                if( value < 0 ){
                    throw new Error( "Age must be a positive number" );
                }
            }
        },

        "email": {
            "type": String,
            "required": true,
            "unique": true,
            "trim": true,
            "lowercase": true,
            validate( value ){
                if( !validator.isEmail( value ) ){
                    throw new Error( "You must submit a valid email" );
                }
            }
        },

        "password": {
            "type": String,
            "required": true,
            "trim": true,
            "minlength": 7,
            validate( value ){
                if( value.toLowerCase().includes( "password" ) ){
                    throw new Error( "Password cannot include 'password'" );
                }
            }
        },

        "tokens": [
            {
                "token": {
                    "type": String,
                    "required": true
                }
            }
        ],

        "avatar": {
            "type": Buffer
        }
    },
    {
        "timestamps": true
    }
);

userSchema.virtual(
    "tasks",
    {
        "ref": "Task",
        "localField": "_id",
        "foreignField": "owner"
    }
);

userSchema.methods.toJSON = function toJSON(){
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function generateAuthToken(){
    const token = jwt.sign(
        {
            "_id": this._id.toString()
        },
        process.env.JWT_SECRET
    );

    this.tokens = this.tokens.concat( { token } );

    await this.save();

    return token;
};

userSchema.statics.findByCredentials = async ( email, password ) => {
    const user = await User.findOne( { "email": email } );

    if( !user ){
        throw new Error( "Unable to login" );
    }

    const isMatch = await bcrypt.compare( password, user.password );

    if( !isMatch ){
        throw new Error( "Unable to login" );
    }

    return user;
};

// Hash plaintext password before saving
userSchema.pre( "save", async function preSave( next ){
    if( this.isModified( "password" ) ){
        this.password = await bcrypt.hash( this.password, 8 );
    }

    next();
} );

// Cascade delete user tasks when user is deleted
userSchema.pre( "remove", async function preSave( next ){
    await Task.deleteMany( { "owner": this._id } );

    next();
} );

const User = mongoose.model(
    "User",
    userSchema
);

module.exports = User;
