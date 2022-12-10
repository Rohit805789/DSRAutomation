
const { text } = require("body-parser");
const express = require("express");
const app = express();
const ibmdb = require("ibm_db");
const router = express.Router();


const schedule = require('node-schedule');
const nodemailer = require('nodemailer');

const ibmConfig = {
    DATABASE: "ADANI",
    SERVERNAME: "192.168.29.58",
    UID: "db2admin",
    PWD: "p@ssw0rd",
    PORT: "50000",
    PROTOCOL: "TCPIP"
  };



console.log('The answer to life, the universe, and everything!');

schedule.scheduleJob('*/30 * * * * *', function(){
Pending_Data();
});

function Pending_Data(){

    ibmdb.open(ibmConfig, function (err, conn) {
      if (err) console.log(err);
  
      let q4=   `SELECT "USERMASTER"."USERID" AS "USERID","USERMASTER"."FIRSTNAME" AS "FIRSTNAME","USERMASTER"."LASTNAME" AS "LASTNAME",`;
          q4+=  `"USERGROUPS"."LEVELID" AS "LEVELID","DSRSTATUS"."BUID" AS"BUID","DSRSTATUS"."BVID" AS "BVID","DSRSTATUS"."SIID" AS "SIID",`;
          q4+=  `"BUMASTER"."BUNAME" AS "BUNAME","BVMASTER"."BVNAME" AS "BVNAME","SIMASTER"."SINAME" AS "SINAME","DSRSTATUS"."DSRDATE" AS "DSRDATE","USERMASTER"."EMAIL" "EMAIL", "DSRSTATUS"."DSRSTATUS" "DSRSTATUS" `; 
          q4+=  ` FROM ((((((ADANI."USERMASTER" "USERMASTER"`; 
          q4+=  `JOIN ADANI."USERGROUPS" "USERGROUPS" ON "USERGROUPS"."USERID" = "USERMASTER"."USERID")`; 
          q4+=  `JOIN ADANI."LEVELMASTER" "LEVELMASTER" ON "LEVELMASTER"."LEVELID" = "USERGROUPS"."LEVELID")`;
          q4+=  `JOIN ADANI."DSRSTATUS" "DSRSTATUS" ON "DSRSTATUS"."BUID" = "USERGROUPS"."BUID" AND "DSRSTATUS"."BVID" = "USERGROUPS"."BVID" AND "DSRSTATUS"."SIID" = "USERGROUPS"."SIID")`;
          q4+=  `JOIN ADANI."BUMASTER" "BUMASTER" ON "BUMASTER"."BUID" = "USERGROUPS"."BUID" )`;
          q4+=  `JOIN ADANI."BVMASTER" "BVMASTER" ON "BVMASTER"."BVID" = "USERGROUPS"."BVID" )`;
          q4+=  `JOIN ADANI."SIMASTER" "SIMASTER" ON "SIMASTER"."SIID" = "USERGROUPS"."SIID" )`;
          q4+=  `WHERE "DSRSTATUS"."DSRSTATUS" = 'PENDING' AND "DSRSTATUS"."DSRDATE" = '2021-02-03' AND "LEVELMASTER"."LEVELCODE" IN ('L2','L3','L4','L5') `;
          q4+=  `ORDER BY "BUID","BVID","SIID"`;
      
      conn.query(q4, function (err,data) {
        console.log(data)

        if (err) {
          console.log(err,);
  
        }else{

         // for loop used for all mail id get
          for (i=0; i<data.length; i++){

            console.log(data[i].EMAIL)

            //Email()
          }

            function Email(){
                
                // Change database formate
                
                date = new Date(`${data[i].DSRDATE}`);
                year = date.getFullYear();
                month = date.getMonth()+1;
                dt = date.getDate();
    
                if (dt < 10) {
                dt = '0' + dt;
                }
                if (month < 10) {
                month = '0' + month;
                }
                const datefm = dt+'-'+month+'-'+year;
                console.log(datefm,"")
                    

                //  //e-mail message options
                let mailOptions = {
                from: 'sbit.1378@gmail.com',
                to: 'rohitkumar@sarabhaiit.com',
                subject : `PENDING DSR for ${data[i].BUNAME} - ${data[i].BVNAME} - ${data[i].SINAME} - ${datefm} `,
                html: `<!DOCTYPE html>
                <html>
                <title>Online HTML Editor</title>
                
                <head>
                    <style>
                        body {
                            background-color: #f6f6f6;
                            font-family: sans-serif;
                            -webkit-font-smoothing: antialiased;
                            font-size: 14px;
                            line-height: 1.4;
                            margin: 0;
                            padding: 0;
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
                        }
                
                        table {
                            border-collapse: separate;
                            width: 100%;
                        }
                
                        table td {
                            font-family: sans-serif;
                            font-size: 14px;
                            vertical-align: top;
                        }
                
                
                        .body {
                            background-color: #f6f6f6;
                            width: 100%;
                        }
                
                        .container {
                            display: block;
                            margin: 0 auto !important;
                            /* makes it centered */
                            padding: 40px;
                
                        }
                
                
                        .main {
                            background: #ffffff;
                            border-radius: 5px;
                            width: 720px;
                            height: 500px;
                            margin: auto;
                        }
                
                        table thead tr {
                            height: 40px;
                            background: #ffffff;
                            margin: auto;
                
                
                        }
                
                
                        tbody tr {
                            
                            font-size: 15px;
                            color: #000000;
                            line-height: 1.2;
                            font-weight: unset;
                
                        }
                
                
                        .column1 {
                            width: 82px;
                            text-align: center;
                        }
                
                        .column2 {
                            width: 82px;
                            text-align: center;
                        }
                
                        .column3 {
                            width: 82px;
                            text-align: center;
                
                        }
                
                        .column4 {
                            width: 82px;
                            text-align: center;
                        }
                
                        .column5 {
                            width: 82px;
                            text-align: center;
                        }
                
                        .wrapper {
                            box-sizing: border-box;
                            padding: 20px;
                        }
                    </style>
                </head>
                
                <body>
                
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                        <tr>
                            <td>&nbsp;</td>
                            <td class="container">
                                <div class="content">
                
                                    <!-- START CENTERED WHITE CONTAINER -->
                                    <table role="presentation" class="main">
                
                                        <!-- START MAIN CONTENT AREA -->
                                        <tr>
                                            <td class="wrapper">
                                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td>
                                                            <p>Dear Sir ,</p>
                                                            <p>Daily Situation Report (DSR) for the following site is <b>Pending</b>.
                                                                Kindly ask your team to take action."</p>
                
                                                            <table class="table2">
                                                                <thead>
                                                                    <tr class="table100-head">
                                                                        <th class="column1"><p>Date</p></th>
                                                                        <th class="column2"><p>Vertical</p></th>
                                                                        <th class="column3"><p>Business</p></th>
                                                                        <th class="column4"><p>Site</p></th>
                                                                        <th class="column5"><p>Status</p></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column1">${datefm}</td>
                                                                        <td class="column2">${data[i].BUNAME} </td>
                                                                        <td class="column3">${data[i].BVNAME} </td>
                                                                        <td class="column4">${data[i].SINAME} </td>
                                                                        <td class="column5">${data[i].DSRSTATUS} </td>
                                                                    </tr>
                                                                <tbody>
                                                            </table>
                
                                                            <BR><BR><BR> <BR><BR><BR> <b> Thanks, <BR><BR><BR> ADANI SECURITY </b>
                                                            </font>
                                                            <BR><BR>
                                                            <font face=arial size=3>This is a System generated mail, please do not
                                                                reply.</font>
                
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                
                                        <!-- END MAIN CONTENT AREA -->
                                    </table>
                
                                </div>
                            </td>
                            <td>&nbsp;</td>
                        </tr>
                    </table>
                </body>
                
                </html>`,
                
                };
            
                // e-mail transport configuration
                let transporter = nodemailer.createTransport({
                service: "gmail",
                host:"smtp.adani.com",
                port:25,
                auth: {
                    user: "sbit.1378@gmail.com",
                    pass: "hagnxqtcrqaojwvg"


                //   user:"DailySecurityReport@adani.com",   //Sender Email ID
                //   pass: "Adani$321"                       //Sender Password   
                }
                });
            
                // Send e-mail
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                console.log('Email sent: ' + info.response);
                }
            });
          }
        }
      })
    })
  }


