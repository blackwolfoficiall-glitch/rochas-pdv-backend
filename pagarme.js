const fetch=require('node-fetch');
const KEY=process.env.PAGARME_API_KEY||'';
async function createOrder({amount,description}){
 if(!KEY){
  return {id:'mock_'+Date.now(),amount,description,status:'waiting_payment'};
 }
 const url="https://api.pagar.me/core/v5/orders";
 const payload={amount,items:[{amount,quantity:1,description}]};
 const r=await fetch(url,{
  method:"POST",
  headers:{Authorization:`Bearer ${KEY}`,"Content-Type":"application/json"},
  body:JSON.stringify(payload)
 });
 if(!r.ok)throw new Error(await r.text());
 return await r.json();
}
module.exports={createOrder};