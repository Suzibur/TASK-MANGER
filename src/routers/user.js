const express = require('express');
const User = require('../model/user');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail, sendCancelEmail} = require('../email/account');
const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
})
router.get('/users',auth, async (req, res) => {
    const allUsers = await User.find({});
    res.send(allUsers);
})
router.get('/user/me',auth, async (req, res) => {
    res.send(req.user);
})
router.patch('/user/update', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every(update => allowUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid operation." });
    }
    try {
        const user = req.user;
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        if(updates.includes('password')){
            const token = await user.generateAuthToken();
            return res.send({user,token})
        }
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
})
router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
})
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(500).send(e);
    }
})
router.post('/user/logout', auth, async (req, res) => {
    try{    
        req.user.tokens = req.user.tokens.filter( token => token.token !== req.token);
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
})
router.post('/user/logoutall', auth, async(req,res) => {
    try{
        const validateUser = await bcrypt.compare(req.body.password, req.user.password);
        if(!validateUser){
            return res.status(400).send(false);
        }
        req.user.tokens = [];
        await req.user.save();
        res.send('Logout from all devices.')
    }catch(e){
        res.status(500);
    }
})

const avatar = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cd){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            return cd(new Error('Image format is must be jpg,jpeg or png.'))
        }
        cd(undefined, true)
    }
})
router.post('/user/avatar/me', auth, avatar.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send('Image successfully uploaded.')
}, (error,req,res,next) => {
    res.send({error:error.message})
})
router.get('/users/:id/avatar', async (req,res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image');
        res.send(user.avatar);
    }catch(e){
        res.send({error:e.message});
    }
})
router.delete('/user/avatar/me/delete', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send('Image successfully deleted.')
})
module.exports = router;