import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/firebase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running!' });
});

app.get('/test-firestore', async (req, res) => {
  try {
    const testCollection = db.collection('test');
    const snapshot = await testCollection.get();
    res.json({ 
      success: true, 
      message: 'Firestore connection successful',
      documentsCount: snapshot.size 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Firestore connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});