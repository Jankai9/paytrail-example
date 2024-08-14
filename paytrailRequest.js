//const crypto = require('crypto');
//const express    = require('express');
//const  bodyParser = require("body-parser");
//const  http       = require('http');
//const  https      = require('https');
//var cors       = require('cors');

import crypto from 'crypto';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import https from 'https';

var mResultStr = "";
var mResult = "error";

//This returns url which opens different payments providers
export async function httpReq() {
    console.log("httpReq() started");

    const SECRET = "SAIPPUAKAUPPIAS";

    const httpHeaders = {
        'checkout-account': "375917",
        'checkout-algorithm': 'sha256',
        'checkout-method': 'POST',
        'checkout-nonce': '564635208570151',
        'checkout-timestamp': '2023-09-11 20:19:00.000',
    };

    const httpBody = {
        stamp: ""+Date.now(),
        //stamp: "unique-identifier-for-merchant",
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
            email: 'test.customer@example.com',
        },
        redirectUrls: {
            success: 'https://ecom.example.com/cart/success',
            cancel: 'https://ecom.example.com/cart/cancel',
        },
    };

    var httpBodyStr = JSON.stringify(httpBody);

    httpHeaders.signature = calculateHmac(SECRET, httpHeaders, httpBody);

    console.log(httpHeaders.signature);

    var options = {
      host: 'services.paytrail.com',
      port: '443',
      path: "/payments",
      method: 'POST',
      headers: httpHeaders
    };

    const req = https.request(options, (resp) => {
        console.log("resp tuli");
        resp.on("data", d => {
            mResultStr += d.toString("utf-8");
        });

        resp.on("end", () => {
            console.log(mResultStr);
            const respObj = JSON.parse(mResultStr);
            if(respObj.status == "error") {
                console.log("Create req failed");
                mResult = "error";
            } else {
                mResult = "ok";

                console.log("Providers urls:");
                for(var i = 0; i < respObj.providers.length; i++) {
                    console.log(respObj.providers[i].url);
                }
                console.log("Href:");
                console.log(respObj.href);
            }
        });

    } );

    req.on("error", (e) => { console.log(e) });

    await req.write(httpBodyStr);
    req.end();

    console.log("httpReq() finished");

    if(mResult == "error") {
        return "";
    }

    return respObj.href;
}

function calculateHmac(secret, params, body) {
    const hmacPayload = Object.keys(params)
        .sort()
        .map((key) => [key, params[key]].join(':'))
        .concat(body ? JSON.stringify(body) : '')
        .join('\n');

    return crypto.createHmac('sha256', secret).update(hmacPayload).digest('hex');
}

