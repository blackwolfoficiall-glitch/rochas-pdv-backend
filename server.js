require('dotenv').config();
const express=require('express');
const http=require('http');
const path=require('path');
const bodyParser=require('body-parser');
const cors=require('cors');
const pagarme=require('./pagarme');
const stone=require('./stoneWebhook');
const createSocket=require('./socket');
const app=express();
const server=http.createServer(app);
const io=createSocket(server);
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.get('/status',(req,res)=>res.json({ok:true}));
app.post('/criar-pedido',async(req,res)=>{
 try{
  const {valor,descricao}=req.body;
  if(!valor)return res.status(400).json({error:'valor obrigatório'});
  const amount=Math.round(Number(valor)*100);
  const order=await pagarme.createOrder({amount,description});
  io.emit('order_created',{order});
  return res.json({ok:true,order});
 }catch(e){return res.status(500).json({error:String(e)})}
});
app.post('/webhook/pagarme',(req,res)=>{
 try{
  const payload=req.body;
  io.emit('payment_update',{payload});
  return res.json({ok:true});
 }catch(e){return res.status(500).json({ok:false})}
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log('Backend ON',PORT));