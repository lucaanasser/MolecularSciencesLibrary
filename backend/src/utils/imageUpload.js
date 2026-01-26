const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Apenas arquivos PNG e JPG são permitidos'));
    }
};

// Multer middleware for single image upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

/**
 * Upload image to specified directory
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} originalName - Original filename
 * @param {String} directory - Subdirectory within /images/ (e.g., 'user-images')
 * @param {Number} maxSizeMB - Maximum file size in MB
 * @returns {String} - Relative path to the uploaded image
 */
const uploadImage = (fileBuffer, originalName, directory, maxSizeMB = 5) => {
    console.log(`🔵 [imageUpload] Iniciando upload de imagem para: ${directory}`);

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileBuffer.length > maxSizeBytes) {
        console.error(`🔴 [imageUpload] Arquivo muito grande: ${fileBuffer.length} bytes`);
        throw new Error(`Arquivo muito grande. Máximo ${maxSizeMB}MB`);
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const filename = `${timestamp}${ext}`;

    // Construct full path
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'images', directory);
    const filePath = path.join(uploadDir, filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`🟢 [imageUpload] Diretório criado: ${uploadDir}`);
    }

    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`🟢 [imageUpload] Imagem salva: ${filename}`);

    // Return relative path for database storage
    return `/images/${directory}/${filename}`;
};

/**
 * Delete image from server
 * @param {String} imagePath - Relative path to the image (e.g., '/images/user-images/12345.png')
 */
const deleteImage = (imagePath) => {
    if (!imagePath) return;

    try {
        const fullPath = path.join(__dirname, '..', '..', 'public', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`🟢 [imageUpload] Imagem deletada: ${imagePath}`);
        }
    } catch (error) {
        console.error(`🔴 [imageUpload] Erro ao deletar imagem: ${error.message}`);
    }
};

module.exports = {
    upload,
    uploadImage,
    deleteImage
};
