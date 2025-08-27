const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary");

cloudinary.config({
cloud_name : process.env.CLOUD_NAME,
cloudinary_url : process.env.CLOUDINARY_URL,
api_secret: process.env.API_SECRET,
api_key : process.env.API_KEY,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params : {
        folder : "travel",
        allowedFormats : ["png","jpg","webp","jpeg"],
    },
});

module.exports = {
    storage,
    cloudinary,
}
