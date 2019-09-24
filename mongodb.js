const {
    MongoClient,
    ObjectID
} = require( "mongodb" );
const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect( connectionURL, { "useNewUrlParser": true }, ( error, client ) => {
    let db;

    if( error ){
        /* eslint-disable no-console */
        return console.log( "Unable to connect to database, error", error );
    }

    db = client.db( databaseName );

    db.collection( "tasks" ).deleteOne(
        {
            "description": "Go for a walk"
        }
    )
    .then(
        ( response ) => {
            /* eslint-disable no-console */
            console.log( "deleteMany:response", response );
        }
    )
    .catch(
        ( error ) => {
            /* eslint-disable no-console */
            console.log( "deleteMany:error", error );
        }
    );
    /* eslint-disable no-console */
    console.log( "Connected correctly to database" );
} );
