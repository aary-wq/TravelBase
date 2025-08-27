if(process.env.NODE_ENV!="production")
{
    require("dotenv").config();
//     console.log(process.env);
}

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const initData = require("./initData/init.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/error.js");
const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/reviews.js");
const userRoutes = require("./routes/users.js");
const User = require("./models/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");


const options = {
    secret : "mysecret",  
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly: true,
        expires : Date.now() + 7 * 12 * 60 * 60 * 1000,
        maxAge : 7 * 12 * 60 * 60 * 1000,
    }
}

app.use(express.urlencoded({extended:true}));
app.set("views",path.join(__dirname,"/views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);
app.use(cookieParser("code"));
app.use(flash())
app.use(session(options));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/travel");
}

main().then(()=>{
console.log("Connection succuessful..")
})
.catch((err)=>
{
console.log("Connection interrupted..")
});


// app.get("/",(req,res)=>
// {
// res.cookie("name","bokil");
// res.cookie("site","mumbai",{signed:true});
// console.log("unsigned",req.cookies);
// console.log("signed",req.signedCookies);
// res.send("<h2>Welcome to Travel Website</h2>");
// });

app.use((req,res,next)=>
{
res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
res.locals.currUser = req.user;
next();
});

// app.get("/demoUser", async(req,res)=>
// {
// const fakeUser = {
//     email : "bdok@yahoo.com",
//     username : "delta123",
//     password : "words",
// }
// let newUser = await new User(fakeUser);
// let regUser = await User.register(fakeUser,fakeUser.password);
// // console.log(newUser);
// res.send(regUser);
// });

app.use("/listings",listingsRoutes);
app.use("/listings/:id/reviews",reviewsRoutes);
app.use("/users",userRoutes);


app.use((req,res,next)=>
{
next(new ExpressError(404,"Sorry!.. Page not Found."));
});

app.use((err,req,res,next)=>
{
let {status=500,message="Something went wrong!.."} = err;
res.status(status).render("./listings/error.ejs",{message});
});

app.listen(8090,()=>
{
    console.log("Listening on port 8090.....");
})