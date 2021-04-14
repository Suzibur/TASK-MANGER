const sgMail = require('@sendgrid/mail')
// const sendGridApiKey = 'SG.hjCjF_32SGCDUUN50F-2tA.AZ8y3uZGTyWxsrOD9ZsiO2D_ZnzWIFJnDG-nCKY8yCI';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to: email,
        from:'suzibur@gmail.com',
        subject:'Thanks for joining in.',
        text:`Welcome to the app, ${name}.`
    })
}
const sendCancelEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'suzibur@gmail.com',
        subject:'Account deleted successfully.',
        text:`Goodbye ${name}, hope you came back soon.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}