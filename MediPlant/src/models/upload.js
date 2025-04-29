const mongoose=require("mongoose");

const UploadSchema=new mongoose.Schema({
    botanical_name:{
        type:String,
        required:true
    },
    english_name:{
        type:String,
        required:true
    },
    hindi_name:{
        type:String,
        required:true
    },
    disease:{
        type:[String],
        required:true
    },
    useful_parts:{
        type:[String],
        required:true
    },
    places:{
        type:[String],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})

const Upload=new mongoose.model("Upload",UploadSchema);
module.exports=Upload;