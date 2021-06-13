const { UserInputError, AuthenticationError } = require("apollo-server-errors");
const Post = require("../../models/Posts");
const User = require("../../models/User");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const user = await checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        if (body.trim() === "") {
          throw new UserInputError("Comment Body Empty ", {
            errors: {
              comment: "Comment must not be empty",
            },
          });
        } else {
          post.comments.unshift({
            body,
            username: user._doc.username,
            createdAt: new Date().toISOString(),
          });
          await post.save();
          return post;
        }
      } else throw new UserInputError("Post Not Found");
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const user = await checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (
          commentIndex >= 0 &&
          post.comments[commentIndex].username === user._doc.username
        ) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else
          throw new AuthenticationError("You don't have permission to do that");
      } else throw new UserInputError("Post Not Found");
    },
  },
};
