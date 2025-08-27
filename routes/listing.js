const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrap.js");
const ExpressError = require("../utils/error.js");
const {listingSchema} = require("../schema.js");
const isLoggedIn = require("../middleware.js");
const {isOwner} = require("../middleware.js");
const multer = require("multer");
const { storage,cloudinary } = require("../config.js");
const { render } = require("ejs");
const upload = multer({storage});

function validateListing(req,res,next)
{
   let {error} = listingSchema.validate(req.body);
   if(error)
    throw new ExpressError(400,error);
   else 
   next();
}


router.route("/")
.get(wrapAsync(async (req,res)=>
  {
  let listings = await Listing.find();
 //  console.log("cookie: ",req.cookies);
  res.render("./listings/index.ejs",{ listings, currentPage: 'listings' });
  }))
  
  .post(isLoggedIn,upload.single('listings[image]'),wrapAsync(async (req,res)=>
    {
    req.body.listings.owner = res.locals.currUser._id;
    let{path="/image",filename="/image"} = req.file;
    req.body.listings.image = {url : path,filename};
    await new Listing(req.body.listings).save();
    req.flash("success","Listing created Successfully");
    res.redirect("/listings");
    }));

    router.get("/mylistings",isLoggedIn,wrapAsync(async (req,res,next)=>
    {
      let listings = await Listing.find({owner:res.locals.currUser._id});
      res.render("./listings/index.ejs",{ listings, currentPage: 'mylistings' });
    }));

    router.get("/filters/:feature",wrapAsync(async (req,res,next)=>
      {
        let {feature} = req.params;
        let listings = await Listing.find({feature});
        if(!listings || listings.length==0)
        return res.render("./listings/nofeature.ejs",{feature});  
        res.render("./listings/index.ejs",{listings,currentPage:feature});
      }));

      router.get("/destination",wrapAsync(async (req,res,next)=>
        {
          let dest = req.query.searchInp;
          if(!dest || dest==""){
            dest = "that";
          }
          let listings = await Listing.find({
            location: { $regex: `^${dest}`, $options: "i" }
          });
          if(!listings || listings.length==0) 
            return res.render("./listings/nodest.ejs",{dest}); 
          res.render("./listings/index.ejs",{listings,currentPage : dest});
        }));
  
    router.get("/new",isLoggedIn,(req,res)=>
    {
    res.render("./listings/new.ejs");
    });
   
    router.route("/:id")
    .get(wrapAsync( async(req,res)=>
      {
      let {id} = req.params;
      let listing = await Listing.findById(id).populate({path: "reviews",
        populate : { path : "creator" }}).populate("owner");
      // console.log(listing.reviews[0].creator);
      if(!listing){
        req.flash("error","Listing does not exist!"); 
        res.redirect("/listings");
      } 
      let fromPage = req.query.from || 'listings'; 
       res.render('./listings/show.ejs', { listing, fromPage });
      //res.render("./listings/show.ejs",{listing});
      })
     )

     .put(isLoggedIn,isOwner,upload.single('listings[image]'),validateListing,wrapAsync(async(req,res)=>
      {
      let {id} = req.params;
      let listing = await Listing.findByIdAndUpdate(id,{...req.body.listings});
      if(req.file && req.file.path){
      let{path="/image",filename="/image"} = req.file;
      listing.image = {url : path,filename};
      await listing.save();
      }
      req.flash("success","Listing Updated Successfully");
      res.redirect("/listings/"+id);
      }))

      .delete(isLoggedIn,isOwner,wrapAsync(async (req,res)=>
        {
        let {id} = req.params;
        const redirectFrom = req.query.from;
        await Listing.findByIdAndDelete(id);
        req.flash("success","Listing Deleted Successfully")
        // console.log(res.locals.isMyListings);
       // res.redirect("/listings");
       if (redirectFrom === 'mylistings') {
       return res.redirect('/listings/mylistings');
    } else if(redirectFrom == 'listings') {
        return res.redirect('/listings');
      }
        else if(redirectFrom=='Arctic' || redirectFrom=='Mountains' || redirectFrom=='City' || redirectFrom=='Pools' || redirectFrom=='Farm House'){
          res.redirect('/listings/filters/'+redirectFrom);
        }
        else {
          res.redirect('/listings/destination/?searchInp='+redirectFrom);
        }
  
        }));
      

   //Show-Edit Route
    router.get("/:id/edit", isOwner,isLoggedIn,wrapAsync(async (req,res)=>
    {
    let {id} = req.params;
    let listing = await Listing.findById(id)
    if(!listing){
      req.flash("error","Listing does not exist!"); 
      return res.redirect("/listings");
    }
    let originalImg = listing.image.url; 
    originalImg = originalImg.replace("/uploads","/uploads/w_300,h_300,blur_200");

    res.render("./listings/edit.ejs",{listing,originalImg});
    }));
    

    module.exports = router;