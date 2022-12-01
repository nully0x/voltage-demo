const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs')
const bodyParser = require('body-parser');
const macaroon = fs.readFileSync('./admin.macaroon').toString('hex')
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

const myNode = axios.create({
    baseURL: process.env.baseURL,
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    headers: { 'Grpc-Metadata-macaroon': macaroon }
});

const getInfo = async () => {
    try {
        let res = await myNode.get('/v1/getinfo')
        return res
    } catch (err) {
        console.error(err)
    }
}

const payInvoice = async (invoice) => {
    try {
      let res = await myNode.post('/v2/router/send', {
        payment_request: invoice, 
        timeout_seconds: 60, 
        fee_limit_sat: 100 
      })
      return res
    } catch (err) {
      console.error(err.response)
    }
  }

  const createInvoice = async (amountSatoshis) => {
    try {
      let res = await myNode.post('/v1/invoices', {
        value: amountSatoshis
      })
      return res
    } catch (err) {
    console.error(err.response)
    }
  }


app.get('/get-info', async (req, res) => {
    let info = await getInfo()
    res.send(info.data)
})

app.post('/pay-invoice', async (req, res) => {
    let {invoice} = req.body
    let payment = await payInvoice(invoice)
    res.send(payment.data)
})

app.post('/create-invoice', async (req, res) => {
    let {amount} = req.body
    let invoice = await createInvoice(amount)
    res.send(invoice.data)
})




app.listen(3000, () => console.log('Listening on port 3000!'));
