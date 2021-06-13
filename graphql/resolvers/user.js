const User = require("../../models/User");
const { TOKEN_SECRET } = require("../../config");
const { ValidateRegister, validateLogin } = require("../../utils/validators");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");

function generateToken(user) {
  return jwt.sign({ ...user, email: user.email }, TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

module.exports = {
  Mutation: {
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      // TODO: validation
      const { valid, errors } = ValidateRegister(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: check if user already exists
      const checkUser = await User.findOne({ username });
      const checkEmail = await User.findOne({ email });
      if (checkUser) {
        throw new UserInputError("Username already exists", {
          errors: {
            username: "This username is taken",
          },
        });
      } else if (checkEmail) {
        throw new UserInputError("Email taken", {
          errors: {
            email: "User with this email already exists",
          },
        });
      }

      // TODO: hash password
      const hash = await bcrypt.hash(password, 12);
      const newUser = new User({
        username,
        hash,
        email,
        createdAt: new Date().toISOString(),
      });
      const user = await newUser.save();
      const token = generateToken(user);
      return { ...user._doc, id: user._id, token };
    },
    async login(_, { username, password }) {
      const { valid, errors } = validateLogin(username, password);
      if (!valid) {
        throw new UserInputError("Error", { errors });
      }
      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "No user found for this username";
        throw new UserInputError("No User Found", { errors });
      }
      const match = await bcrypt.compare(password, user.hash);
      if (!match) {
        errors.general = "Username or password Invalid";
        throw new UserInputError("Wrong Credentials", { errors });
      }
      if (match) {
        const token = generateToken(user);
        return { ...user._doc, id: user._id, token };
      }
    },
  },
};
