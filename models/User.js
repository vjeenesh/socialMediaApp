const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: String,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  email: String,
  hash: String,
  createdAt: String,
});

module.exports = model("User", userSchema);
