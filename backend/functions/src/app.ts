import express from 'express';
import cors from 'cors';
import { db } from './config/firebase';

const app = express();

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

export default app;