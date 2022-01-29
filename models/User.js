const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter a name']
    },
    avtar:{
       public_id:String,
       url:String
    },
    email:{
        type:String,
        required:[true,'please enter a email'],
        unique:[true,'email already exist']
    },
    password:{
        type:String,
        required:[true,'please enter a password'],
        minlength:[6,'password must be atleat 6 characters'],
        select : false
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :'User'
        }
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :'User'
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :'User'
        }
    ],
})

userSchema.pre('save', async function (next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10)

    }
    next()
 })

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateToken = function (){
   return jwt.sign({_id:this._id},process.env.JWT_SECRET)
}

module.exports = mongoose.model('User',userSchema)