import express from 'express';
import bodyParser from 'body-parser';
import { haeMaksuUrlPaytraililta } from './paytrailRequest.js'

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Käsittele maksupyyntö osoitteessa /maksaminen?tuote
app.get('/maksaminen', async (req, res) => {
  try {
    const tuote = req.query.tuote; // Hae tuote parametrina
    const maksuHref = await haeMaksuUrlPaytraililta(); // Tee maksupyyntö Paytrailille
    console.log('Maksun voi tehdä osoitteessa:', maksuHref);
    // Ohjaa käyttäjä maksusivulle
    res.redirect(maksuHref);
    // res.status(200).send(`Maksu vastaanotettu tuotteelle: ${tuote}`);
  } catch (error) {
    console.error('Virhe maksun käsittelyssä:', error.message);
    console.error('error:', error);
    res.status(500).resend('Maksun käsittelyssä tapahtui virhe.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Palvelin käynnissä portissa ${port}`));

