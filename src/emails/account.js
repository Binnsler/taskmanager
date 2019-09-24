const sgMail = require( "@sendgrid/mail" );

sgMail.setApiKey( process.env.SENDGRID_API_KEY );

const sendWelcomeEmail = ( email, name ) => {
    sgMail.send( {
        "to": email,
        "from": "jamie.m.binns@gmail.com",
        "subject": "Welcome to the App!",
        "text": `Hi ${name}, welcome to the application!`
    } );
};

const sendCancelEmail = ( email, name ) => {
    sgMail.send( {
        "to": email,
        "from": "jamie.m.binns@gmail.com",
        "subject": "Sorry to see you go",
        "text": `Hi ${name}, Looks like you cancelled your account. Anything we could have done better?`
    } );
};

module.exports = {
    "sendWelcomeEmail": sendWelcomeEmail,
    "sendCancelEmail": sendCancelEmail
};
