const request = require( "supertest" );
const app = require( "../src/app" );
const User = require( "../src/models/user" );
const {
    firstUserId,
    firstUser,
    populateDatabase
} = require( "./fixtures/db" );

beforeEach(
    populateDatabase
);

test( "Should sign up a new user", async () => {
    const response = await request( app )
        .post( "/users" )
        .send( {
            "name": "ExJamie",
            "email": "exjamie@gmail.com",
            "password": "customSecret1!"
        } )
        .expect( 201 );

    // Assert user was actually created
    const user = await User.findById( response.body.user._id );

    expect( user ).not.toBeNull();

    // Assert user matches
    expect( response.body ).toMatchObject( {
        "user": {
            "name": "ExJamie",
            "email": "exjamie@gmail.com"
        },
        "token": user.tokens[0].token
    } );

    expect( user.password ).not.toBe( "customSecret1!" );
} );

test( "Should login existing user", async () => {
    const response = await request( app )
        .post( "/users/login" )
        .send( {
            "email": firstUser.email,
            "password": firstUser.password
        } )
        .expect( 200 );

    const user = await User.findById( firstUserId );

    expect( response.body.token ).toEqual( user.tokens[1].token );
} );

test( "Should not login non-existant user", async () => {
    await request( app )
        .post( "/users/login" )
        .send( {
            "email": "fake@nonexistant.com",
            "email": "nonexistant1!"
        } )
        .expect( 400 );
} );

test( "Should fail on unauthenticated GET user", async () => {
    await request( app )
        .get( "/users/me" )
        .expect( 401 );
} );

test( "Should get profile for authenticated user", async () => {
    await request( app )
        .get( "/users/me" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}`)
        .expect( 200 );
} );

test( "Should fail on unauthenticated DELETE user", async () => {
    await request( app )
        .delete( "/users/me" )
        .expect( 401 );
} );

test( "Should delete profile for authenticated user", async () => {
    await request( app )
        .delete( "/users/me" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}` )
        .expect( 200 );

    const user = await User.findById( firstUserId );

    expect( user ).toBeNull();
} );

test( "Should upload avatar image", async () => {
    await request( app )
        .post( "/users/me/avatar" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}` )
        .attach( "avatar", "tests/fixtures/profile-pic.jpg" )
        .expect( 200 );

    const user = await User.findById( firstUserId );

    expect( user.avatar ).toEqual( expect.any( Buffer ) );
} );

test( "Should update valid user fields", async () => {
    await request( app )
        .patch( "/users/me" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}` )
        .send( {
            "name": "Kristin"
        } )
        .expect( 200 );

    const user = await User.findById( firstUserId );

    expect( user.name ).toBe( "Kristin" );
} );

test( "Should not update invalid user fields", async () => {
    await request( app )
        .patch( "/users/me" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}` )
        .send( {
            "location": "Boston"
        } )
        .expect( 400 );
} );
