import { v2} from "cloudinary";
import FileSystem from "fs";

// Configuration
v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Upload media (image or video)
const uploadMediaOnCloudinary = async (mediaPath, resource_type, public_id) => {
  try {
    if (!mediaPath) {
      throw new Error("Please provide a media path");
    }
    const media = await v2.uploader.upload(mediaPath, {
      resource_type: resource_type || "auto",
      public_id: public_id || null,
    });
    
    console.log("Media uploaded successfully", media);
    FileSystem.unlinkSync(mediaPath); // Delete the media from the local server after the upload
    return media;
  } catch (error) {
    FileSystem.unlinkSync(mediaPath); // Delete the media from the local server as the upload is failed
    console.error(error);
  }
};

// Delete media (image or video) using destroy
const deleteMedia = async (public_id) => {
  try {
    await v2.uploader.destroy(public_id);
    console.log("Media deleted successfully");
  } catch (error) {
    console.error(error);
  }
};

export { uploadMediaOnCloudinary, deleteMedia };