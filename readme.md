### Project: Photolibrary - Image Manager with NodeJS

The project involves creating a NodeJS script to insert multiple image URLs with additional fields and to display all inserted images. The application also gathers and reports on specific image characteristics.

### Requirements

**Navigation Menu**

- Menu with two options: "Show Images" and "Add Image".
- Elements aligned horizontally.
- Background color changes on hover.

**Add New Image**

- Form to add a new image URL with the following fields:
  - **Title**: Maximum 30 characters, only numbers, letters, spaces, and underscores.
  - **URL**: Must be valid.
  - **Date**: Selectable from a calendar or manually.
- Validation of all fields upon submission.
- If the URL already exists, display an error message and do not add the image.

**Show Stored Images**

- Page displaying all stored images, with:
  - Title (in uppercase).
  - Date.
  - Images sorted by date (most recent first).

**Analyze Dominant Color**

- Analyze and display the dominant color of each image.
- NPM module: `color-thief-node`.
- Display a visual element with the dominant color and its RGB or hexadecimal code.

### Installation and Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/your-repo.git
   ```
2. Navigate to the project directory:
   ```sh
   cd your-repo
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the server:
   ```sh
   npm start
   ```

### Usage

1. Open your browser and go to `http://localhost:3000`.
2. Use the menu to navigate between "Show Images" and "Add Image".
3. Add new images using the form and view all stored images along with their dominant colors.

### Dependencies

- `express`: To create the server and handle routes.
- `morgan`: To log requests.
- `color-thief-node`: To extract the dominant color from images.

### Example Usage of `color-thief-node`

To extract the dominant color from a URL, you can use the following code snippet:

```javascript
const { getColorFromURL } = require("color-thief-node");

(async () => {
  const color = await getColorFromURL("https://example.com/image.jpg");
  console.log(color);
})();
```
