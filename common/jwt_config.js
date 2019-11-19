module.exports = {
  jwtSecret: process.env.TOKEN_KEY || "NightLoad",
  jwtSession: {
    session: false
  }
};
