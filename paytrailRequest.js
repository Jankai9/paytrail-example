import axios from 'axios'
import crypto from 'crypto'

// tähän tulee myöhemmin oikea kauppiastili ja salasana
const SALASANA = "SAIPPUAKAUPPIAS"
const KAUPPIAAN_TILI = "375917"

export async function haeMaksuUrlPaytraililta() {
    const otsikot = {
        'checkout-account': KAUPPIAAN_TILI,
        'checkout-algorithm': 'sha256',
        'checkout-method': 'POST',
        'checkout-nonce': '564635208570151',
        'checkout-timestamp': '2023-09-11 20:19:00.000',
    }

    const sisältö = {
        stamp: ""+Date.now(),
        reference: '3759170',
        amount: 1525,
        currency: 'EUR',
        language: 'FI',
        items: [
            {
                unitPrice: 1525,
                units: 1,
                vatPercentage: 24,
                productCode: '#1234',
                deliveryDate: '2023-09-11',
            },
        ],
        customer: {
            email: 'jaska@jotain.com',
        },
        redirectUrls: {
            success: 'http://localhost:3000/maksu-onnistui',
            cancel: 'http://localhost:3000/maksu-keskeytyi',
        },
    }
    otsikot.signature = teeAllekirjoitus(SALASANA, otsikot, sisältö)

    try {
        const response = await axios({
            method: 'post',
            url: 'https://services.paytrail.com/payments',
            data: sisältö,
            headers: otsikot,
        })
        const respObj = response.data

        if (respObj.status == "error") {
            console.log("Create req failed")
            return ""
        } else {
            // palautetaan osoite maksua varten
                        return respObj.href
        }
    } catch (error) {
        console.error("Request failed", error)
        return ""
    }
}

function teeAllekirjoitus(paytrailSalasana, headerit, sisältö) {
    const hmacPayload = Object.keys(headerit)
        .sort()
        .map((key) => [key, headerit[key]].join(':'))
        .concat(sisältö ? JSON.stringify(sisältö) : '')
        .join('\n')

    return crypto.createHmac('sha256', paytrailSalasana).update(hmacPayload).digest('hex')
}