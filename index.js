import { httpReq } from './paytrailRequest.js'

const paymentHref = await httpReq()
console.log("maksun voi tehdä osoitteessa: ", paymentHref)
