require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const isEmail = require("isemail");
const typeDefs = require("./schema");
const { createStore } = require("./utils");
const resolvers = require("./resolvers");

const LaunchAPI = require("./datasources/launch");
const UserAPI = require("./datasources/user");

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
  context: async ({ req }) => {
    const auth = (req.headers && req.headers.authorization) || "";
    const email = Buffer.from(auth, "base64").toString("ascii");
    if (!isEmail.validate(email)) return { user: null };

    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;
    return { user: { ...user.dataValues } };
  },
});

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/dev
  `);
});
