var express = require('express');
var router = express.Router();

// Configuración de la conexión a la base de datos PostgreSQL
var postgressPass = require('./config');
const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://:' + postgressPass + '@host/db')

/* GET home page. */
router.get('/', function(req, res, next) {
  db.any("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema' AND schema_name != 'public' AND schema_name != 'newsletter'")
    .then(function (result) {
      // Crear una lista de objetos con la información necesaria
      var formattedSchemas = result.map(schema => {
        var schemaNameParts = schema.schema_name.split('_');
        return {
          city: schemaNameParts[0].charAt(0).toUpperCase() + schemaNameParts[0].slice(1), // Capitalizar la primera palabra
          country: 'Country', // Puedes agregar lógica para obtener el país si es necesario
          transportation: schemaNameParts[1].charAt(0).toUpperCase() + schemaNameParts[1].slice(1), // Capitalizar la segunda palabra
          status: 'AVAILABLE' // Estado fijo para todos los esquemas
        };
      });

      // Renderizar la vista 'index.ejs' con los datos de los esquemas
      res.render('index', { title: 'Express', schemas: formattedSchemas });
    })
    .catch(function (error) {
      console.error("Error al ejecutar la consulta:", error); // Manejar errores
      res.status(500).send('Error interno del servidor');
    });
});

module.exports = router;

router.get('/speed', function (req, res, next) {
  db.any("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema' AND schema_name != 'public' AND schema_name != 'newsletter'")
    .then(function (result) {
      console.log("Resultados de la consulta:", result); // Imprimir los resultados en la consola

      // Formatear los nombres de las redes
      var formattedSchemas = result.map(schema => {
        return schema.schema_name.split('_').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' - '); // Unir las partes formateadas con '-'
      });

      console.log("Nombres de redes formateados:", formattedSchemas); // Imprimir los nombres formateados en la consola

      // Renderizar la vista 'speed.ejs' con los nombres de red formateados
      res.render('speed', { schemas: formattedSchemas });
    })
    .catch(function (error) {
      console.error("Error al ejecutar la consulta:", error); // Manejar errores
      res.status(500).send('Error interno del servidor');
    });
});

router.get('/frequency', function (req, res, next) {
  db.any("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema' AND schema_name != 'public' AND schema_name != 'newsletter'")
    .then(function (result) {
      console.log("Resultados de la consulta:", result); // Imprimir los resultados en la consola

      // Formatear los nombres de las redes
      var formattedSchemas = result.map(schema => {
        return schema.schema_name.split('_').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' - '); // Unir las partes formateadas con '-'
      });

      console.log("Nombres de redes formateados:", formattedSchemas); // Imprimir los nombres formateados en la consola

      // Renderizar la vista 'frequency.ejs' con los nombres de red formateados
      res.render('frequency', { schemas: formattedSchemas });
    })
    .catch(function (error) {
      console.error("Error al ejecutar la consulta:", error); // Manejar errores
      res.status(500).send('Error interno del servidor');
    });
});

router.post('/subscribe', function(req, res, next) {
  const email = req.body.email;

  // Verificar si el correo electrónico ya está en la base de datos
  db.oneOrNone('SELECT * FROM newsletter.suscriptores WHERE correo = $1', [email])
    .then(function(result) {
      if (result) {
        // El correo electrónico ya está suscrito
        res.status(400).json({ error: 'El correo electrónico ya está suscrito.' });
      } else {
        // Insertar el nuevo correo electrónico en la base de datos
        db.none('INSERT INTO newsletter.suscriptores (correo) VALUES ($1)', [email])
          .then(function() {
            res.status(201).json({ message: 'Suscrito exitosamente.' });
          })
          .catch(function(error) {
            console.error('Error al insertar en la base de datos:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
          });
      }
    })
    .catch(function(error) {
      console.error('Error al verificar la existencia del correo electrónico:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    });
});


module.exports = router;
