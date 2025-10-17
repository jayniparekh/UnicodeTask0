import Document from '../models/document.js';

async function createDocument(req, res) {
        const { title, content } = req.body;
        const filePath = req.file ? req.file.path : null;
        if(!req.file){
            return res.status(400).json({ error: "Please upload a file"});
        }
        if(!req.userPayload || !req.userPayload.sub){
            return req.status(401).json({error: "Unauthorized"});
        }

        try{
            const newDoc = new Document({
                title,
                content,
                createdBy: req.userPayload.sub,
                filePath: req.file.path
            
            });
            await newDoc.save();
            res.status(201).json({ message: 'Document created successfully', newDoc });
        }
        catch(err){
            console.error(err);
            res.status(500).json({ error: 'Failed to create document' });
    
        }
}

async function getDocument(req, res) {
try{
    if(!req.userPayload || !req.userPayload.sub){
            return req.status(401).json({error: "Unauthorized"});
        }
    const documents = await Document.find();
    res.status(200).json(documents);
}catch(err){
    console.error(err);
    res.status(500).send(err);
 }
}

async function updateDocument(req, res) {
    const { id } = req.params;
    if(!req.userPayload || !req.userPayload.sub){
            return req.status(401).json({error: "Unauthorized"});
        }
    const { title, content } = req.body;
    const filePath = req.file ? req.file.path : null;
        if(!req.file){
            return res.status(400).json({ error: "Please upload a file"});
        }

  try {
    const documents = await Document.findByIdAndUpdate(id, { title, content, filePath}, { new: true }).select('_id title content filePath');
    res.send(documents);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
}

async function deleteDocument(req, res) {
    const id= req.params.id;
try{
    if(!req.userPayload || !req.userPayload.sub){
            return req.status(401).json({error: "Unauthorized"});
        }
    const document = await Document.findByIdAndDelete(id).select(' _id title content filePath');
    res.send(document);
    res.send("Document deleted successfully");
}catch(err){
    console.error(err);
    res.status(500).send(err);
}
}

export {
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument
}