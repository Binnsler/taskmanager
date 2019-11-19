const express = require( "express" );
const app = express();
const userRouter = require( "./routers/user" );
const taskRouter = require( "./routers/task" );

// Run Mongoose ( requiring a file runs it )
require( "./db/mongoose.js" );

app.use( express.json() );
app.use( userRouter );
app.use( taskRouter );

module.exports = app;
