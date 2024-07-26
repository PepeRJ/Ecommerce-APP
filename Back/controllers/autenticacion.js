const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Usuario = require('../models/usuario');
const Carrito = require('../models/carrito');
const TelefonosUsuarios = require('../models/telefonos_usuarios');
const Telefonos = require('../models/telefonos');

exports.registro = async (req, res) => {
  const { nombre, apellidos, correo_electronico, direccion, contrasenya, numero } = req.body;

  try {
  
    if (!nombre || !apellidos || !correo_electronico || !direccion || !contrasenya || (numero && numero.length === 0)) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios', message: 'Rellena todos los campos requeridos' });
    }

   
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(correo_electronico)) {
      return res.status(400).json({ error: 'El correo electrónico no es válido' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { correo_electronico } });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe', message: 'Este correo electrónico ya está registrado' });
    }

   
    const hashedPassword = await bcrypt.hash(contrasenya, 10);

  
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellidos,
      correo_electronico,
      direccion,
      contrasenya: hashedPassword,
    });

 
    await Carrito.create({ cantidad: 0, id_usuario: nuevoUsuario.id });

    if (numero && numero.length > 0) {
     
      const idsNumero = await Promise.all(
        numero.map(async (numero) => {
          const nuevoTelefono = await Telefonos.create({ numero });
          return nuevoTelefono.id;
        })
      );

      await Promise.all(
        idsNumero.map(async (idTelefono) => {
          await TelefonosUsuarios.create({
            id_usuario: nuevoUsuario.id,
            id_telefonos: idTelefono,
          });
        })
      );
    }

   
    req.login(nuevoUsuario, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

    
      res.cookie('sesion_usuario', req.sessionID, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000, 
      });

    
      res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.header('Access-Control-Allow-Credentials', 'true');

      res.json({ message: 'Registro e inicio de sesión exitosos', usuario: nuevoUsuario });
    });
  } catch (error) {
    console.error(error);

    
    if (error.message.includes('Validation error')) {
      res.status(400).json({ error: 'Error en el registro', message: 'Error de validación. Asegúrate de proporcionar todos los campos requeridos.' });
    } else {
      res.status(500).json({ error: 'Error en el registro', message: error.message });
    }
  }
};

exports.inicioSesion = (req, res, next) => {
  passport.authenticate('local', (err, usuario, info) => {
    if (err) {
      return next(err);
    }

    if (!usuario) {
      return res.status(401).json({ error: 'Inicio de sesión fallido', message: info.message });
    }

    req.logIn(usuario, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      // Configurar la cookie de sesión
      res.cookie('sesion_usuario', req.sessionID, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000, 
      });

      // Configurar los encabezados CORS
      res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.header('Access-Control-Allow-Credentials', 'true');

      res.json({ message: 'Inicio de sesión exitoso', usuario });
    });
  })(req, res, next);
};



exports.cerrarSesion = (req, res) => {
  if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cerrar la sesión' });
      }

      // Destruir la sesión
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ error: 'Error al destruir la sesión' });
        }

  
res.cookie('connect.sid', '', { expires: new Date(0), httpOnly: true, path: '/' });


        // Limpiar la cookie de sesión al cerrar sesión
        res.clearCookie('sesion_usuario', { httpOnly: true, secure: false, path: '/' });

       
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.json({ message: 'Sesión cerrada exitosamente' });
      });
    });
  } else {
    res.status(401).json({ error: 'No has iniciado sesión' });
  }
};


exports.editarPerfil = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const usuarioId = req.params.id_usuario;


      const { contrasenya, direccion, numero } = req.body;

    
      if (!contrasenya && !direccion && (!numero || numero.length === 0)) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
      }

      try {
        
        if (contrasenya) {
          
          if (!contrasenya.trim()) {
            return res.status(400).json({ error: 'La contraseña no puede estar vacía' });
          }

          const hashedPassword = await bcrypt.hash(contrasenya, 10);
          await Usuario.update({ contrasenya: hashedPassword }, { where: { id: usuarioId } });
        }

       
        if (direccion) {
          await Usuario.update({ direccion }, { where: { id: usuarioId } });
        }

       
        if (numero && numero.length > 0) {
          await TelefonosUsuarios.destroy({ where: { id_usuario: usuarioId } });

          
          const nuevosTelefonos = await Promise.all(
            numero.map(async (numero) => {
              const nuevoTelefono = await Telefonos.create({ numero });
              return nuevoTelefono.id;
            })
          );

          await TelefonosUsuarios.bulkCreate(
            nuevosTelefonos.map((idTelefono) => ({
              id_usuario: usuarioId,
              id_telefonos: idTelefono,
            }))
          );
        }

      
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Credentials', 'true');

        res.json({ message: 'Perfil actualizado exitosamente' });
      } catch (error) {
        throw error;
      }
    } else {
      res.status(401).json({ error: 'No has iniciado sesión' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar el perfil', message: error.message });
  }
};

exports.obtenerDatosUsuario = async (req, res) => {
  try {
    
    if (req.isAuthenticated()) {
      const usuarioAutenticadoId = req.user.id; 
      const usuarioSolicitadoId = req.params.id_usuario; 

     
      if (usuarioAutenticadoId != usuarioSolicitadoId) {
        return res.status(403).json({ error: 'Acceso no autorizado: No tienes permisos para acceder a este perfil' });
      }

    
      const usuario = await Usuario.findByPk(usuarioSolicitadoId, {
        attributes: ['nombre', 'apellidos', 'correo_electronico', 'direccion'],
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

     
      const telefonosUsuarios = await TelefonosUsuarios.findAll({
        where: { id_usuario: usuarioSolicitadoId },
        attributes: ['id_telefonos'],
      });

      const telefonosIds = telefonosUsuarios.map((tu) => tu.id_telefonos);

      const telefonos = await Telefonos.findAll({
        where: { id: telefonosIds },
        attributes: ['numero'],
      });

      
      const datosUsuario = {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo_electronico: usuario.correo_electronico,
        direccion: usuario.direccion,
        telefonos: telefonos.map((telefono) => ({
          numero: telefono.numero,
        })),
      };

      
      res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.header('Access-Control-Allow-Credentials', 'true');

      res.json(datosUsuario);
    } else {
      
      res.status(401).json({ error: 'No has iniciado sesión' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos del usuario', message: error.message });
  }
};
