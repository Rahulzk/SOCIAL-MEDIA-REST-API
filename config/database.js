const mongoose = require('mongoose')

exports.connectDatabase = () =>{
    mongoose.connect(process.env.MONGO_URL,{
       useNewUrlParser : true,
    //    useCreateIndex : true,
    //    useFindandModify : false,
       useUnifiedTopology : true

    }).then((con)=> console.log(`Database connected : ${con.connection.host}`))
    .catch((err)=>console.log(err))
}