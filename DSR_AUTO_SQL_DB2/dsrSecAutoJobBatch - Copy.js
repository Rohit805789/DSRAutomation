var http = require("http");
// var mydate = require('current-date');
// var fs = require('fs');
var express = require('express');
// var bodyParser = require('body-parser')
var app = express();
var path = require('path');
var moment = require('moment');
var https = require('https');
var ibmdb = require('ibm_db');
var qs = require("querystring");
var schedule = require('node-schedule');
var router = express.Router()
//const fastcsv = require("fast-csv");
// const { database } = require("pg/lib/defaults");
//const ws = fs.createWriteStream("newtry.csv");
const { Client } = require('pg')
const { Client } = require('mssql');    // New Add
const { Console } = require("console");


// SBIT  DB
const client = new Client({
    // host: 'localhost',
    // port: 5432,
    // user: 'postgres', // using sql server 
    // password: 'p@ssw0rd',
    // database: 'Analytics',
    // schema: 'sbit'

    server: "DESKTOP-LM23JKQ",          // New Add
    user: "sa",
    password: "SQLserver@98765",
    database: "DSPAPPS",
    options: {
        trustedconnection: true,
        enableArithAbort: true,
        instancename: "",
        trustServerCertificate: true
    },
})

// const client1 = new Client(
//     {
//         host: 'localhost',
//         port: 5433,
//         user: 'postgres',   
//         password: 'p@ssw0rd',
//         database: 'JOBS',
//         schema: 'analytics'
//     }
// )

// cron.schedule("*/1 * * * *", function () {
//     scheduling()
//     console.log("done");
// })

// function scheduling() {
ibmdb.open("DATABASE=ADANI;HOSTNAME=10.2.81.110;UID=db2admin;PWD=p@ssw0rd;PORT=50000;PROTOCOL=TCPIP", function (err, conn) {

    var q1 = 'SELECT '
    q1 += 'OL_DSRSECAUTO.DSRROWID DSRROWID,';
    q1 += 'OL_DSRSECAUTO.BUNAME BUNAME,';
    q1 += 'OL_DSRSECAUTO.BVNAME BVNAME,';
    q1 += 'OL_DSRSECAUTO.SINAME SINAME,';
    q1 += 'OL_DSRSECAUTO.DSRDATE DSRDATE,';
    q1 += 'OL_DSRSECAUTO.DSRPARAMSNAME DSRPARAMSNAME,';
    q1 += 'OL_DSRSECAUTO.AVAILABLE AVAILABLE,';
    q1 += 'OL_DSRSECAUTO.WORKING WORKING,';
    q1 += 'OL_DSRSECAUTO.NOTWORKING NOTWORKING,';
    q1 += 'OL_DSRSECAUTO."MONTH" "MONTH",';
    q1 += 'OL_DSRSECAUTO."QUARTER" "QUARTER",';
    q1 += 'OL_DSRSECAUTO."YEAR" "YEAR",';
    q1 += 'OL_DSRSECAUTO.DSRSTATUSID DSRSTATUSID,';
    q1 += 'CLUSTERMASTER.CLUSTERNAME CLUSTERNAME ';
    q1 += 'FROM ADANI.OL_DSRSECAUTO OL_DSRSECAUTO ';
    q1 += 'JOIN ADANI.SIMASTER SIMASTER ON OL_DSRSECAUTO.SINAME = SIMASTER.SINAME ';
    q1 += 'JOIN ADANI.CLUSTERSITE CLUSTERSITE ON CLUSTERSITE.SIID = SIMASTER.SIID ';
    q1 += 'JOIN ADANI.CLUSTERMASTER CLUSTERMASTER ON CLUSTERMASTER.CLUSTERID = CLUSTERSITE.CLUSTERID ';
    q1 += 'WHERE SIMASTER.SISTATUS = \'ACTIVE\';'// extract

    conn.query(q1, function (err, data) {
        console.log(data[0])

        // client1.connect() // jobs 

        // var q3 = `INSERT INTO analytics."JOBS_DETAILS" ("JOBDETAILID" , "JOBID" , "JOBSTAT" , "STARTDATEANDTIME" , "ENDDATEANDTIME" , "ROWSTRFD" , "DATATRFDDATE") VALUES ((SELECT COALESCE(MAX("JOBDETAILID"), null, 0) FROM analytics."JOBS_DETAILS") + 1, 1,'PASS', 'NOW()' , 'NOW()' ,${data.length}, '03-27-2022')`

        // client1.query(q3, (err, res) => {
        //     if (!err) {
        //     }

        // })
        // client1.end;

        if (err) {
            console.log("FIRST ERROR : " + err);
        }
        else {
            i = 0
            client.connect()
            var qT = 'TRUNCATE TABLE sbit."OL_DSRSECAUTO"'  // query store procedure

            client.query(qT, (err, res) => {
                if (!err) {
                    Console.log("======== While Loop =========="); // new add
                }
            })
            while (i < data.length) {
                var dsrrowid = data[i].DSRROWID
                var buname = data[i].BUNAME
                var bvname = data[i].BVNAME
                var siname = data[i].SINAME
                var dsrdate = data[i].DSRDATE
                var dsrparamsname = data[i].DSRPARAMSNAME
                var available = data[i].AVAILABLE
                var working = data[i].WORKING
                var notworking = data[i].NOTWORKING
                var month = data[i].MONTH
                var quarter = data[i].QUARTER

                if (quarter == 'Q4') {
                    var year = parseInt(data[i].YEAR) - 1
                }
                else {
                    var year = data[i].YEAR
                }
                var dsrstatus = data[i].DSRSTATUSID
                var cluster = data[i].CLUSTERNAME
                var dsrParamsNameDisplay;

                if (dsrparamsname == 'VIDEO SCREEN') {
                    dsrParamsNameDisplay = 'VIDEO SCREEN'
                }
                else if (dsrparamsname == 'BOOM BARRIER') {
                    dsrParamsNameDisplay = 'BOOM BARRIER'
                }
                else if (dsrparamsname == 'ACCESS CONTROL DEVICE') {
                    dsrParamsNameDisplay = 'ACC_CON_DEV'
                }
                else if (dsrparamsname == 'TURNSTILE') {
                    dsrParamsNameDisplay = 'TURNSTILE'
                }
                else if (dsrparamsname == 'CAMERA') {
                    dsrParamsNameDisplay = 'CAMERA'
                }

                // tranformation

                var q2 = `INSERT INTO sbit."OL_DSRSECAUTO" ( "DSRROWID" , "BUNAME" , "BVNAME" , "SINAME" , "DSRDATE" , "DSRPARAMSNAME", "AVAILABLE", "WORKING", "NOTWORKING" , "MONTH", "QUARTER", "YEAR", "DSRSTATUSID", "CLUSTERNAME","DSRPARAMSNAME_DISPLAY") VALUES (${dsrrowid},'${buname}','${bvname}','${siname}','${dsrdate}','${dsrparamsname}',${available},${working},${notworking},'${month}','${quarter}','${year}',${dsrstatus},'${cluster}','${dsrParamsNameDisplay}')` //load
                console.log(q2)
                client.query(q2, (err, res) => {
                    if (!err) {
                    }

                })

                i++
            }
            client.end;
        }
    });

});
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
