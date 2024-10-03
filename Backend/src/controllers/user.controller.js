import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadMediaOnCloudinary, deleteMedia } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import FileSystem from "fs";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user data from frontend(req.body)
  const { fullName, email, password } = req.body;

  // 2. Validate user data
  if (!fullName || !email || !password) {
    throw new ApiError(400, "Please fill in all the required fields");
  }

  // validate email
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // 3. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (avatarLocalPath) FileSystem.unlinkSync(avatarLocalPath);
    throw new ApiError(409, "User already exists");
  }

  // 4. Check for avatar and cover images and upload them to cloudinary
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide an avatar image");
  }
  // Upload images to cloudinary
  const avatar = await uploadMediaOnCloudinary(
    avatarLocalPath,
    "image",
    `${fullName}-avatar`
  );
  const avatarUrl = avatar.url;

  if (!avatarUrl) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // 5. Create and save the user object with the data
  const newUser = await User.create({
    fullName,
    email,
    password,
    avatar: avatarUrl,
  });
  // Check if the user is created
  // 6. Remove password and refresh token from responce
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(404, "User not Created");
  }

  // 7. Send the modified user object in the response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // 1. Get user data from frontend(req.body)
  const { email, password } = req.body;
  if (!(email)) {
    throw new ApiError(400, "Please provide an email");
  }
  // 2. Validate user data
  if (!password) {
    throw new ApiError(400, "Please provide a password");
  }

  // 3. Check if user exists in the database with the provided email or username. if does not exists then redirect them to /register.
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
    // Redirect to /register
  }
  // 4. Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 5. Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6. Send the tokens in the response secure cookie
  const options = {
    httpOnly: true, // The cookie is not accessible via JavaScript in the browser
    secure: true, // secure? true for https, false for http
    // sameSite: "none", // Uncomment this line if you are using the frontend and backend on different domains
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken, // Send the tokens in the response
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // 1. Clear the refresh token from the database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // Remove the refresh token from the database
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  // 2. Clear the access and refresh tokens from the cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Get the refresh token from the cookies
  const { refreshToken: reauthToken } = req.cookies;

  // 2. Check if the refresh token is valid
  if (!reauthToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    // 3. Generate a new access token and refresh token
    // Verify the refresh token using the refresh token secret key
    const decodedToken = jwt.verify(
      reauthToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // Find the user with the decoded token id and refresh token
    const user = await User.findById(decodedToken?._id);
    // Check if the user exists and the refresh token is the same as the one in the database
    if (!user || user.refreshToken !== reauthToken) {
      throw new ApiError(401, "Unauthorized access");
    }

    // Generate a new access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // 4. Send the new access token and refresh token in the response
    const options = {
      httpOnly: true,
      secure: true,
      // sameSite: "none", // Uncomment this line if you are using the frontend and backend on different domains
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken }, // Send the new tokens in the response
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Unauthorized access");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // 1. Get the user object from the request
  const user = await User.findById(req.user?._id);

  // 2. Get the current password, new password, and confirm password from the request
  const { currentPassword, newPassword } = req.body;

  // 3. Check if the current password is correct
  const isPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // 4. Update the password with the new password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // 5. Send a response with a message
  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

// const forgotPassword = asyncHandler(async (req, res) => {
//   // Steps to reset the password
//   // 1. Get the email from the request
// });

const updateUserDetails = asyncHandler(async (req, res) => {
  // 1. Get the updated user details from the request
  const { fullName, email, dailyReminderTime } = req.body;
  if (!fullName || !dailyReminderTime || !email) {
    throw new ApiError(400, "Please fill in all the required fields");
  }

  // 2. Get and Update the user object from the request
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      fullName,
      email,
      dailyReminderTime,
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 3. Send the updated user object in the response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  // 1. Get the avatar image from the request
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide an avatar image");
  }
  // 2. Delete the old avatar image from cloudinary
  const publicId = req.user?.username + "-avatar";
  console.log(publicId);

  if (publicId) {
    await deleteMedia(publicId);
  }

  // 3. Upload the avatar image to cloudinary
  const avatar = await uploadMediaOnCloudinary(
    avatarLocalPath,
    "image",
    publicId
  );
  const avatarUrl = avatar.url;

  if (!avatarUrl) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // 4. Update the user object with the new avatar image
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      avatar: avatarUrl,
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 5. Send the updated user object in the response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 2. Send the user object in the response
  return res.status(200).json(new ApiResponse(200, user, "User found"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateUserDetails,
  updateAvatar,
  getCurrentUser,
};
