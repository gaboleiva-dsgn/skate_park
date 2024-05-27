const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const expressFileUpload = require("express-fileupload");
const path = require('path')
const secretKey = "superSecretKey";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo y escuchando por el puerto ${PORT}!`);
});

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// importamos funciones desde consultas
const { getSkaters, registrarSkater, statusSkater, consultarSkater, deleteSkater, updateSkater } = require('./consultas/consultas');
const { log } = require("console");

// creamos carpeta publica para subir archivos
app.use(express.static(__dirname + "/assets"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/axios', express.static(__dirname + '/node_modules/axios/dist'));

// limitamos el tamaño de archivos que se pueden subir
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido",
  })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/main`,
  })
);
app.set("view engine", "handlebars");

// Rutas de la aplicación
app.get('/', async (req, res, next) => {
  try {
    const result = await getSkaters();
    // console.log("Valor de result: ", result);
    res.render('Home', { skaters: result });
  } catch (error) {
    next(error);
  }

});

app.get('/login', (req, res) => {
  res.render('Login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Valor de req.body: ", req.body);
  const skater = await consultarSkater(email, password);
  console.log("Valor de skater: ", skater);
  if (email ===  "" || password === "") {
    res.status(400).send('Debe ingresar un email y una contraseña');
  } else {
    if (skater) {
      if (skater.estado === true) {
        const token = jwt.sign(skater, secretKey, { expiresIn: '2m' });
        console.log("token: ", token);
        res.status(200).send(`<script>alert("Se ha autenticado correctamente."); window.location.href = "/datos?token=${token}"</script>`);
        // res.redirect(`/Datos?token=${token}`);
        console.log("token: ", token);
      }
      else {
        res.status(401).send(`<script>alert("Skaters no ha sido autorizado aún."); window.location.href = "/login"; </script>`);
      }
    } else {
      res.status(401).send('<script>alert("No se ha podido ingresar"); window.location.href = "/login"; </script>');
    }
  }
});

app.get('/registro', (req, res) => {
  res.render('Registro');
});

app.get('/datos', (req, res) => {
  let { token } = req.query;
  jwt.verify(token, secretKey, (err, skater) => {
    const data = skater;
    if (err) {
      res.status(401).json({
        error: "401 Unauthorized",
        message: err.message,
      });
    } else {
      res.render('Datos', data);
    }
  });

});

app.get('/admin', async (req, res) => {
  try {
    const result = await getSkaters();
    res.render('Admin', { skaters: result });
  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500
    })
  }
});

// ruta para registro de skaters
app.post('/registro', async (req, res) => {
  const { email, nombre, password, password2, anos_experiencia, especialidad } = req.body;
  const { foto } = req.files;
  const { name } = foto;

  try {
    await registrarSkater(email, nombre, password, anos_experiencia, especialidad, name)
      .then(() => {
        if (!req.files) {
          return res.status(400).send('No se han adjuntado foto de perfil');
        }
        foto.mv(`${__dirname}/assets/uploads/${name}`, (err) => {
          if (err) {
            return res.status(500).send(err);
          }
        });
        res.status(200).send('<script>alert("Se ha registrado con éxito."); window.location.href = "/"; </script>');
      });

  } catch (error) {
    res.status(500).send({
      error: `Algo salió mal... ${error}`,
      code: 500
    })
  }
});

// Ruta para editar estado de un skater
app.put("/skater", async (req, res) => {
  try {
    const { id, estado } = req.body;
    const respuesta = await statusSkater(id, estado);
    res.status(200).send(JSON.stringify(respuesta));
  } catch (e) {
    return res.status(500).send({
      error: `Algo salió mal acá... ${e.message}`,
      code: 500
    })
  };
});

// Ruta para actualizar datos de un skater
app.post('/actualizar', async (req, res) => {
  console.log("Valor de req.body: ", req.body);
  let { email, nombre, password, anos_experiencia, especialidad } = req.body;
  try {
    await updateSkater(email, nombre, password, anos_experiencia, especialidad);
    res.send('<script>alert("Datos actualizados con éxito."); window.location.href = "/"; </script>');
  } catch (error) {
    res.status(500).send(`Error en actualización de datos. ${error}`)
  }
});

// Ruta eliminar un skater
app.post('/eliminar', async (req, res) => {
  try {
    const { id } = req.query;
    console.log("Valor de id: ", req.query);
    await deleteSkater(id);
    res.status(200).send(`<script>alert("La cuenta con ${id} ha sido eliminada con éxito."); window.location.href = "/"; </script>`);
  } catch (e) {
    return res.status(500).send({
      error: `Algo salió mal... ${e.message}`,
      code: 500
    })
  };
});


