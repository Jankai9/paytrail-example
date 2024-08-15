import express from 'express';
import bodyParser from 'body-parser';
import { haeMaksuUrlPaytraililta } from './paytrailRequest.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Palauta html-sivu
app.get('/maksu-onnistui', (req, res) => {
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
    console.error('error:', error);
    res.status(500).resend('Maksun käsittelyssä tapahtui virhe.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Palvelin käynnissä portissa ${port}`));
