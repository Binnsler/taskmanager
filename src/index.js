const app = require( "./app" );

app.listen( process.env.PORT, () => {
    /* eslint-disable no-console */
    console.log( `Server is up on port ${process.env.PORT}` );
} );
