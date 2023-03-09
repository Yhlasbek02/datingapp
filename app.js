import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from "./routes/chatRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import socketIo from "socket.io";
import http from "http";


import mongoose from "mongoose";
const app = express();
const server = http.createServer(app)
const io = socketIo(server);
app.use(cors());
app.use('/images', express.static('images'))

app.use(express.json());

io.on('connection', (socket) => {
    console.log(`Client connected with id ${socket.id}`);
    
    socket.on('message', (message) => {
        console.log(`ReceiverId message from client ${socket.id}:${message}`);
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected with id ${socket.id}`);
    });
});

app.use("/", userRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", messageRoutes);


mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
    if (err) console.log(err)
    server.listen(8000, '0.0.0.0', () => console.log('http://locahost:8000'))
    
})



// import express from "express";
// import bodyParser from "body-parser";
// import nodemailer from "nodemailer";
// import path from "path";
// import exphbs from "express-handlebars";

// const app = express();
// app.engine('handlebars', exphbs.engine({extname:"hbs", defaultLayout: false, layoutsDir:"views/ "}));
// app.set('view engine', 'handlebars');

// const __dirname=path.resolve();
// app.use('/public', express.static(path.join(__dirname, 'public')));

// app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.json());

// app.get('/', (req, res) => {
//     res.render('contact');
// });

// var email;
// var otp = Math.random();
// otp = otp * 1000000;
// otp = parseInt(otp);
// console.log(otp);

// let transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: false,
//     service: 'Gmail',

//     auth:{
//         user: 'yusupowyhlas002@gmail.com',
//         pass: 'piozuklhvbrnodal',
//     }
// });

// app.post('/send', (req, res)=>{
//     email=req.body.email;
//     var mailOptions = {
//         to: req.body.email,
//         subject: "otp registration",
//         html: "<h3>otp account is </h3>" + "<h1>"+ otp+"</h1>"
//     };

//     transporter.sendMail(mailOptions, (error, info) =>{
//         if (error){
//             return console.log(error);
//         }
//         console.log('====================================');
//         console.log('message sent: %s', info.messageId);
//         console.log('preview url: %s', nodemailer.getTestMessageUrl(info));
//         res.render('otp');
//     });
// });

// app.post('/verify', (req, res) => {
//     if(req.body.otp==otp){
//         res.send("register successfully");
//     }
//     else{
//         res.render('otp', {msg:'otp is incorrect'});
//     }
// });

// app.post('/resend', (req, res)=>{
//     var mailOptions={
//         to: email,
//         subject: "otp registration is",
//         html: "<h3>otp account is </h3>"+"<h1>"+otp+"</h1>"
//     };

//     transporter.sendMail(mailOptions, (error, info)=>{
//         if(error){
//             return console.log(error);
//         }
//         console.log('====================================');
//         console.log('message sent: %s', info.messageId);
//         console.log('preview url: %s', nodemailer.getTestMessageUrl(info));
//         res.render('otp', {msg:"otp has been sent"});
//     });
// });

// const port = process.env.PORT || 7000;
// app.listen(port, ()=>{
//     console.log(`server running ${port}`);
// })