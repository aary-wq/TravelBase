const joi = require("joi");

let listingSchema = joi.object({
listings : joi.object({
title:joi.string().required(),
description: joi.string().required(),
price:joi.number().required().min(0),
location:joi.string().required(),
country: joi.string().required(),
image:joi.string().allow(null,""),
feature:joi.string().required,
}).required()
});


let reviewSchema = joi.object({
    review : joi.object({
    rating:joi.string().required().min(1).max(5),
    comment: joi.string().required(),
    }).required()
    });

    module.exports = {
        listingSchema,
        reviewSchema,
      };