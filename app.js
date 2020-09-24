require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app=express();
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret:"Our little secret.",
    resave: false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
const userSchema = new mongoose.Schema ({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);//used to hash and salt the password

const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());//to create a local mongo stratiges 

passport.serializeUser(User.serializeUser());//creating cookie
passport.deserializeUser(User.deserializeUser());//exposing the content of cookie

app.get("/",function(req,res){

    res.render("home");
});
app.get("/login",function(req,res){
    
    res.render("login");
});


app.get("/register",function(req,res){
    res.render("register");
});
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

app.post("/register",function(req,res){

     User.register({username:req.body.username},req.body.password,function(err,user){
         if(err){
            console.log(err);
            res.redirect("/register");
         }
         else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
         }
    });
    
    
});
app.post("/login",function(req,res){
    const user= new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){ //we utilise the passport's function login() which automatically check for the password as the user provided.
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });



});



app.listen(3000,function(){
    console.log("Started the server at 3000");
});