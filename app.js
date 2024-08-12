// Módulos de terceros
const express = require('express');
const morgan = require('morgan');
const { getColorFromURL } = require('color-thief-node');
const { MongoClient, ServerApiVersion } = require('mongodb');

// CONEXIÓN BASE DE DATOS
const uri = "mongodb+srv://criadomanzaneque:MSNvQed7qIZgA387@cluster0.fl8rdre.mongodb.net/";

// Crear un MongoClient con un objeto MongoClientOptions para establecer la versión estable de la API
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }}
);

// Variable global para gestionar base de datos
let database;

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

// DEFINIR QUÉ VAMOS A MOSTRAR AL CLIENTE CON CADA PETICION

// Cuando nos hagan una petición GET a '/' renderizamos la home.ejs
app.get('/', async (req, res) => {
    const images = await database.collection('images').find().toArray()

    // Ordenar las imágenes por fecha:
    const sortedImages = [...images].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Renderizar la home con las imágenes ordenadas por fecha
    res.render('home', { images: sortedImages });
})

// Cuando nos hagan una petición GET a '/add-image-form' renderizamos el form.ejs
app.get('/add-image-form', (req, res) => {

    // Accede a los siguientes parámetros de la URL, cuando hagamos get de form al añadir una imagen:

    // Para indicar si la imagen fue correctamente añadida o no.
    const isImagePosted = req.query.isImagePosted === 'true';

    //  Para indicar si la URL ya existe en la base de datos.
    const urlExist = req.query.urlExist === 'false';

    // Renderizar el form con las variables anteriores por argumento, con los valores definidos inicialmente.
    res.render('form', { isImagePosted, urlExist });
})

// Cuando nos hagan una petición POST a '/add-image-form' tenemos que recibir los datos del formulario y actualizar nuestra "base de datos"
app.post('/add-image-form', async (req, res) => {

    // Mostrar para ver si están llegando bien todos los datos vienen del objeto req.body
    console.log(req.body)

    // Extraemos la propiedad del objeto que tenemos que añadir al formulario y la añadimos al array de images
    const { title, url, date } = req.body

    // Title tiene que mostrarse en mayúsculas:
    const titleInUpperCase = title.toUpperCase();

    // Funcionalidad URL Existente: Si la URL ya existe en la base de datos del servidor, no se añade al almacén de imágenes y se muestra un mensaje al usuario indicándolo.

    urlExist = await database.collection('images').findOne({ url: url.trim() });
    
    if(urlExist){
        res.render('form', {
            isImagePosted: false,
            urlExist: true
        });
    } else {
        // Funcionalidad Obtener color predominante de la url
        const dominantColor = await getColorFromURL(url.trim());

        // Añadir la imagen/documento a la DB
        database.collection('images').insertOne({
            titleInUpperCase,
            url,
            date: new Date(date),
            dominantColor
        });

        res.render('form', {
            isImagePosted: true,
            urlExist: false
        });
    }
        
})

// PUERTO DE ESCUCHA PARA EL SERVIDOR
app.listen(process.env.PORT || 3000, async () => {
    console.log("Servidor escuchando correctamente en el puerto 3000.")
    
    try {
        await client.connect();

        // Seleccionar base de datos
        database = client.db("ironhack");

        // Mensaje de confirmación
        console.log("Conexión a la base de datos OK.")

    } catch (err) {
        console.error(err);
    }
});