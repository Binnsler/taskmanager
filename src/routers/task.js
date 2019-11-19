const express = require( "express" );
const Task = require( "../models/task" );
const router = new express.Router();
const authentication = require( "../middleware/authentication" );
const querystring = require( "querystring" );

router.post( "/tasks", authentication, async ( request, response ) => {
    request.body.owner = request.user._id;

    const task = new Task( request.body );

    try{
        const newTask = await task.save();

        response.status( 201 ).send( newTask );
    }
    catch( error ){
        response.status( 400 ).send( error );
    }
} );

// GET /tasks?filterKey=filterValue
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt_asc
router.get( "/tasks", authentication, async ( request, response ) => {
    const match = {};
    const sort = {};

    if( request.query.completed ){
        match.completed = request.query.completed === "true"
    }

    if( request.query.sortBy ){
        const parts = request.query.sortBy.split( ":" );

        sort[parts[0]] = parts[1] == "asc" ? -1 : 1;
    }

    try{
        await request.user.populate( {
            "path": "tasks",
            "match": match,
            "options": {
                "limit": parseInt( request.query.limit ),
                "skip": parseInt( request.query.skip ),
                "sort": sort
            }
        } ).execPopulate();

        response.send( request.user.tasks );
    }
    catch( error ){
        response.status( 500 ).send( error );
    }
} );

router.get( "/tasks/:id", authentication, async ( request, response ) => {
    try{
        const task = await Task.findOne( {
            "_id": request.params.id,
            "owner": request.user._id
        } );

        if( !task ){
            return response.status( 404 ).send();
        }

        response.send( task );
    }
    catch( error ){
        response.status( 500 ).send( error );
    }
} );

router.patch( "/tasks/:id", authentication, async ( request, response ) => {
    const updates = Object.keys( request.body );
    const allowedUpdates = [ "completed", "description" ];
    const isValidOperator = updates.every(
        ( task ) => allowedUpdates.includes( task )
    );

    if( !isValidOperator ){
        return response.status( 404 ).send( {
            "error": "Incorrect updates"
        } );
    }

    try{
        const updatedTask = await Task.findOne( { "_id": request.params.id, "owner": request.user._id } );

        if( !updatedTask ){
            return response.status( 400 ).send( {
                "error": `No task found with ID of ${request.params.id}`
            } )
        }

        updates.forEach(
            ( update ) => updatedTask[update] = request.body[update]
        );

        await updatedTask.save();

        response.status( 201 ).send( updatedTask );
    }
    catch( error ){
        response.status( 500 ).send( error );
    }
} );

router.delete( "/tasks/:id", authentication, async ( request, response ) => {
    try{
        const task = await Task.findOneAndDelete( {
            "_id": request.params.id,
            "owner": request.user._id
        } );

        if( !task ){
            return response.status( 404 ).send();
        }

        response.send( task );
    }
    catch( error ){
        response.status( 500 ).send( error );
    }
} );


module.exports = router;
