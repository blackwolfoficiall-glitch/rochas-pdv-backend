const {Server}=require('socket.io');
module.exports=server=>{
 const io=new Server(server,{cors:{origin:"*"}});
 io.on('connection',s=>{
  console.log('socket',s.id);
  s.on('disconnect',()=>console.log('bye',s.id));
 });
 return io;
};