const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

module.exports = function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      if (req.method === "GET") {
        req.session.redirectUrl = req.originalUrl;
      } else if (req.method === "POST" && req.headers.referer) {
        try {
          const url = new URL(req.headers.referer);
          const pathParts = url.pathname.split("/");
          const listingId = pathParts[2];
  
          req.session.redirectUrl = `/listings/${listingId}`;
          req.session.listingId = listingId;
  
          if (req.body.review) {
            const { rating, comment } = req.body.review;
            req.session.pendingReview = { rating, comment };
          }
        } catch (e) {
          req.session.redirectUrl = "/listings";
        }
      }
  
      req.flash("error", "Please log in first!");
      return res.redirect("/users/login");
    }
  
    next();
  };
  

module.exports.saveURL = ((req,res,next)=>
{
// if(req.session.redirectUrl)  
if(req.session.listingId && req.session.pendingReview){
res.locals.listingId = req.session.listingId;  
res.locals.pendingReview = req.session.pendingReview;
}
res.locals.url = req.session.redirectUrl;
next();
});

module.exports.isOwner = async function isOwner(req,res,next){

    let {id} = req.params;
    let listing = await Listing.findById(id); 
    if(res.locals.currUser && !listing.owner.equals(res.locals.currUser._id)) 
    {
        req.flash("error","You Don't have the permission to do it...!");
        return res.redirect("/listings/"+id);
    }
    next();
}

module.exports.isReviewAuthor = async function isOwner(req,res,next){

    let {r_id,id} = req.params;
    let review = await Review.findById(r_id); 
    if(res.locals.currUser && review.creator && !review.creator.equals(res.locals.currUser._id)) 
    {
        req.flash("error","You Don't have the permission to do it...!");
        return res.redirect("/listings/"+id);
    }
    next();
}