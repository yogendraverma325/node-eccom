import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG & PNG allowed"));
    }
    cb(null, true);
  }
});

export const productUploadMiddleware = (req, res, next) => {
  upload.single("image")(req, res, function (err) {

    if (err) {
      req.formError = {
        image: err.message
      };
      return next();
    }

    next();
  });
};

export const productMultipleUploadMiddleware = (req, res, next) => {

  upload.fields([
    { name: "images[0]", maxCount: 1 },
    { name: "images[1]", maxCount: 1 },
    { name: "images[2]", maxCount: 1 }
  ])(req, res, function (err) {

    if (err) {
      req.formError = { images: err.message };
      return next();
    }

    next();
  });
};
