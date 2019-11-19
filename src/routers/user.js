const express = require( "express" );
const multer = require( "multer" );
const sharp = require( "sharp" );
const User = require( "../models/user" );
const router = new express.Router();
const authentication = require( "../middleware/authentication" );
const { sendWelcomeEmail, sendCancelEmail } = require( "../emails/account" );
const uploader = new multer( {
    "limits": {
        "fileSize": 1000000
    },
    fileFilter( request, file, callback ){
        if( !file.originalname.match( /\.(jpg|jpeg|png)$/ ) ){
            return callback( new Error( "File must be jpg, jpeg, or png" ) );
        }

        callback( undefined, true );
    }
} );

router.post( "/users", async ( request, response ) => {
    const user = new User( request.body );

    try{
        const token = await user.generateAuthToken();

        sendWelcomeEmail( user.email, user.name );

        response.status( 201 ).send( { user, token } );
    }
    catch( error ){
        response.status( 400 ).send( error );
    }
} );

router.post( "/users/login", async ( request, response ) => {
    try{
        const user = await User.findByCredentials( request.body.email, request.body.password );
        const token = await user.generateAuthToken();

        response.send( { user, token } );
    }
    catch( error ){
        response.status( 400 ).send();
    }
} );

router.post( "/users/logout", authentication, async ( request, response ) => {
    try{
        request.user.tokens = request.user.tokens.filter(
            ( token ) => token.token !== request.token
        );

        await request.user.save();

        response.send();
    }
    catch( error ){
        response.status( 500 ).send( error );
    }
} );

router.post( "/users/logoutAll", authentication, async ( request, response ) => {
    try{
        request.user.tokens = [];

        await request.user.save();

        response.send();
    }
    catch( error ){
        response.status( 500 ).send();
    }
} );

router.get( "/users/me", authentication, async ( request, response ) => {
    response.send( request.user );
} );

router.patch( "/users/me", authentication, async ( request, response ) => {
    const updates = Object.keys( request.body );
    const allowedUpdates = [ "name", "email", "password", "age" ];
    const isValidOperator = updates.every(
        ( update ) => allowedUpdates.includes( update )
    );

    if( !isValidOperator ){
        return response.status( 400 ).send( { "error": "Incorrect update values to PATCH" } );
    }

    try{
        updates.forEach(
            ( update ) => request.user[update] = request.body[update]
        );

        await request.user.save();

        response.send( request.user );
    }
    catch( error ){
        response.status( 400 ).send( error );
    }
} );

router.delete( "/users/me", authentication, async( request, response ) => {
    try{
        await request.user.remove();

        sendCancelEmail( request.user.email, request.user.name );

        response.send( request.user );
    }
    catch( error ){
        response.status( 500 ).send( error );
    }
} );

router.post( "/users/me/avatar", authentication, uploader.single( "avatar" ), async ( request, response ) => {
    const buffer = await sharp( request.file.buffer ).resize( { "width": 250, "height": 250 } ).png().toBuffer();

    request.user.avatar = buffer;

    await request.user.save();

    response.send();
}, ( error, request, response, next ) => {
    response.status( 400 ).send( {
        "error": error.message
    } );
} );

router.delete( "/users/me/avatar", authentication, async ( request, response ) => {
    request.user.avatar = undefined;

    await request.user.save();

    response.send();
} );

router.get( "/users/:id/avatar", async ( request, response ) => {
    try{
        const user = await User.findById( request.params.id );

        if( !user || !user.avatar ){
            throw new Error();
        }

        response.set( "Content-Type", "image/jpg" );

        response.send( user.avatar );
    }
    catch( error ){
        response.status( 400 ).send();
    }
} );

module.exports = router;
