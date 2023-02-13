require("dotenv").config();
// Vùng khai báo các biến thư viện hỗ trợ
const express = require('express');
const { json } = require('express/lib/response');
const app = express();
// Hỗ trợ đọc dữ liệu từ body
const bodyParser = require('body-parser')
// Tạo một parser theo định dạng application/json
const jsonParser = bodyParser.json()

const mongoose = require('mongoose');
const db = require('./dataBase/model');

//const port = process.env.port || 3000;

// socket io
const server = require("http").Server(app);
const io = require("socket.io")(server);

// MQTT protocol
const mqtt = require('mqtt')
const host = 'test.mosquitto.org'
const portMqtt = '1883'
const connectUrl = `mqtt://${host}:${portMqtt}`
const topic = "wemos/mobile/chart/datapH"
const topic2 = "wemos/mobile/chart/dataTurbid"
const topic3 = "wemos/mobile/text/datapH"
const topic4 = "wemos/mobile/text/dataTurbid"

const databaseURL =  process.env.URL
mongoose.connect(databaseURL)
    .then((result) => server.listen(process.env.PORT || 3000))
    .catch((err) => console.log(err));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// Email Section // 
const nodemailer = require("nodemailer");
const { resourceLimits } = require('worker_threads');

// let transport = nodemailer.createTransport({
//     service : "gmail",
//     auth:{
//         user: "trnhtommy@gmail.com",
//         pass: "0929689603"
//     },
//     tls:{
//         rejectUnauthorized: false
//     }
// })

// Code cho server //
let transport = nodemailer.createTransport({
    host : "smtp.gmail.com",
    port: 587,
    secure: false,
    ignoreTLS: false,
    auth:{
        user: "nhom4uit19521175@gmail.com",
        pass: "muxghdymqxtoaifb"
    },
    tls:{
        rejectUnauthorized: false
    }
})

let mailOptionpH = {
    from: "nhom4uit19521172@gmail.com",
    to: "baosuper456@gmail.com",
    subject: "pH Notification",
    text: "the pH number is exceeding the average value!"
}

let mailOptionTurbid = {
    from: "alertwemos@gmail.com",
    to: "baosuper456@gmail.com",
    subject: "Turbidity Notification",
    text: "the turbidity number is exceeding the average value!"
}


app.get('/', (req, res)=>{
    db.find({})
        .then((result) =>{
            res.render('Dashboard', {
               giatri : result,
            });
            
        })
})


app.post('/postpH', jsonParser, (req, res)=>{
    const idThietbi = req.body.id;
    const diachi = req.body.diachiDevice;
    const loaiThietbi = req.body.loaiCambien;
    const valuePh = req.body.pH;
    const getDate = new Date();
    const date = getDate.toString();
    var timeCurrServer = getDate.toISOString();
    const displayTimelog = date.slice(0, 15);
    //console.log(displayTimelog);
    const dataBase = new db({
        idDevice1: idThietbi,
        ipDevice1: diachi,
        deviceType1: loaiThietbi,
        valuePh: valuePh,
        displayLog1: displayTimelog,
        StatusTimeServer_pH: timeCurrServer
    })
    dataBase.save();
    res.send("you have sent a pH post request")

})

/// Let's see if we need the code below or not ///
app.post('/postTurbid', jsonParser, (req, res)=>{
    const idThietbi = req.body.id;
    const diachi = req.body.diachiDevice;
    const loaiThietbi = req.body.loaiCambien;
    const valueTurbid = req.body.turbidity;
    const getDate = new Date();
    const date = getDate.toString();
    var timeCurrServer = getDate.toISOString();
    const displayTimelog = date.slice(0, 15);
    //console.log(displayTimelog);
    const dataBase = new db({
        idDevice2: idThietbi,
        ipDevice2: diachi,
        deviceType2: loaiThietbi,
        valueTurbidty: valueTurbid,
        displayLog2: displayTimelog,
        StatusTimeServer_turbid: timeCurrServer
    })
    dataBase.save();
    res.send("you have sent a pH post request")

    
})

