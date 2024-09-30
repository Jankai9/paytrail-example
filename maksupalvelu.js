import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { haeMaksuUrlPaytraililta } from './paytrail.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import https from 'https';
import { PROTOKOLLA } from './vakiot.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'salainen_avain', // Vaihda tämä omaan salaisuuteesi
  resave: false, // Älä tallenna istuntoa joka kerta tarkoittaa, että istunto tallennetaan vain, jos se muuttuu
  saveUninitialized: true, // Tallenna istunto, vaikka se ei olisi muuttunut
  cookie: { secure: PROTOKOLLA == 'https' } // Aseta true, jos käytät HTTPS:ää
}));

// Palauta html-sivu
app.get('/maksu-onnistui', (req, res) => {
  console.log('Maksu onnistui',req.query);
  const maksutiedot = req.session.maksutiedot
  console.log('Maksutiedot:', maksutiedot);
  res.sendFile(path.join(__dirname, 'maksu-onnistui.html'));
});

// Palauta html-sivu
app.get('/maksu-keskeytyi', (req, res) => {
  res.sendFile(path.join(__dirname, 'maksu-keskeytyi.html'));
});

// Käsittele maksupyyntö osoitteessa /maksaminen?tuote
app.get('/maksaminen', async (req, res) => {
  try {
    req.session.maksutiedot = req.query // Tallenna maksutiedot istuntoon
    console.log("saatiin lomakkeelta maksutiedot jotka tallennettiin istuntoon",req.query)
    const maksuHref = await haeMaksuUrlPaytraililta(); // Tee maksupyyntö Paytrailille
    console.log('Maksun voi tehdä osoitteessa:', maksuHref);
    
    res.redirect(maksuHref); // Uudelleenohjaa käyttäjä maksusivulle
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

