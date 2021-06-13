const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");

const { DB_URL } = require("./config");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const pubsub = new PubSub();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB CONNECTED!!");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Listening on ${res.url}`);
  })
  .catch((error) => console.log(`Oops Something went wrong`, error));
