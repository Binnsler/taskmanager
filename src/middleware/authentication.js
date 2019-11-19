const jwt = require( "jsonwebtoken" );
const User = require( "../models/user" );

const authentication = async ( request, response, next ) => {
    try{
        const token = request.header( "Authorization" ).replace( "Bearer ", "" );
        const decoded = jwt.verify( token, process.env.JWT_SECRET );
        const user = await User.findOne( { "_id": decoded._id, "tokens.token": token } );

        if( !user ){
            throw new Error();
        }

        request.user = user;
        request.token = token;

        next();
    }
    catch( error ){
        response.status( 401 ).send( {
            "error": "Please authenticate"
        } );
    }
};

module.exports = authentication;
