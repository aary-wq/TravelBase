const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

let createReview = async(req,res)=>
    {    
    let listing  = await Listing.findById(req.params.id);
    let review = await Review.create(req.body.review);
    review.creator = res.locals.currUser._id;
    await review.save();
    listing.reviews.push(review);
    await listing.save();
    req.flash("success","Review Added Successfully")
    res.redirect(`/listings/${req.params.id}`)
    }

    let destroyReview =  async (req,res)=>
        {
        let {id,r_id} = req.params;
        await Review.findByIdAndDelete(r_id);
        await Listing.findByIdAndUpdate(id,{$pull : {reviews : r_id}});
        req.flash("success","Review Deleted Successfully")
        res.redirect("/listings/"+id);
        } 

        module.exports = {createReview,destroyReview};
