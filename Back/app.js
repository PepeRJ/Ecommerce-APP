const express = require('express');
const cors = require('cors');
const app = express();
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');


require('./config/passport');

const carritoRoutes = require('./routes/carrito');
const productoRoutes = require('./routes/producto');
const autenticacionRoutes = require('./routes/autenticacion');
const pedidoRoutes = require('./routes/pedido');

const allowedOrigins = ['http://localhost:4200'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/autenticacion', autenticacionRoutes);
app.use('/carrito', carritoRoutes);
app.use('/producto', productoRoutes);
app.use('/pedido', pedidoRoutes);

app.get('/', (req, res) => {
  res.send('¡Hola mundo hahaha!');
});

app.get('/perfil', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Bienvenido a tu perfil');
  } else {
    res.status(401).json({ error: 'Debes iniciar sesión para acceder a esta página' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`La aplicación está en funcionamiento en el puerto ${port}`);
});