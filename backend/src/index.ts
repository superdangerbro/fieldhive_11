import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Forms endpoints
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      include: { createdBy: true }
    });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Map features endpoints
app.get('/api/features', async (req, res) => {
  try {
    const features = await prisma.mapFeature.findMany();
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

app.post('/api/features', async (req, res) => {
  try {
    const feature = await prisma.mapFeature.create({
      data: {
        type: req.body.type,
        geometry: req.body.geometry,
        properties: req.body.properties
      }
    });
    res.json(feature);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 