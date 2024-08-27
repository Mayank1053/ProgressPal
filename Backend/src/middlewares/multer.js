import multer from "multer";

//* Multer configuration
// Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.
// It is written on top of busboy for maximum efficiency.
// Multer adds a body object and a file or files object to the request object.
// The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
// The file or files object is populated with files uploaded via the form.
//* Each file contains the following properties:
// fieldname: Field name specified in the form
// originalname: Name of the file on the user's computer
// encoding: Encoding type of the file
// mimetype: Mime type of the file
// size: Size of the file in bytes
// destination: The folder to which the file has been saved
// filename: The name of the file within the destination
const storage = multer.diskStorage({
  // Destination to store image locally
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  // Generate a unique name for the file
  filename: function (req, file, cb) {
    cb(null, file.originalname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });
// This returns a middleware that processes a single file.

export {upload};