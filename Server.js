import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path, { dirname } from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

// To get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve images from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Utility: Read members.json safely
function readMembers() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'members.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log('No members.json found or error reading, starting with empty array');
    return [];
  }
}

// Utility: Save members.json
function saveMembers(members) {
  fs.writeFileSync(path.join(__dirname, 'members.json'), JSON.stringify(members, null, 2));
}

// Get all members
app.get('/members', (req, res) => {
  const members = readMembers();
  console.log('Returning members:', members);
  res.json(members);
});

// Add new member
app.post('/members', upload.single('file'), (req, res) => {
  console.log('=== POST /members ===');
  console.log('Body received:', req.body);
  console.log('File received:', req.file ? req.file.filename : 'No file');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const members = readMembers();
  
  const newMember = {
    id: Date.now(),
    name: req.body.name || '',
    position: req.body.position || '',
    description: req.body.description || '',
    achievements: req.body.achievements || '',
    preview: '/uploads/' + req.file.filename,
    createdAt: new Date().toISOString()
  };
  
  console.log('New member created:', newMember);
  
  members.push(newMember);
  saveMembers(members);
  
  console.log('Member saved successfully');
  res.json(newMember);
});

// Update existing member
app.put('/members/:id', upload.single('file'), (req, res) => {
  console.log('=== PUT /members/:id ===');
  console.log('Body received:', req.body);
  console.log('File received:', req.file ? req.file.filename : 'No new file');
  
  const id = Number(req.params.id);
  let members = readMembers();
  const memberIndex = members.findIndex(m => m.id === id);
  
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }
  
  const existingMember = members[memberIndex];
  
  const updatedMember = {
    ...existingMember,
    name: req.body.name || existingMember.name,
    position: req.body.position || existingMember.position,
    description: req.body.description || existingMember.description,
    achievements: req.body.achievements || existingMember.achievements,
    updatedAt: new Date().toISOString()
  };
  
  // Handle new image upload
  if (req.file) {
    // Delete old image
    if (existingMember.preview) {
      const oldImagePath = path.join(__dirname, existingMember.preview);
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }
    updatedMember.preview = '/uploads/' + req.file.filename;
  }
  
  members[memberIndex] = updatedMember;
  saveMembers(members);
  
  console.log('Member updated successfully:', updatedMember);
  res.json(updatedMember);
});

// Delete member
app.delete('/members/:id', (req, res) => {
  console.log('=== DELETE /members/:id ===');
  const id = Number(req.params.id);
  let members = readMembers();
  
  // Find member to delete (for cleanup)
  const memberToDelete = members.find(m => m.id === id);
  
  if (memberToDelete) {
    // Delete image file if it exists
    if (memberToDelete.preview) {
      const imagePath = path.join(__dirname, memberToDelete.preview);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Deleted image file:', imagePath);
        }
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    members = members.filter(m => m.id !== id);
    saveMembers(members);
    console.log('Member deleted successfully');
    res.json({ success: true, members });
  } else {
    res.status(404).json({ error: 'Member not found' });
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

app.get("/", (req, res) => {
  res.send("✅ NGO Members Backend is running! Use /members to get data.");
});



app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('GET /members - Get all members');
  console.log('POST /members - Add new member');
  console.log('PUT /members/:id - Update member');
  console.log('DELETE /members/:id - Delete member');
});