//Lấy data từ mongodb mỗi 1s 
setInterval(function(socket){
    db.find({})
        .then((result)=>{

        //// pH Data ////
        let phValue = [];
        for(var i = 0; i< result.length; i++){
            phValue.push(result[i].valuePh)
        }
        //console.log(phValue);
        const phValueString  = phValue + "";
        //console.log(phValueString);
        const String1 = phValueString.split(",");
        //console.log(String1)
        const remove = '';
        const stringDatapH = String1.filter(item => item !== remove);
        const data1 = stringDatapH[stringDatapH.length-1];
        //console.log(data)
        io.sockets.emit("server-send-data-ph-to-dashboard", data1)


        //// Turbid Data ////
        let turbidValue = [];
        for(var i = 0; i< result.length; i++){
            turbidValue.push(result[i].valueTurbidty)
        }
        //console.log(turbidValue);
        const TurbidValueString  = turbidValue + "";
        //console.log(TurbidValueString);
        const String2 = TurbidValueString.split(",");
        //console.log(String1)
        const stringDataTurbid = String2.filter(item => item !== remove);
        const data2 = stringDataTurbid[stringDataTurbid.length-1];
        //console.log(data)
        io.sockets.emit("server-send-data-turbid-to-dashboard", data2)

        //// pH Chart ////
        let phArray = []
        for(var i = 0; i < result.length; i++){
            const getDate = new Date(result[i].StatusTimeServer_pH);
            const seconds = getDate.getTime()
            phArray.push(result[i].valuePh+"*"+seconds);
        }
        //console.log(phArray)
        const valueTrash = "undefined*NaN";
        const phFilter =  phArray.filter(item => item !== valueTrash);
        //console.log(phFilter);
        const data3 = phFilter[phFilter.length-1]
        //console.log(data);
        const dataString1 = data3.split("*");
        //console.log(dataString)
        const data_XvaluePh = dataString1[0];
        const data_YvaluePh = dataString1[1];
        //console.log(data_XvaluePh);
        //console.log(data_YvaluePh);
        io.sockets.emit("server-send-data-ph-to-chart", data_XvaluePh, data_YvaluePh);
        

        //// Turbid Chart ////
        let turbidArray = []
        for(var i = 0; i < result.length; i++){
            const getDate = new Date(result[i].StatusTimeServer_turbid);
            const seconds = getDate.getTime()
            turbidArray.push(result[i].valueTurbidty+"*"+seconds);
        }
        //console.log(turbidArray)
        const turbidFilter =  turbidArray.filter(item => item !== valueTrash);
        //console.log(phFilter);
        const data4 = turbidFilter[turbidFilter.length-1]
        //console.log(data);
        const dataString2 = data4.split("*");
        //console.log(dataString)
        const data_XvalueTurbid = dataString2[0];
        const data_YvalueTurbid = dataString2[1];
        //console.log(data_XvalueTurbid);
        //console.log(data_YvalueTurbid);
        io.sockets.emit("server-send-data-turbid-to-chart", data_XvalueTurbid, data_YvalueTurbid);

        io.sockets.emit("server-send-data-pH-and-Turbid-to-chart", data_XvaluePh, data_XvalueTurbid)
        
        //// MQTT protocol interacting with the mobile version (pH value and pH chart) ////
        const client1 = mqtt.connect(connectUrl);
        let phValue1 = [];
        for(var i = 0; i< result.length; i++){
            phValue1.push(result[i].valuePh)
        }
        //console.log(phValue);
        const phValueString1  = phValue1 + "";
        //console.log(phValueString);
        const String3 = phValueString1.split(",");
        //console.log(String1)
        const stringDatapH1 = String3.filter(item => item !== remove);
        const data5 = stringDatapH1[stringDatapH1.length-1];
        //console.log(data)
        const pH = JSON.stringify({pH: data5});
        //console.log(pH)
        client1.publish(topic3, pH, {qos: 0, retain: false});
        client1.publish(topic, pH, { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
            // else{
            //     console.log("Done!")
            // }
            client1.end();
        })

        //// MQTT protocol interacting with the mobile version (turbid value and turbid chart) ////
        const client2 = mqtt.connect(connectUrl);
        let turbidValue1 = [];
        for(var i = 0; i< result.length; i++){
            turbidValue1.push(result[i].valueTurbidty)
        }
        //console.log(turbidValue);
        const TurbidValueString1  = turbidValue1 + "";
        //console.log(TurbidValueString);
        const String4 = TurbidValueString.split(",");
        //console.log(String1)
        const stringDataTurbid1 = String4.filter(item => item !== remove);
        const data6 = stringDataTurbid[stringDataTurbid.length-1];
        //console.log(data)
        const turbid = JSON.stringify({turbidity: data6});
        client2.publish(topic4, turbid, {qos: 0, retain: false});
        client2.publish(topic2, turbid, { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error(error)
            }
            // else{
            //     console.log("Done - 1!")
            // }
            client2.end();
        })
    })
}, 2000);

setInterval(function(){
    db.find({})
        .then((result)=>{
        let phValue = [];
        for(var i = 0; i< result.length; i++){
            phValue.push(result[i].valuePh)
        }
        //console.log(phValue);
        const phValueString  = phValue + "";
        //console.log(phValueString);
        const String1 = phValueString.split(",");
        //console.log(String1)
        const remove = '';
        const stringDatapH = String1.filter(item => item !== remove);
        const data1 = stringDatapH[stringDatapH.length-1];
        //console.log("pH: ", data1);


        let turbidValue = [];
        for(var i = 0; i< result.length; i++){
            turbidValue.push(result[i].valueTurbidty)
        }
        //console.log(turbidValue);
        const TurbidValueString  = turbidValue + "";
        //console.log(TurbidValueString);
        const String2 = TurbidValueString.split(",");
        //console.log(String1)
        const stringDataTurbid = String2.filter(item => item !== remove);
        const data2 = stringDataTurbid[stringDataTurbid.length-1];
        //console.log("Do duc: ", data2);

        if (data1 > 8.5){
            transport.sendMail(mailOptionpH, function(err, success){
                if(err) {
                    console.log(err)
                } else{
                    console.log("email Ph has been sent successfully!")
                }
            })
        }

        if (data2 > 22 ){
            transport.sendMail(mailOptionTurbid, function(err, success){
                if(err) {
                    console.log(err)
                } else{
                    console.log("email Turbid has been sent successfully!")
                }
            })
        }

    })
}, 10000)
