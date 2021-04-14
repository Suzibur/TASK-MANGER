const express = require('express');
const Task = require('../model/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }
})
router.get('/tasks',auth, async (req, res) => {  
    const match = {};
    const sort = {}; 
    if(req.query.status){
        match.status = req.query.status === 'true';
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send(e);
    }
})
router.get('/task/:id',auth, async (req, res) => {
    const id = req.params.id;
    try{
        const task = await Task.findById(id);
        if(!task){
            return res.status(404).send();
        }
        await task.populate('owner').execPopulate();
        res.send(task);
    }catch (e){
        res.status(500).send(e);
    }
})
router.patch('/task/:id', auth, async (req,res) => {
    const id = req.params.id;
    const updates = Object.keys(req.body);
    const allowUpdates = ['description','status'];
    const isValidOperation = updates.every(update => allowUpdates.includes(update));

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid updates."})
    }

    try{
        // const task = await Task.findByIdAndUpdate(id, req.body, {new:true, runValidators:true});
        const task = await Task.findById(id);
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    } catch(e){
        res.status(500).send(e)
    }
})
router.delete('/task/:id', auth, async (req,res) => {
    const id = req.params.id;

    try{
        const task = await Task.findByIdAndDelete(id);
        
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
})

module.exports = router;