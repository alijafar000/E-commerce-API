import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (
    fileBuffer,
    mimeType,
    folder = "ecommerce/products"
) => {
    try {
        const base64Image = fileBuffer.toString("base64");

        const dataUri = `data:${mimeType};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: "image",

            // Cloudinary Dynamic Folder
            asset_folder: folder,

            // Public ID ko bhi ecommerce/products ke andar rakhna
            public_id_prefix: folder,
        });

        console.log("Cloudinary upload completed");
        console.log("Cloudinary URL:", result.secure_url);
        console.log("Cloudinary Public ID:", result.public_id);

        return result;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

export default uploadToCloudinary;