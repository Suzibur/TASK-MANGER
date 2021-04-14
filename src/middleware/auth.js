const User = require('../model/user');
const jwt = require('jsonwebtoken');

const auth = async (req,res,next) => {
    try{
        const token = req.headers.authorization.replace('Bearer ', '');
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({_id:decodedToken._id, 'tokens.token':token});
        if(!user){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next()
    }catch(e){
        res.status(401).send({error:'Please authenticate.'});
    }
}
module.exports = auth;