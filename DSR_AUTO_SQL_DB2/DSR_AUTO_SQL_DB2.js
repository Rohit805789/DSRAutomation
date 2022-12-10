require("dotenv").config();
const express = require("express");
const app = express();
const ibmdb = require("ibm_db");
const router = express.Router();
const client = require("mssql");

//const cron = require("node-cron");
//const fs = require("fs");
//const nodemailer = require('nodemailer');





// MS-SQL DB CONNECTION
const dbConfig = {
  server: "DESKTOP-LM23JKQ",
  user: "sa",
  password: "SQLserver@98765",
  database: "Internal_Training",  // 
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

  
    // IBMDB2 DB CONNECTION
const ibmConfig = {
  DATABASE: "ADANI",
  SERVERNAME: "192.168.29.58",
  UID: "db2admin",
  PWD: "p@ssw0rd",
  PORT: "50000",
  PROTOCOL: "TCPIP"
};

// const ibmConfig = {
//   DATABASE: process.env.IBM_DB_SERVER,
//   HOSTNAME: process.env.IBM_DM_HOSTNAME,
//   UID: process.env.IBM_DB_UID,
//   PWD: process.env.IBM_DB_PWD,
//   PORT: process.env.IBM_DB_PORT,
//   PROTOCOL: process.env.IBM_DB_PROTOCOL,
// };



// GLOBAL VARIABLE

let day= 1;
let SEPS_SITECODE="MND";



  ibmdb.open(ibmConfig , function (err, conn){
    if (err) console.log(err,"ibmdb2 configration error ");
    
    q1=`SELECT "BUID","BVID","SIID","SEPSSITE","STATUS" FROM ADANI.ISMS_SEPS_SITE_MAPPING `;
    
    conn.query(q1, function(err,IBMDB2DATA){

			
      for (y=0;y<IBMDB2DATA.length;y++)
      {
       
      let BUID = IBMDB2DATA[y].BUID;
			let BVID = IBMDB2DATA[y].BVID;
			let SIID = IBMDB2DATA[y].SIID;
			let SEPSSITE = IBMDB2DATA[y].SEPSSITE;
			let STATUS = IBMDB2DATA[y].STATUS;
			
			console.log(IBMDB2DATA);
			console.log(SIID);

            if(err) 
            { console.log(err, "ibmbd2 query error ")
            
            }else{
                client.connect(dbConfig, function (err, res){

                    if(err) console.log(err,"MS-sql connection error");


                    let dt = new Date();                                // IBMDB 2 DATE FORMATE
                    dt.setDate( dt.getDate() - day);
                    let IBMDB2DATE = dt.toISOString().slice(0, 10) 
                    console.log(IBMDB2DATE,"IBM DB 2 DATE FORMATE")
                  
                    const MSSQLDATE = dt.toLocaleString("en-GB", {       // MSSQL DATE FORMATE
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    console.log(MSSQLDATE);
    
                    q2=`EXEC LMS_DSR_linkageSPCP @Date='${MSSQLDATE}' ,@Site = '${SEPS_SITECODE}'`;
    
                    client.query(q2, function(err,MSSQLDATA){
						
						          console.log(MSSQLDATA);
                        // let resultArray = Object.values(MSSQLDATA);
                        // console.log(resultArray, "RESULT DATA FROM MS-SQL SEPS APP");

                        
                        // LOG_FILE

                        // let data = `${dt} 
                        //                 : Server is working\n`;
                        // fs.appendFile("logs.txt", data, function(err)
                        // {
                                
                        //     if (err) throw err;
                            
                        // })


                        if(err)
                        {
                            console.log(err,"mssql query error");
                        }else{
                                let q3 = `select count(*) as Count from ADANI.STAGING_SEPS`;
                                    q3+= ` where BUID=${BUID} AND BVID=${BVID} AND SIID=${SIID} AND SEPS_DATE='${IBMDB2DATE}' AND SEPS_SITECODE='${SEPS_SITECODE}' AND SEPSSITE='${SEPSSITE}' AND STATUS = '${STATUS}' `; 
                                                                      
                                    conn.query(q3, function (err,IBMDB2DATA) {
                                        if (err) console.log(err,"Count Error");

                                        var count =IBMDB2DATA[0].COUNT;
                                        console.log(IBMDB2DATA);
										                    console.log(count)

                                        if(count==0)
                                        {
											
                                            for( let x=0; x< MSSQLDATA.recordset.length; x++){
                                                
                                                let SITECODE=SEPS_SITECODE;
                                                let DATE = IBMDB2DATE;
                                                let SSC_CHARGES= MSSQLDATA.recordset[x].SSC_Charges;
                                                let TV_CHARGES=MSSQLDATA.recordset[x].TV_Charges;
                                               

                                                q4=` INSERT INTO ADANI.STAGING_SEPS (BUID,BVID,SIID,SEPS_SITECODE,SEPS_DATE,SSC_CHARGES,TV_CHARGES,SEPSSITE,STATUS)  `;
                                                q4+= `VALUES(${BUID},${BVID},${SIID},'${SITECODE}','${DATE}','${SSC_CHARGES}','${TV_CHARGES}','${SEPSSITE}','${STATUS}')`;

                                                conn.query(q4, function (err, data2) {
                                                    try {
                                                      if (err) {
                                                        console.log(err,"IBMDB2 INSERT QUERY ERROR");
                                                      } else {
                                                        console.log(data2,"inserted query ")
                                                        conn.close(function () {
                                                          
                                                        });
                                                      }
                                                    } catch (error) {
                                                      console.log("error", error);
                                                    }
                                                });
                                                
                                                console.log(" 1 Row is Affected ");
                                            }

                                        }else{
                                            // fs.appendFile("logs.txt","\t\t\t\t\t\t\tNo row added to IBMDB2\n\n ", function(err)
                                            // {
                                            //     if (err) throw err;
                                                  
                                            //     console.log("No Row is Affected ");
                                            // })

                                            console.log(("NO ROW affected"));
                                        }
                                    });
                                //})
                        }
                    })
                })
            }
       }
    });
 });

             