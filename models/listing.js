const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");
const { required } = require("joi");


const listSchema = new Schema({

title:{
    type : String,
    required : true,
    maxLength : 50
},
description:{
    type : String,
    required : true,
},
image: {
  url: {
    type: String,
    default: "https://destinationcompress.s3.ap-south-1.amazonaws.com/acdb2987-80d1-4b05-9ad3-de30647a64ef.jpeg",
    set: v => (!v || v.trim() === "") 
        ? "https://destinationcompress.s3.ap-south-1.amazonaws.com/acdb2987-80d1-4b05-9ad3-de30647a64ef.jpeg" 
        : v
  },
  filename: {
    type: String,
    default: "default.jpg",
  }
},
price:{
    type : Number,
    required : true,
},
location:{
    type : String,
},
country:{
    type : String,
},
reviews : [
    {
        type : Schema.Types.ObjectId,
        ref : "Review"
    }
],
owner : {
    type : Schema.Types.ObjectId,
    ref : "User",
},
feature: {
    type : String,
    enum : ["Mountains","Pools","City","Arctic","Camping","Farm House"],
    required : true,
}
}
);


listSchema.post("findOneAndDelete", async(listing)=>
{
if(listing) await Review.deleteMany({_id : {$in : listing.reviews}});
});

const Listing = mongoose.model("Listing",listSchema);

module.exports = Listing;