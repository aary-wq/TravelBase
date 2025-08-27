const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
let initData = require("./init.js");
const CatArr = ["Mountains", "Pools", "City", "Arctic", "Camping"];

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/travel");
}

main().then(()=>{
console.log("Connection succuessful..");
})
.catch((err)=>
{
console.log("Connection interrupted..");
});

Listing.deleteMany()
.then(async(res)=>
{
  initData = initData.map((obj,index)=>({... obj , owner : "68850cf65fea6f50b8a4016b",  feature: CatArr[index % CatArr.length]})); 
   await Listing.insertMany(initData);
   console.log("Data inserted successfully");
});