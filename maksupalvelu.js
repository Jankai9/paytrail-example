import express from 'express';
import bodyParser from 'body-parser';
import { haeMaksuUrlPaytraililta } from './paytrail.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
//const fs = require('fs');
import fs from 'fs';
import https from 'https';
import { PROTOKOLLA } from './vakiot.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Palauta html-sivu
app.get('/maksu-onnistui', (req, res) => {
  console.log('Maksu onnistui',req.query);
  res.sendFile(path.join(__dirname, 'maksu-onnistui.html'));
});

// Palauta html-sivu
app.get('/maksu-keskeytyi', (req, res) => {
  res.sendFile(path.join(__dirname, 'maksu-keskeytyi.html'));
});

// Käsittele maksupyyntö osoitteessa /maksaminen?tuote
app.get('/maksaminen', async (req, res) => {
  try {
    const tuote = req.query.tuote; // Hae tuote parametrina
    const maksuHref = await haeMaksuUrlPaytraililta(); // Tee maksupyyntö Paytrailille
    console.log('Maksun voi tehdä osoitteessa:', maksuHref);
    // Ohjaa käyttäjä maksusivulle
    res.redirect(maksuHref);
  } catch (error) {
    console.error('Virhe maksun käsittelyssä:', error.message);
    console.error('Virheen tiedot:', error);
    res.status(500).resend('Maksun käsittelyssä tapahtui virhe.');
  }
});


const port = process.env.PORT || 3000;

if(PROTOKOLLA === 'http') {
  app.listen(port, () => console.log(`HTTP Palvelin käynnissä portissa ${port}`));
}
else {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
  };
  
  https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`HTTPS palvelin käynnissä portissa ${port}`);
})}

