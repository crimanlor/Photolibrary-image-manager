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
    const urlExist = req.query.urlExist === 'false';
    res.render('form', { isImagePosted, urlExist });
})

    // Cuando nos hagan una petición POST a '/add-image-form' tenemos que recibir los datos del formulario y actualizar nuestra "base de datos"
    app.post('/add-image-form', (req, res) => {

        // Todos los datos vienen del objeto req.body
        console.log(req.body)
    
        // Extraemos la propiedad del objeto que tenemos que añadir al formulario y la añadimos al array de images
        const { title, url, date } = req.body

        // URL Existente: Si la URL ya existe en la base de datos del servidor, no se añade al almacén de imágenes y se muestra un mensaje al usuario indicándolo.
        urlExist = images.some(image => image.url === url.trim());
        
        if(urlExist){
            res.render('form', {
                isImagePosted: false,
                urlExist: true
            });
        } else {
            images.push({ title, url: url.trim(), date })
            console.log('array de imagenes actualizado: ', images);
            res.render('form', {
                isImagePosted: true,
                urlExist: false
            });
        }
        
})


// PUERTO DE ESCUCHA PARA EL SERVIDOR
app.listen('3000', (rep, res) => {
    console.log("Servidor escuchando correctamente en el puerto 3000.")
});