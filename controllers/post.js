const Post = require('../models/Post')
const User = require('../models/User')

exports.createPost = async (req,res) =>{
    try {

        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:req.body.public_id,
                url:req.body.url
            },
            owner:req.user._id
        }

        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id)

        user.posts.push(post._id);
        await user.save();
        
        res.status(200).json(post);

    } catch (error) {
        res.status(500).json({
            success:false,
            messsage : error.message
        })
    }
}

exports.deletePost = async (req,res) =>{
    try {
        
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({'msg':'post not found'})
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({'msg':'user unAuthorised'})
        }

        await post.remove();

        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(post._id)
        user.posts.splice(index,1);

        await user.save();


        res.status(200).json({'msg':'post deleted'})

    } catch (error) {
        res.status(400).json({'error':error.message})
    }
}

exports.likeAndUnlikePost = async (req,res) =>{
    try {
         const post = await Post.findById(req.params.id);

         if(!post){
             return res.status(404).json({'msg':'post not found'})
         }

         if(post.likes.includes(req.user._id)){
             const index = post.likes.indexOf(req.user._id);
             post.likes.splice(index,1);

             await post.save();
             return res.status(200).json({'msg':'post Unliked'})
         }else{
             post.likes.push(req.user._id)
             await post.save()
             return res.status(200).json({'msg':'post Liked'})

         }

    } catch (error) {
        res.status(400).json({'msg':error.message})
    }
}

exports.getPostOfFollowings = async (req,res) =>{
    try {
        
        const user = await User.findById(req.user._id)

        const posts = await Post.find({
            owner:{
                $in : user.following
            }
        })

        res.status(200).json({posts})





    } catch (error) {
       res.status(400).json({msg:error.messsage});  
    }
}

exports.updateCaption = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(500).json({error:'post not found'})
        }


        if(post.owner.toString() !== req.user._id.toString()){
            res.status(500).json({error:'unAutherised'})
        }

        post.caption = req.body.caption;
        await post.save()

        res.status(200).json({message:'caption updated'})

    } catch (error) {
        res.status(500).json({error:error.message})
    }
}