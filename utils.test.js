// Importar el modelo
const Image = require('./models/image.model.js');
const { checkRepeatedImage } = require("./utils");

// Mock simple del método exists
Image.exists = jest.fn()

describe('checkRepeatedImage', () => {
    it('should return true if the image exists', async () => {
        // Simular que la imagen existe
        Image.exists.mockResolvedValueOnce(true);
        const result = await checkRepeatedImage('http://example.com/image.jpg');
        expect(result).toBe(true);
    })
    it('should return false if the image does not exist', async () => {
        // Simular que la imagen no existe
        Image.exists.mockResolvedValueOnce(false);
        const result = await checkRepeatedImage('http://example.com/image.jpg');
        expect(result).toBe(false);
    })
})