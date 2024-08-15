import axios from 'axios';
import crypto from 'crypto';

const SECRET = "SAIPPUAKAUPPIAS";

export async function haeMaksuUrlPaytraililta() {
    const httpHeaders = {
        'checkout-account': "375917",
        'checkout-algorithm': 'sha256',
        'checkout-method': 'POST',
        'checkout-nonce': '564635208570151',
        'checkout-timestamp': '2023-09-11 20:19:00.000',
    };

    const httpBody = {
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
    };
    httpHeaders.signature = calculateHmac(SECRET, httpHeaders, httpBody);

    try {
        const response = await axios({
            method: 'post',
            url: 'https://services.paytrail.com/payments',
            data: httpBody,
            headers: httpHeaders,
        });
        // console.log("Response received",response);
        const respObj = response.data;

        if (respObj.status == "error") {
            console.log("Create req failed");
            return ""
        } else {
            // console.log("Providers urls:");
            // respObj.providers.forEach(provider => {
            // console.log(provider.url);
            // });

            // return the url that browser should be redirected to
            return respObj.href;
        }
    } catch (error) {
        console.error("Request failed", error);
        return ""
    }
}

function calculateHmac(secret, params, body) {
    const hmacPayload = Object.keys(params)
        .sort()
        .map((key) => [key, params[key]].join(':'))
        .concat(body ? JSON.stringify(body) : '')
        .join('\n');

    return crypto.createHmac('sha256', secret).update(hmacPayload).digest('hex');
}