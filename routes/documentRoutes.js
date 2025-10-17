import { createDocument, getDocument, updateDocument, deleteDocument} from "../controllers/documentControllers.js";
import upload from '../middlewares/multerMiddleware.js';
import authMiddleware from '../middlewares/authmiddleware.js';
import express from "express";
const router = express.Router();

router.post('/upload-doc',authMiddleware, upload.single('file') ,createDocument);
router.get('/documents', authMiddleware, getDocument);
router.post('/update-doc/:id', authMiddleware, upload.single('file'), updateDocument);
router.delete('/delete-doc/:id', authMiddleware, deleteDocument);
export default router