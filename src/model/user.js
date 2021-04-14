const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password".')
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps:true
});

userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//Generate token for per logging.
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token});
    user.save();
    return token;
}

userSchema.methods.toJSON = function(){
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;
    return userObj;
}
//User login confirmation.
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email:email})
    if(!user){
        return false;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return false;
    }
    return user;
}
// For encrypt password.
userSchema.pre('save', async function (next) {
    const user = this;
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
        user.tokens=[];
    }
    next();
})
//For Delete all data 
userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
})
const User = mongoose.model('User', userSchema);

module.exports = User;