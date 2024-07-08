// Módulos de terceros
const express = require('express');
const morgan = require('morgan');

// Crear instancia servidor Express
const app = express();

// MIDDLEWARES:
// Gestionar peticiones post
app.use(express.urlencoded({extended: true}));

// Peticiones get del cliente a recursos públicos
app.use(express.static('public'));

// Loguear peticiones del cliente
app.use(morgan('tiny'));


// OTRAS CONFIGURACIONES
// Especificar a Express que quiero utilizar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Definir "Base de datos":
const images = [];

// DEFINIR QUÉ VAMOS A MOSTRAR AL CLIENTE CON CADA PETICION
// Cuando nos hagan una petición GET a '/' renderizamos la home.ejs
app.get('/', (req, res) => {

    // 2. Usar en el home.ejs el forEach para iterar por todas las imágenes de la variable 'images'. Mostrar de momento solo el título 
    res.render('home', { images });
})

// Cuando nos hagan una petición GET a '/add-image-form' renderizamos el form
app.get('/add-image-form', (req, res) => {

    // Lee el parámetro de la URL, para cuando hagamos get de form al añadir una imagen
    const isImagePosted = req.query.isImagePosted === 'true';
    res.render('form', { isImagePosted });
})

    // Cuando nos hagan una petición POST a '/add-image-form' tenemos que recibir los datos del formulario y actualizar nuestra "base de datos"
    app.post('/add-image-form', (req, res) => {

        // Todos los datos vienen del objeto req.body
        console.log(req.body)
    
        // Extraemos la propiedad del objeto que tenemos que añadir al formulario y la añadimos al array de images
        const { title, url, date } = req.body
        images.push({ title, url, date })
        console.log('array de imagenes actualizado: ', images);

        // 4julio: Tras insertar una imagen, se le avisará al usuario que se ha añadido la imagen 'dejaremos' el formulario visible.
        res.render('form', {
            isImagePosted: true
        });
})


// PUERTO DE ESCUCHA PARA EL SERVIDOR
app.listen('3000', (rep, res) => {
    console.log("Servidor escuchando correctamente en el puerto 3000.")
});