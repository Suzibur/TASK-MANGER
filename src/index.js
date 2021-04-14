const express = require('express');
const path = require('path')
const User = require('./model/user');
const Task = require('./model/task');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const Port = process.env.PORT;
const app = express();
require('./db/mongoose');
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// const multer = require('multer');
// const upload = multer({
//     dest:'src/image'
// })
// app.post('/image', upload.single('upload'), (req,res) => {
//     res.send();
// })
app.listen(Port, () => {
    console.log(`Server is up on port ${Port}.`)
})