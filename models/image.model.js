const { Schema, model } = require('mongoose');

// 2. Crear Schema
const imageSchema = new Schema({
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
const Image = model('Image', imageSchema);
module.exports =  Image;