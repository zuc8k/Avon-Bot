const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'guilds']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, {
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar,
          guilds: profile.guilds,
          role: 'member' // هيتحدد بعدين
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);