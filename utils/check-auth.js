const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const TOKEN_SECRET = process.env.TOKEN_SECRET;

module.exports = async (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, TOKEN_SECRET);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid/Expired Token");
      }
    }
    throw new Error("Authorization must be Bearer [token]");
  }
  throw new Error("Authorization must be provided");
};
