const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getLogger } = require('../logging/logger');
const log = getLogger(__filename);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Apenas arquivos PNG e JPG sao permitidos'));
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

const uploadImage = (fileBuffer, originalName, directory, maxSizeMB = 5) => {
    log.start('Iniciando upload', { directory, original: originalName });

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileBuffer.length > maxSizeBytes) {
        log.error('Arquivo muito grande', { size: fileBuffer.length, max: maxSizeBytes });
        throw new Error(`Arquivo muito grande. Maximo ${maxSizeMB}MB`);
    }

    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const filename = `${timestamp}${ext}`;

    const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'images', directory);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        log.success('Diretorio criado', { dir: uploadDir });
    }

    fs.writeFileSync(filePath, fileBuffer);
    log.success('Imagem salva', { file: filename });

    return `/images/${directory}/${filename}`;
};

const deleteImage = (imagePath) => {
    if (!imagePath) return;

    try {
        const fullPath = path.join(__dirname, '..', '..', '..', 'public', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            log.success('Imagem deletada', { path: imagePath });
        }
    } catch (error) {
        log.error('Erro ao deletar imagem', { path: imagePath, err: error.message });
    }
};

module.exports = {
    upload,
    uploadImage,
    deleteImage
};
