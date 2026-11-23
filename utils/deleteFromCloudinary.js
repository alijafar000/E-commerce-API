import cloudinary from "../config/cloudinary.js";

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        console.log("Cloudinary delete result:", result);

        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw error;
    }
};

export default deleteFromCloudinary;