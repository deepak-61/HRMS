import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const port = process.env.PORT || 4003;
const mongoUrl = process.env.MONGO_URL;
const mongoDb = process.env.MONGO_DB || 'rag';

const client = new MongoClient(mongoUrl);

app.get('/live', (_req, res) => {
  res.json({ status: 'live' });
});

app.get('/health', async (_req, res) => {
  try {
    await client.connect();
    await client.db(mongoDb).command({ ping: 1 });
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`[rag-service] listening on ${port}`);
});

