// Importar el modelo
const Image = require('./models/image.model.js');

async function checkRepeatedImage(url){
    const isRepeated = await Image.exists({url: url.trim()});
    return isRepeated
}

module.exports = { checkRepeatedImage }
