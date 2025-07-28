import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from TypeScript Node.js!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
