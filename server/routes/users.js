const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("Connected to Database"));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  dp: {
    type: String,
  },
  board: {
    type: Array,
    default: [],
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
