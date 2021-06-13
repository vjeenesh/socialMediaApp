const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Posts");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("No post found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = await checkAuth(context);
      if (body.trim() === "") {
        throw new Error("Post must not be Empty");
        // throw new UserInputError("Errors", {
        //   postBody: "Post cannot be empty",
        // });
      }
      const post = new Post({
        body,
        user,
        username: user._doc.username,
        createdAt: new Date().toISOString(),
      });
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });
      const newPost = await post.save();
      return newPost;
    },
    async deletePost(_, { postId }, context) {
      const user = await checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (post && post.user == user._doc._id) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("You don't have permission to do that");
        }
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
    async likePost(_, { postId }, context) {
      const user = await checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === user._doc.username)) {
          // unlike the post
          post.likes = post.likes.filter(
            (like) => like.username !== user._doc.username
          );
        } else {
          // like the post
          post.likes.push({
            username: user._doc.username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else throw new UserInputError("Post Not Found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(["NEW_POST"]),
    },
  },
};
