// Importar módulos de terceros
const express = require('express');
const morgan = require('morgan');
const { getColorFromURL } = require('color-thief-node');
const mongoose = require('mongoose');


// 1. Conexión a la base de datos con Mongoose
main().catch(err => console.error(err));

// Variable global para almacenar el modelo
let Image;

async function main() {
    await mongoose.connect('mongodb+srv://criadomanzaneque:MSNvQed7qIZgA387@cluster0.fl8rdre.mongodb.net/ironhack')

    // 2. Crear Schema
    const imageSchema = new mongoose.Schema({
        title: {
            type: String,
            max: [30, 'El nombre no puede tener más de 30 caracteres'],
            match: /[0-9A-Za-z\s_]+/,
            required: true
        },
        url: {
            type: String,
            match: [ /^(https):\/\/[^\s/$.?#].[^\s]*$/i,
            'Por favor ingrese una URL válida'],
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        dominantColor: {
            type: [Number],
            required: true
        }
    });

    // 3. Asociar Schema a Model
    Image = mongoose.model('Image', imageSchema);

    // 4. Crear una imagen y guardarla (Comentado para que no se cree una imagen de prueba cada vez que levanto el servidor)

    // const image = new Image({
    //     title: 'DOG',
    //     url: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    //     date: '2024-08-07T00:00:00Z',
    //     dominantColor: [200, 150, 100]
    // });

    // try {
    //     await image.save();
    // } catch(err){
    //     console.log('Ha ocurrido un error al guardar el documento', err.message);
    // }
}

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
    let isRepeated;
    const { title, url, date } = req.body;

    try {
        console.log(req.body);

        // 1. Validación del título
        const regexp = /^[0-9A-Z\s_]+$/i;
        if (title.length > 30 || !regexp.test(title)) {
            return res.status(400).send('Algo ha salido mal...');
        }

         // 2. Verificar si la imagen ya existe en la base de datos (isRepeated)
         const isRepeated = await Image.exists({ url: url.trim() });
         if (isRepeated) {
             return res.render('form', {
                 isImagePosted: false,
                 imageRepeated: url
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


// en el futuro es normal que tengamos endpoints como
// app.get('/edit-image-form')

/** Uso de middleware para gestionar cualquier error imprevisto de nuestra aplicaicón y fallar de forma grácil */
app.use((err, req, res, next) => {
    // err.message -> simplemente el mensaje
    // err.stack -> la pila de llamadas
    console.error(err)
    // Enviar un correo electronico o cualquier otro medio a los desarrolladores para que se den cuenta de que algo ha 'petao'
    res.status(500).send('<p>Ups! La operación ha fallado. Vuelve a probarlo más tarde.Regresa a la <a href="/">home page</a></p> ');
})



app.listen(PORT, (req, res) => {
    console.log("Servidor escuchando correctamente en el puerto " + PORT);
});