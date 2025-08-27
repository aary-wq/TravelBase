const express = require("express");
const router = express.Router({mergeParams : true});
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const passport = require("passport");
const wrapAsync = require("../utils/wrap.js");
const {saveURL} = require("../middleware.js");

router.route("/signup")
.get((req,res)=>
  {
     res.render("./users/signup.ejs"); 
  })
  
.post(async (req,res)=>
    {
        try{
        let {username,email,password} = req.body.users;
        const user = {
                email, 
                username, 
                password,
            }
            let newUser = await new User(user);
            let regUser = await User.register(user,user.password);
            console.log(regUser);
            req.flash("success","User Registered Successfully!.."); 
            req.logIn(regUser, (err) => {
                if (err) {
                  req.flash("error", "Auto-login failed");
                  return res.redirect("/users/login");
                }
                req.flash("success", "Logged In Successfully..!");
                res.redirect("/listings");
              });
        }
        catch(e){
            req.flash("error","Failed to Sign-up, Try Again");
            res.redirect("/users/signup");
        }
    });


router.route("/login")
.get((req,res)=>
  {
  res.render("./users/login.ejs");
  })

.post((req, res, next) => {
    req.body.username = req.body.users.username;
    req.body.password = req.body.users.password;
    next();
  },
  saveURL,
    passport.authenticate("local",{failureFlash : true,failureRedirect : "/users/login"}),
    async (req,res)=>
    {
    // req.flash("success","Logged in Successfully...!");
    console.log(req.user);
    let url = res.locals.url || "/listings";
    let listingId = res.locals.listingId;
    const pendingReview = res.locals.pendingReview;
    // console.log(listingId);
    if(listingId && pendingReview){
        try {
            const listing = await Listing.findById(listingId);
            if (listing.owner.toString() === req.user._id.toString()) {
              req.flash("error","Cannot add review to your own listing");
              return res.redirect(url);  
            }
            const review = new Review(pendingReview);
            review.creator = req.user._id;
            await review.save();
            listing.reviews.push(review);
            await listing.save();

            req.flash("success", "Your review was posted after login!");
          } catch (e) {
            req.flash("error", "Could not post your review after login.");
          }
    }
    console.log("localhost:8090"+url);
    req.flash("success", "Logged in Successfully...!");
    res.redirect(url);
    });



router.get("/logout",wrapAsync(async (req,res,next)=>
{
    req.logOut((err)=>
    {
        if(!err)
        {
            req.flash("success","Logged Out Successfully");
            res.redirect("/listings");
        }
    });
}));
    

module.exports = router;