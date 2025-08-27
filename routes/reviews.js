const express = require("express");
const router = express.Router({mergeParams : true});
// const Listing = require("../models/listing.js");
// const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrap.js");
const ExpressError = require("../utils/error.js");
const {reviewSchema} = require("../schema.js");
const isLoggedIn = require("../middleware.js");
const {isReviewAuthor,saveURL} = require("../middleware.js");
const reviewController = require("../controller/reviews.js");

function validateReview(req,res,next)
{
   let {error} = reviewSchema.validate(req.body);
   if(error)
    throw new ExpressError(400,error);
   else 
   next();
}

router.post("/", isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

router.delete("/:r_id", isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;