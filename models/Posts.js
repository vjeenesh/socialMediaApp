const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  body: String,
  createdAt: String,
  comments: [
    {
      username: String,
      body: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: String,
});

module.exports = model("Post", postSchema);
