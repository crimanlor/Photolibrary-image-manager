// Módulos de terceros
const express = require('express');
const morgan = require('morgan');
const { getColorFromURL } = require('color-thief-node');
const { MongoClient, ServerApiVersion } = require('mongodb');

// CONEXIÓN BASE DE DATOS
// Connection string: el string donde especificamos usuario:contraseña y URL de conexión 
// Unique Resource Identifier
const uri = "mongodb+srv://criadomanzaneque:MSNvQed7qIZgA387@cluster0.fl8rdre.mongodb.net/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

// Definir "Base de datos":
const images = [
    {
        title: "HAPPY CAT",
        url: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
        date: "2024/07/14",
        dominantColor: [133, 133, 133]
    }, {
        title: "CUTE DOG",
        url: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        date: "2024/07/20",
        dominantColor: [200, 150, 100]
    }, {
        title: "AWESOME ZEBRAS",
        url: "https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=800",
        date: "2024/07/22",
        dominantColor: [109, 130, 46]
    }
];

// DEFINIR QUÉ VAMOS A MOSTRAR AL CLIENTE CON CADA PETICION
// Cuando nos hagan una petición GET a '/' renderizamos la home.ejs
app.get('/', async (req, res) => {

    const images = await database.collection('images').find().toArray()

    // Ordenar las imágenes ordenadas por fecha:
    const sortedImages = [...images].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.render('home', { images: sortedImages });

})

// Cuando nos hagan una petición GET a '/add-image-form' renderizamos el form.ejs
app.get('/add-image-form', (req, res) => {

    // Accede a los siguientes parámetros de la URL, para cuando hagamos get de form al añadir una imagen:
    // Se usa para indicar si la imagen fue correctamente añadida o no.
    const isImagePosted = req.query.isImagePosted === 'true';
    //  Se usa para indicar si la URL ya existe en la base de datos.
    const urlExist = req.query.urlExist === 'false';
    // Renderiza el form con las variables anteriores por argumento, con los valores definidos inicialmente.
    res.render('form', { isImagePosted, urlExist });
})

// Cuando nos hagan una petición POST a '/add-image-form' tenemos que recibir los datos del formulario y actualizar nuestra "base de datos"
app.post('/add-image-form', async (req, res) => {

    // Todos los datos vienen del objeto req.body
    console.log(req.body)

    // Extraemos la propiedad del objeto que tenemos que añadir al formulario y la añadimos al array de images
    const { title, url, date } = req.body

    // Title tiene que mostrarse en mayúsculas:
    const titleInUpperCase = title.toUpperCase();

    // URL Existente: Si la URL ya existe en la base de datos del servidor, no se añade al almacén de imágenes y se muestra un mensaje al usuario indicándolo.
    urlExist = images.some(image => image.url === url.trim());
    
    if(urlExist){
        res.render('form', {
            isImagePosted: false,
            urlExist: true
        });
    } else {
        // Obtener color predominante de la url
        const dominantColor = await getColorFromURL(url.trim());
        // images.push({ title: titleInUpperCase, url: url.trim(), date, dominantColor })
        // console.log('array de imagenes actualizado: ', images);

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

        // seleccionar base de datos
        database = client.db("ironhack");

        // Mensaje de confirmación de que nos hemos conectado a la base de datos
        console.log("Conexión a la base de datos OK.")

    } catch (err) {
        console.error(err);
    }
});