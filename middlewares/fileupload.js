const multer = require("multer")
const { v4: uuidv4 } = require("uuid")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop()
        const filename = `${file.fieldname}-${uuidv4()}.${ext}`
        cb(null, filename)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true)
    else cb(new Error("Only image allowed"), false)
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
})

// Custom middleware to normalize file paths
const normalizeFilePath = (req, res, next) => {
    if (req.file) {
        // Convert Windows backslashes to forward slashes for consistency
        req.file.path = req.file.path.replace(/\\/g, '/');
        console.log('Normalized file path:', req.file.path);
    }
    next();
};

module.exports = {
    single: (fieldName) => [
        upload.single(fieldName),
        normalizeFilePath
    ],
    array: (fieldName, maxCount) => [
        upload.array(fieldName, maxCount),
        normalizeFilePath
    ],
    fields: (fieldsArray) => [
        upload.fields(fieldsArray),
        normalizeFilePath
    ]
}