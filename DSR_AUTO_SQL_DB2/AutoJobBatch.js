require("dotenv").config();
const express = require("express");
const app = express();
const ibmdb = require("ibm_db");
const router = express.Router();
const client = require("mssql");

const cron = require("node-cron");
const fs = require("fs");
const nodemailer = require('nodemailer');
const { Console, count } = require("console");

// MS-SQL DB CONNECTION
const dbconfig = {
  // hostname:process.env.DB_HOST,C:\Users\Dell\Desktop\jsbatch.bat
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // port: process.env.DB_PORT,
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

  // IBMDB2 DB CONNECTION
const ibmConfig = {
  DATABASE: process.env.IBM_DB_SERVER,
  HOSTNAME: process.env.IBM_DM_HOSTNAME,
  UID: process.env.IBM_DB_UID,
  PWD: process.env.IBM_DB_PWD,
  PORT: process.env.IBM_DB_PORT,
  PROTOCOL: process.env.IBM_DB_PROTOCOL,
};

// cron.schedule("0 18 * * * ", function() {
 
//   console.log("=====================Cron is Running======================= ");
// });

const schedule = require('node-schedule');

schedule.scheduleJob('*/1 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
  AUTO_DSR()
});

let day= 2;
let Site="MND";

// Data Store
let BUIDE="";
let BVIDE="";
let SIIDE="";
let DATEE="";
let SITEE="";

