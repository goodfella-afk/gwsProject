import express from 'express';
import campaigns from './routes/campaigns.js';
import harpoon from './routes/harpoon.js';
import cors from 'cors';
import https from 'https';
import fs from 'fs';

const tls = {
  key: fs.readFileSync('/opt/gwsProject/api/tls/priv.pem'),
  cert: fs.readFileSync('/opt/gwsProject/api/tls/pub.pem')
}
const app = express();

//Body parser middleware
app.use(express.json());

//text/plain parser middleware
app.use(express.text());

//CORS middleware
app.use(cors());

// Routes
app.use('/api/campaigns', campaigns);
app.use('/api/harpoon', harpoon);

app.get('/', (req,res) => {
  res.send({message: 'Welcome, fun is at /api/campaigns'});
});

// http
// app.listen(5000, () => console.log('srw running at 5000'));

// https
https.createServer(tls, app).listen(5000, () => {
  console.log('backend running on https://localhost:5000');
})
