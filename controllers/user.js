const Post = require('../models/Post.js');
const User = require('../models/User.js')


// register with unique email id
exports.register = async (req,res) =>{
    try {
        const {name,email,password} = req.body;

        let user = await User.findOne({email});
        if(user)res.status(500).json({msg:'user already exist'})

       user = await User.create({name , email,password,avtar:{ public_id:'sample_id',url:'sample_url'}})

       const token = await user.generateToken()

        res.status(201).cookie('token',token,{
            expires:new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true
        }).json({user,token})

    } catch (error) {
        res.status(500).json(error)
    }
}

// login with email
exports.login = async (req,res) =>{

    try {
        const {email,password} = req.body;


        const user = await User.findOne({email}).select("+password")
        if(!user)res.status(400).json({msg:'wrong credensials'})

        const isMatch = await user.matchPassword(password)
        if(!isMatch)res.status(400).json({msg:'incoorect password'})

        const token = await user.generateToken()

        res.status(200).cookie('token',token,{
            expires:new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true
        }).json({user,token})

    } catch (error) {
        res.status(500).json(error)
    }
}

// logout
exports.logout = async (req,res) =>{
    try {
        res.status(200).cookie('token',null,{expires:new Date(Date.now()),httpOnly:true}).json({message:'logged out'})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}

// follow user
exports.followUser = async (req,res)=>{
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggeduser = await User.findById(req.user._id)

        if(!userToFollow){
            return res.status(404).json({msg : 'user not found'})
        }

        if(loggeduser.following.includes(userToFollow._id)){

           const indexfollowing = loggeduser.following.indexOf(userToFollow._id);
           loggeduser. following.splice(indexfollowing,1);

           const indexfollowers = userToFollow.followers.indexOf(loggeduser._id)
           userToFollow.followers.splice(indexfollowers,1);

           await loggeduser.save();
           await userToFollow.save()

           res.status(200).json({msg : 'user Unfollowed'})

        }

        else{
            loggeduser.following.push(userToFollow._id);
            userToFollow.followers.push(loggeduser._id);

            await loggeduser.save();
            await userToFollow.save()

            res.status(200).json({msg : 'user followed'})
        }





        

    } catch (error) {
        res.status(401).json({msg : error.message})
    }
}

// update
exports.updatePassword = async (req,res) =>{
    try {
        const user = await User.findById(req.user._id).select('password')

        const {oldPassword,newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return res.status(201).json({
                error : 'please provide oldpassword and newPassword'
            })
        }

        const isMatch = await user.matchPassword(oldPassword)
        if(!isMatch){
            return res.status(201).json({
                error : 'password do not match'
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message : 'password updated succesfully'
        })

    } catch (error) {
        res.status(400).json({error : error.message})
    }
}


exports.updateProfile = async (req,res) =>{
    try {
        const user = await User.findById(req.user._id)

        const { name, email } = req.body;

        if(name){
            user.name = name
        }
        if(email){
            user.email = email
        }

        // user.avtar = 100

        await user.save();
        res.status(200).json({message:'profile updated successfully'})

    } catch (error) {
        res.status(400).json({error : error.message})
    }
}

exports.deleteMyProfile = async (req,res) =>{
    try {
        const user = await User.findById(req.user._id)
        const posts = user.posts;
        await user.remove()

        // logout user after deleting profile
        res.cookie('token',null,{expires:new Date(Date.now()),httpOnly:true})


        // deleting all posts of user
        for (let index = 0; index < posts.length; index++) {
            const post = await Post.findById(posts[index]) 
            await post.remove()   
        }

        // deleting from followers

        res.status(200).json({message : 'Account deleted'})


    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

exports.myProfile = async (req,res) =>{
    try {
        
        const user = await User.findById(req.user._id).populate("posts")

        res.status(200).json({user})



    } catch (error) {
       res.status(500).json({error:error.message}) 
    }
}

exports.findUser = async (req,res) =>{
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({error:'user not found'})
        }
        return res.status(200).json({user})

    } catch (error) {
        res.status(500).json({error:error.message}) 
        
    }
}