//
// let IBMDB2DF="2019-06-04";
let STATUS="PENDING";




 function AUTO_DSR(){
  

  client.connect(dbconfig, function (err) {
    if (err) {
      console.log("Error", err);
    } else {

    
      let dt = new Date();                                // IBMDB 2 DATE FORMATE
      dt.setDate( dt.getDate() - day);
      let IBMDB2DATE = dt.toISOString().slice(0, 10) 
      console.log(IBMDB2DATE,"IBM DB 2 DATE FORMATE")
    
      const MSSQLDATE = dt.toLocaleString("en-GB", {       // MSSQL DATE FORMATE
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      console.log(MSSQLDATE," MSSQL DATE FORMATE"); 
    
    
     
      var q1 = `EXEC LMS_DSR_linkageSPCP @Date='${MSSQLDATE}' ,@Site = '${Site}'`;
      client.query(q1, function (err, MSSQLDATA) {
          
          try{
            let resultArray = Object.values(MSSQLDATA);
            console.log(resultArray, "this is a new code");
            
            let data = `${dt} 
                            : Server is working\n`;
            fs.appendFile("logs.txt", data, function(err)
              {
                    
                  if (err) throw err;
                  
              })

          }catch(error){
            console.log("error", error);
          }
          
        if (err) {
          console.log("Query error", err);

        }else {    

          ibmdb.open(ibmConfig, function (err, conn) {
            if (err) console.log("ibm connect error", err);
            
            for (var z = 0; z < MSSQLDATA.recordset.length; z++) {
            var q2 = `select count(*) as Count from "ADANI"."STAGING_SEPS" where BUID =${MSSQLDATA.recordset[z].BUID} AND BVID=${MSSQLDATA.recordset[z].BVID} AND SIID=${MSSQLDATA.recordset[z].SIID} AND DATE='${MSSQLDATE}' AND SITE='${Site}'`;
            }

            conn.query(q2, function (err,IBMDB2DATA) {
              if (err) console.log(err,"Count Error");
              
              var count =IBMDB2DATA[0].COUNT;
              console.log(count);

                if( count== 0)
                {
                  for (var z = 0; z < MSSQLDATA.recordset.length; z++) {
                    let DATE = MSSQLDATE;
                    let SITE = Site;
                    let BUID = MSSQLDATA.recordset[z].BUID;
                    let BVID = MSSQLDATA.recordset[z].BVID;
                    let SIID = MSSQLDATA.recordset[z].SIID;
                    let INT_TRAING_TOPIC = MSSQLDATA.recordset[z].Topic;
                    let INT_TRAING_FACULTYNAME = MSSQLDATA.recordset[z].Faculty_Name;
                    let INT_TRAING_ATTENDEESCOUNT =MSSQLDATA.recordset[z].Attendnees_Count;
                    let SEC_VIOL_SSCCHRGS = MSSQLDATA.recordset[z].SSC_Charges;
                    let SEC_VIOL_TVCHRGS = MSSQLDATA.recordset[z].TV_Charges;
                    
                    var q2 = `INSERT INTO ADANI.STAGING_SEPS (BUID, BVID, SIID, DATE, SITE ,INT_TRAING_TOPIC,INT_TRAING_FACULTYNAME,INT_TRAING_ATTENDEESCOUNT ,SEC_VIOL_SSCCHRGS,SEC_VIOL_TVCHRGS ) 
                      VALUES( ${BUID},${BVID},${SIID},'${DATE}','${SITE}', '${INT_TRAING_TOPIC}', '${INT_TRAING_FACULTYNAME}', '${INT_TRAING_ATTENDEESCOUNT}','${SEC_VIOL_SSCCHRGS}','${SEC_VIOL_TVCHRGS}')`;
            
                        conn.query(q2, function (err, data2) {
                          try {
                            if (err) {
                              console.log("IBMDB2 INSERT QUERY ERROR", err);
                            } else {
                              
                              conn.close(function () {
                                
                              });
                            }
                          } catch (error) {
                            console.log("error", error);
                          }
                        });
                      console.log(q2);
                      console.log(" 1 Row is Affected ");
                  }
                }else{
                  
                  fs.appendFile("logs.txt","\t\t\t\t\t\t\tNo row added to IBMDB2\n\n ", function(err)
                  {
                      if (err) throw err;
                        
                      console.log("No Row is Affected ");
                  })
                }
            });


            //ISMS EMAIL'S DATA
            let q3 =`Select "BUID", "BVID" ,"SIID" ,"DATE" ,"SITE" from "ADANI"."STAGING_SEPS"`;
                    
            conn.query(q3, function (err,data ) {

            console.log(data.length,"query data")
           
            for( var i=0;i<data.length;i++){

              BUIDE += data[i].BUID + "<br>"
              BVIDE += data[i].BVID + "<br>"
              SIIDE += data[i].SIID + "<br>"
              DATEE += data[i].DATE + "<br>"
              SITEE += data[i].SITE + "<br>"
            
            }
            
            // console.log(BUIDE);
            // console.log(BVIDE);
            // console.log(SIIDE);
            // console.log(DATEE);
            // console.log(SITEE); 
            
            //Email()
            //globalnull()
           // Pending_Data()
            });
          });
        }
      });
    }
  });
}


// function Email(){
// //  //e-mail message options
//     let mailOptions = {
//     from: 'sbit.1378@gmail.com',
//     to: 'rohitkumar@sarabhaiit.com',
//     subject: 'Email from Node-App: A Test Message!',
//     text: "Some content to send" ,
//     html:`<!DOCTYPE html>
//     <html>
//     <title> EMAIL </title>
    
//     <head>
//     </head>
//     <style>
//         * {
//             margin: 0px;
//             padding: 0px;
//             box-sizing: border-box;
//         }
    
    
//         .container-table100 {
//             width: 100%;
//             min-height: 100vh;
    
//             /* background: linear-gradient(45deg, #4158d0, #c850c0); */
//             display: flex;
//             justify-content: center;
//             flex-wrap: wrap;
//             padding: 33px 30px;
//         }
    
//         .wrap-table100 {
//             width: 1170px;
//         }
    
//         table {
//             border-spacing: 1;
//             border-collapse: collapse;
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             width: 100%;
//             margin: 0 auto;
//             position: relative;
//         }
    
//         table * {
//             position: relative;
//         }
    
//         table td,
//         table th {
//             padding-left: 15px;
    
//             border:1px solid #dddddd;
    
    
//             /*//8px*/
//         }
    
//         table thead tr {
//             height: 35px;
//             background: #36304a;
//         }
    
//         table tbody tr {
//             height: 40px;
//         }
    
//         table tbody tr:last-child {
//             border: 0;
//         }
    
    
//         /* table td,
//                         table th {
//                             text-align: center;;
//                         }
                    
//                           */
    
//         .table100-head th {
//             font-family: OpenSans-Regular;
//             font-size: 20px;
//             color: #fff;
//             line-height: 1.2;
//             font-weight: unset;
//         }
    
//         tbody tr:nth-child(even) {
//             background-color: #f5f5f5;
//         }
    
//         tbody tr {
//             font-family: OpenSans-Regular;
//             font-size: 18px;
//             color: #000000;
//             line-height: 1.2;
//             font-weight: unset;
//         }
    
//         tbody tr:hover {
//             color: #000000;
//             background-color: #f5f5f5;
//             cursor: pointer;
//         }
    
    
//         .column1 {
//             width: 78px;
//             text-align: center;
//         }
    
//         .column2 {
//             width: 78px;
//             text-align: center;
//         }
    
//         .column3 {
//             width: 78px;
//             text-align: center;
    
//         }
    
//         .column4 {
//             width: 98px;
//             text-align: center;
//         }
    
//         .column5 {
//             width: 78px;
//             text-align: center;
//         }
//     </style>
    
//     <body>
//         <div class="limiter">
//             <div class="container-table100">
//                 <div class="wrap-table100">
//                     <div class="table100">
//                         <table>
//                             <thead>
//                                 <tr class="table100-head">
//                                     <th class="column1">BUID</th>
//                                     <th class="column2">BVID</th>
//                                     <th class="column3">SIID</th>
//                                     <th class="column4">DATE</th>
//                                     <th class="column5">SITE</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td class="column1">${BUIDE}</td>
//                                     <td class="column2">${BVIDE}</td>
//                                     <td class="column3">${SIIDE}</td>
//                                     <td class="column4">${DATEE}</td>
//                                     <td class="column5">${SITEE}</td>
//                                 </tr>
//                             <tbody>
//                         </table>
    
//     </body>
    
//     </html>`,
//   };

//   // e-mail transport configuration
//    let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "sbit.1378@gmail.com",
//       pass: "hagnxqtcrqaojwvg"
//     }
//   });

//   // Send e-mail
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });

