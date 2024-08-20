import { httpReq } from './paytrail.js'

const paymentHref = await httpReq()
console.log("maksun voi tehdä osoitteessa: ", paymentHref)
