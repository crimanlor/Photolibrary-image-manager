// Módulos de terceros
const express = require('express');
const morgan = require('morgan');
const { getColorFromURL } = require('color-thief-node');

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
        title: "happy cat",
        url: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
        date: "2024/07/14",
        dominantColor: [133, 133, 133]
    }, {
        title: "happy dog",
        url: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        date: "2024/07/20",
        dominantColor: [200, 150, 100]
    }
];

// DEFINIR QUÉ VAMOS A MOSTRAR AL CLIENTE CON CADA PETICION
// Cuando nos hagan una petición GET a '/' renderizamos la home.ejs
app.get('/', (req, res) => {

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
        images.push({ title: titleInUpperCase, url: url.trim(), date, dominantColor })
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