// Importar módulos de terceros
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { getColorFromURL } = require('color-thief-node');
const dotenv = require('dotenv');
dotenv.config();

// Importar función comprobar si la imagen está repetida en la DB
const { checkRepeatedImage } = require('./utils');

// Importar el modelo
const Image = require('./models/image.model.js');

// Creamos una instancia del servidor Express
const app = express();

// Tenemos que usar un nuevo middleware para indicar a Express que queremos procesar peticiones de tipo POST
app.use(express.urlencoded({ extended: true }));

// Añadimos el middleware necesario para que el client puedA hacer peticiones GET a los recursos públicos de la carpeta 'public'
app.use(express.static('public'));

// Varible para indicar en que puerto tiene que escuchar nuestra app
// process.env.PORT en render.com
// 3000 lo quiero usar para desarrollo local 
console.log("valor del PORT: ", process.env.PORT)
const PORT = process.env.PORT || 4000;

// Especificar a Express que quiero usar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Usamos el middleware morgan para loguear las peticiones del cliente
app.use(morgan('tiny'));

// Cuando nos hagan una petición GET a '/' renderizamos la home.ejs con las imágenes que vienen de la DB y ordenadas por fecha
app.get('/', async (req, res) => {
    const images = await Image.find().sort({ date: -1});  
    res.render('home', {
        images
    });
});

// Cuando nos hagan una petición GET a '/add-image-form' renderizamos el formulario
app.get('/add-image-form', (req, res) => {
    // Se usa para indicar si la imagen fue correctamente añadida o no.
    const isImagePosted = req.query.isImagePosted === 'true';
    //  Se usa para indicar si la URL ya existe en la base de datos.
    const urlExist = req.query.urlExist === 'false';
    // Renderiza el form con las variables anteriores por argumento, con los valores definidos inicialmente.
    res.render('form', { isImagePosted, urlExist });
});

// Cuando nos hagan una petición POST a '/add-image-form' tenemos que recibir los datos del formulario y actualizar nuestra "base de datos"
app.post('/add-image-form', async (req, res, next) => {
    let dominantColor;
    const { title, url, date } = req.body;

    try {
        console.log(req.body);

        // 1. Validación del título
        const regexp = /^[0-9A-Z\s_]+$/i;
        if (title.length > 30 || !regexp.test(title)) {
            return res.status(400).send('Algo ha salido mal...');
        }

         // 2. Verificar si la imagen ya existe en la base de datos
        const repeatedResult = await checkRepeatedImage(url);
        if (repeatedResult) {
             // Si la imagen ya está repetida, renderiza y detén la ejecución
             return res.render('form', {
                isImagePosted: false,
                imageRepeated: url,
                urlExist: true
            });
        }

        // 3. Extraer el color predominante
        dominantColor = await getColorFromURL(url);

        // 4. Crear y guardar el documento en la base de datos
        const newImage = new Image({
            title: title.toUpperCase().trim(),
            url: url.trim(),
            date: date ? new Date(date) : undefined,
            dominantColor
        });

        await newImage.save();

        // 5. Renderizar el formulario con éxito
        res.render('form', {
            isImagePosted: true,
            imageRepeated: undefined
        });

    } catch (err) {
        console.log('Ha ocurrido un error: ', err);

        // Manejo de errores específicos
        if (err.message.includes('Unsupported image type')) {
            return res.status(400).send('No hemos podido obtener el color predominante de la imagen. Por favor, prueba otra URL diferente.');
        }

        // Redirigir al manejador de errores global
        return next(err);
    }

});

async function connectDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a la base de datos');
}

connectDB().catch(err => console.log(err))

app.listen(PORT, (req, res) => {
    console.log("Servidor escuchando correctamente en el puerto " + PORT);
});