// }

// function globalnull(){
//   BVIDE="";
//   SIIDE="";
//   BUIDE="";
//   DATEE="";
//   SITEE="";
// }



const Pending_Data=()=>{

  ibmdb.open(ibmConfig, function (err, conn) {
    if (err) console.log(err);

    let q4=   `SELECT "USERMASTER"."USERID" AS "USERID","USERMASTER"."FIRSTNAME" AS "FIRSTNAME","USERMASTER"."LASTNAME" AS "LASTNAME",`;
        q4+=  `"USERGROUPS"."LEVELID" AS "LEVELID","DSRSTATUS"."BUID" AS"BUID","DSRSTATUS"."BVID" AS "BVID","DSRSTATUS"."SIID" AS "SIID",`;
        q4+=  `"BUMASTER"."BUNAME" AS "BUNAME","BVMASTER"."BVNAME" AS "BVNAME","SIMASTER"."SINAME" AS "SINAME","USERMASTER"."EMAIL" "EMAIL"`; 
        q4+=  ` FROM ((((((ADANI."USERMASTER" "USERMASTER"`; 
        q4+=  `JOIN ADANI."USERGROUPS" "USERGROUPS" ON "USERGROUPS"."USERID" = "USERMASTER"."USERID")`; 
        q4+=  `JOIN ADANI."LEVELMASTER" "LEVELMASTER" ON "LEVELMASTER"."LEVELID" = "USERGROUPS"."LEVELID")`;
        q4+=  `JOIN ADANI."DSRSTATUS" "DSRSTATUS" ON "DSRSTATUS"."BUID" = "USERGROUPS"."BUID" AND "DSRSTATUS"."BVID" = "USERGROUPS"."BVID" AND "DSRSTATUS"."SIID" = "USERGROUPS"."SIID")`;
        q4+=  `JOIN ADANI."BUMASTER" "BUMASTER" ON "BUMASTER"."BUID" = "USERGROUPS"."BUID" )`;
        q4+=  `JOIN ADANI."BVMASTER" "BVMASTER" ON "BVMASTER"."BVID" = "USERGROUPS"."BVID" )`;
        q4+=  `JOIN ADANI."SIMASTER" "SIMASTER" ON "SIMASTER"."SIID" = "USERGROUPS"."SIID" )`;
        q4+=  `WHERE "DSRSTATUS"."DSRSTATUS" = '${STATUS}' AND "DSRSTATUS"."DSRDATE" = '2020-06-03' AND "LEVELMASTER"."LEVELCODE" IN ('L2','L3','L4','L5') `;
        q4+=  `ORDER BY "BUID","BVID","SIID"`;
    
    conn.query(q4, function (err,data) {
      
      console.log(data.length)
      console.log(data);

      if (err) {
        console.log(err,);

      }else{

        for (i=0; i<data.length; i++){
          // console.log("FOR LOOP")
          // console.log(data[i].LEVELID)
          switch(data[i].LEVELID)
          {
            case 2:{ console.log(" ============= Email send L2 ================ " )
            Email(); 
            break;}
            case 3:{ console.log(" ============= Email send L3 ================ " )
            Email();
            break;}
            case 4:{ console.log(" ============= Email send L4 ================ " )
            Email();
            break;}
            case 5:{ console.log(" ============= Email send L5 ================ " ) 
            Email();
            break;}
          }
  
          function Email(){

                //  //e-mail message options
                let mailOptions = {
                  from: 'sbit.1378@gmail.com',
                  to: 'rohitkumar@sarabhaiit.com',
                  subject: 'Regarding for Pennding Status',
                  text: "dbj"
                };
            
                // e-mail transport configuration
                let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "sbit.1378@gmail.com",
                    pass: "hagnxqtcrqaojwvg"
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
      }
    })
  })
}


// async function AnyFunction() { 
//   try { 
//     await anotherFunction() 
//   } catch (err) { 
//     console.error(err.message) 
//   } 
// }

// postgresql connection with config function

// const { Client } = require('pg')
// const client = new Client({
//   user: 'sgpostgres',
//   host: 'SG-PostgreNoSSL-14-pgsql-master.devservers.scalegrid.io',
//   database: 'postgres',
//   password: 'password',
//   port: 5432,
// })
// client.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

//PS C:\SBIT_FINAL_PROJECTS\SSC_THERMAL\folder @> node .\sitewise.js >"C:\Users\ven.sup\Desktop\DATA for Analytics\text3.txt"