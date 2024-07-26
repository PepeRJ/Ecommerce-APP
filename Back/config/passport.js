const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

// Configura la estrategia de autenticación local
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await Usuario.findOne({ where: { correo_electronico: username } });

      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

  
      const passwordMatch = await bcrypt.compare(password, user.contrasenya);

      if (!passwordMatch) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
   
    const user = await Usuario.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

