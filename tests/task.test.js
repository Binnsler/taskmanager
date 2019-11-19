const request = require( "supertest" );
const app = require( "../src/app" );
const Task = require( "../src/models/task" );
const User = require( "../src/models/user" );
const {
    firstUserId,
    firstUser,
    secondUser,
    secondTaskId,
    populateDatabase
} = require( "./fixtures/db" );

beforeEach(
    populateDatabase
);

test( "Should create task for user", async () => {
    const response = await request( app )
        .post( "/tasks" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}` )
        .send( {
            "description": "Test task here"
        } )
        .expect( 201 );

    const task = await Task.findById( response.body._id );

    expect( task ).not.toBeNull();
    expect( task.completed ).toBe( false );
} );

test( "Should fetch all tasks for a user", async () => {
    const response = await request( app )
        .get( "/tasks" )
        .set( "Authorization", `Bearer ${firstUser.tokens[0].token}` )
        .expect( 200 );

    expect( response.body.length ).toBe( 2 );
} );

test( "Should fail when secondUser tries to delete firstUser's task", async () => {
    await request( app )
        .delete( `/tasks/${secondTaskId}` )
        .set( "Authorization", `Bearer ${secondUser.tokens[0].token}` )
        .expect( 404 );

    const task = Task.findById( secondTaskId );

    expect( task ).not.toBeNull();
} );
