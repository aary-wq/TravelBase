const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({

    comment : String,
    rating: {
        type: Number,
        max: 5,
        min : 1
    },
    created_at : {
        type: Date,
        default : Date.now()
    },
    creator : {
        type : Schema.Types.ObjectId,
        ref : "User" 
    },
});

const Review = mongoose.model("Review",reviewSchema);
module.exports = Review;