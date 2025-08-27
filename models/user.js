const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passMongoose = require("passport-local-mongoose");

const userSchema = new Schema({

    email : {
        type : String,
        required : true,
    }
    });

userSchema.plugin(passMongoose);

const User = mongoose.model("User",userSchema);
module.exports = User;




