import mongoose from "mongoose";

const VerificationCodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["email_verification", "password_reset"],
    required: true,
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const VerificationCodeModel = mongoose.model(
  "VerificationCode",
  VerificationCodeSchema,
  "verification_codes"
);

export default VerificationCodeModel;
