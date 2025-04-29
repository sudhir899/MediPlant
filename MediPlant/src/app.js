const express= require("express");
const path=require("path");
const app=express();
const ejs = require("ejs");
const multer= require("multer");
const fs= require("fs");
require("./db/conn");
const Signup=require("./models/signup");
const ContactUs=require("./models/contactus");
const Upload=require("./models/upload");
const { json } =require("express");
app.use(express.json());
app.use(express.urlencoded({extended:false}));
require("dotenv").config();
const static_path=path.join(__dirname,"../public");
app.use(express.static(static_path))
app.set('view engine', "ejs");

const storage= multer.diskStorage({
    destination:path.join(static_path, "./images"),
    filename: (req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload=multer({
   storage: storage
})






app.get("/", async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const values = req.query.param ? req.query.param : req.body.param || "-";
    const searchTerm = new RegExp(values, "i"); // Creating case insensitive regex
    const perPage = 5;
    const skip = (page - 1) * perPage;
    try {
        const data = await Upload.find({
            "$or": [
                { "botanical_name": { $regex: searchTerm } },
                { "english_name": { $regex: searchTerm } },
                { "hindi_name": { $regex: searchTerm } },
                { "places": { $regex: searchTerm } },
                { "disease": { $regex: searchTerm } }
            ]
        }).skip(skip).limit(perPage);
        const totalImages = await Upload.countDocuments({
            "$or": [
                { "botanical_name": { $regex: searchTerm } },
                { "english_name": { $regex: searchTerm } },
                { "hindi_name": { $regex: searchTerm } },
                { "places": { $regex: searchTerm } },
                { "disease": { $regex: searchTerm } }
            ]
        });
        const totalPages = Math.ceil(totalImages / perPage);
        res.render("index", { data, totalPages, currentPage: page, values });
    } catch (err) {
        console.error(err);
        res.send('An error occurred while fetching images.');
    }
});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/contactus",(req,res)=>{
    res.render("contactus");
});

app.get("/upload",(req,res)=>{
    res.render("upload");
});

app.get("/user_profile",(req,res)=>{
    res.render("user_profile");
});

app.get("/gallery", async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const perPage = 20;
    const skip = (page - 1) * perPage;
    try {
        const images = await Upload.find().skip(skip).limit(perPage);
        const totalImages= await Upload.countDocuments();
        const totalPages = Math.ceil(totalImages / perPage);
        res.render("gallery", { images, totalPages, currentPage: page });
    } catch (err) {
        console.error(err);
        res.send('An error occurred while fetching images.');
    }
});

app.get("/plant_profile", async (req, res) => {
    const id = req.query.id ? req.query.id :"";
    try {
        const details = await Upload.findOne({_id:id});
        res.render("plant_profile", {details});
    } catch (err) {
        console.error(err);
        res.send('An error occurred while fetching images.');
    }
});

app.get("/edit_details",async(req,res)=>{
    const docs=await Upload.findOne({_id:req.query.id});
    res.render("edit_details",{details:docs});
})

app.get("/delete_details",async(req,res)=>{
    const filename= await Upload.findOne({_id:req.query.id});
    const imagePath = path.join("./public/images/", filename.image);
    fs.unlinkSync(imagePath);
    const deleted=await Upload.deleteOne({_id:req.query.id});
    res.redirect("gallery");
})

app.post("/edit_details",upload.single("image"),async(req,res)=>{
    try {
        const filename= await Upload.findOne({_id:req.query.id});
    const imagePath = path.join("./public/images/", filename.image);
         console.log(req.query.id);
         if(req.file){
    fs.unlinkSync(imagePath);
         var update = {
                botanical_name:req.body.name1,
                english_name:req.body.name2,
                hindi_name:req.body.name3,
                disease:req.body.disease.split(',').map(disease => disease.trim()),
                useful_parts:req.body.part.split(',').map(part => part.trim()),
                places:req.body.place.split(',').map(place => place.trim()),
                image:req.file.filename,
                description:req.body.msg
        }} else{
            var update = {
                    botanical_name:req.body.name1,
                    english_name:req.body.name2,
                    hindi_name:req.body.name3,
                    disease:req.body.disease.split(',').map(disease => disease.trim()),
                    useful_parts:req.body.part.split(',').map(part => part.trim()),
                    places:req.body.place.split(',').map(place => place.trim()),
                    description:req.body.msg
            }
        }
        const updated=await Upload.updateOne({_id:req.query.id},update);
        res.redirect("gallery");
    } catch (err) {
        console.error(err);
        res.send('An error occurred while updating images.');
    }
})

app.post("/signup",async(req,res)=>{
    try{  
        const password=req.body.password;
        const cpassword=req.body.confirmpassword;
        if(password===cpassword)
        {
            const signup=new Signup({
                username:req.body.username,
                email:req.body.email,
                password:req.body.password,
                dob:req.body.dob
            })
           const signuped=await signup.save();
           res.status(201).render("index");
        }
        else{
            res.send("Password not match");
        }
    }  catch(error){
        res.status(400).send("error");
    }
});

app.post("/login",async(req,res)=>{
    try{
          const email=req.body.email;
          const password=req.body.password;
          const useremail=await Signup.findOne({email});
          if(useremail.password===password){
             res.status(201).render("index");
          }
          else{
             res.send("Invalid Login Credentials");
          }
    } catch{
        res.status(400).send("Invalid Login Credentials");
    }
});

app.post("/contactus",async(req,res)=>{
    try{  
            const contactus=new ContactUs({
                name:req.body.name,
                mobile:req.body.mobile,
                email:req.body.email,
                subject:req.body.subject,
                message:req.body.msg
            })
           const contacted=await contactus.save();
           res.status(201).render("contactus");
    }  catch(error){
        res.status(400).send(error);
    }
});

app.post("/upload",upload.single("image"),async(req,res)=>{
    try{  
            const upload=new Upload({
                botanical_name:req.body.name1,
                english_name:req.body.name2,   
                hindi_name:req.body.name3,
                disease:req.body.disease.split(',').map(disease => disease.trim()),
                useful_parts:req.body.part.split(',').map(part => part.trim()),
                places:req.body.place.split(',').map(place => place.trim()),
                description:req.body.msg,
                image:req.file.filename
            })
           const uploaded=await upload.save();
           res.status(201).render("upload");
        
    }  catch(error){
        res.status(400).send(error);
    }
});

app.post("/diseases", async (req, res) => {
    try {
        const searchText = req.body.searchText || '';
        // console.log(searchText);
        const query = { disease: { $regex: searchText, $options: 'i' } };
        const results = await Upload.find(query);
        let disease = results.map(doc => doc.disease);
        disease=[].concat(...disease);
        const diseases = [...new Set(disease)];
        // console.log(diseases);
        res.json(diseases);
    } catch (err) {
        console.error(err);
        res.send('An error occurred while fetching images.');
    }
}); 

app.listen(process.env.PORT, () =>{
   console.log(`server is running on PORT: ${process.env.PORT}`);
})

