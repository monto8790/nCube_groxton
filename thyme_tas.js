/**
 * Created by Il Yeup, Ahn in KETI on 2017-02-25.
 */

/**
 * Copyright (c) 2018, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// for TAS
var SerialPort = require('serialport');

var payload = '';
var s_Dev_Port = null;
var s_Dev_PortNum = undefined;
exports.ready = function tas_ready () {
        // s_Dev_PortNum = '/dev/ttyAMA0';

        s_Dev_PortNum = serial_list();
        // s_Dev_PortNum = '/dev/ttyUSB4';
        s_Dev_Baudrate = '38400';
        s_Dev_PortOpening();
        upload_payload();
        status_upload();
};

function serial_list(){
    SerialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.locationId);
            if(port.locationId != 'undefined') {
                var serialnum = port.comName
                console.log('##########'+serialnum);
                // s_Dev_PortNum = serialnum;
                return serialnum
            }
            else{
                // s_Dev_PortNum = 'dev/ttyUSB4';
                return '/dev/ttyUSB4';
            }

            // if(port.locationID)
            // console.log(port.comName);
            // console.log(port.pnpId);
            // console.log(port.manufacturer);
        });
    });
}

function payload_decode(serial_data){
    var obj = {}
    obj['device_id'] = serial_data.substring(4,6);
    var command= serial_data.substring(6,8);
    var data0 = serial_data.substring(8,10);
    var data1 = serial_data.substring(10,12);
    var data2 = serial_data.substring(12,14);
    var data3 = serial_data.substring(14,16);
    if (command == '3e'){
        obj['command'] = 'read_mode';
    }
    if(data0 != '00'){
        data0 = parseInt(data0,16)+'km/h';
        obj['data0'] = data0;
    }
    if(data1 != '00'){
        data1 = parseInt(data1,16);
        obj['data1'] = data1;
    }
    if(data2 != '00'){
        data2 = parseInt(data2,16);
        obj['data2'] = data2;
    }
    if(data3 != '00'){
        data3 = parseInt(data3,16);
        obj['data3'] = data3;
    }

    return obj
}

function s_Dev_PortOpening() {
    if(s_Dev_PortNum != undefined){
        if (s_Dev_Port == null) {

            s_Dev_Port = new SerialPort(s_Dev_PortNum, {
                baudRate: parseInt(s_Dev_Baudrate, 10),
            });

            s_Dev_Port.on('open', s_Dev_PortOpen);
            s_Dev_Port.on('close', s_Dev_PortClose);
            s_Dev_Port.on('error', s_Dev_PortError);
            s_Dev_Port.on('data', s_Dev_PortData);
        }
        else {
            if (s_Dev_Port.isOpen) {

            }
            else {
                s_Dev_Port.open();
            }
        }
    }
    else{
        console.log("123123");
        // setTimeout(serial_list(), 2000);

    }
}
function s_Dev_PortOpen() {
    console.log('s_Dev_Port open. ' + s_Dev_PortNum + ' Data rate: ' + s_Dev_Baudrate);
}

function s_Dev_PortClose() {
    console.log('s_Dev_Port closed.');

    // setTimeout(s_Dev_PortOpening(), 2000);
}

function s_Dev_PortError(error) {
    var error_str = error.toString();
    console.log('[s_Dev_Port error]: ' + error.message);
    if (error_str.substring(0, 14) == "Error: Opening") {

    }
    else {
        console.log('s_Dev_Port error : ' + error);
    }

    setTimeout(s_Dev_PortOpening, 2000);
}
function upload_payload(){
    setInterval(function () {
        if(payload !=''){
            var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/' +conf.grox_location.name+'/'+ conf.cnt[1].name;
            sh_adn.crtci(parent, 0, JSON.stringify(payload), this, function (status, res_body, to) {
                console.log('x-m2m-rsc : ' + status + ' <----');
                payload = '';
            });
        }
        else{
//            console.log("emtpy")
        }
    },1000);
}
function status_upload(){
    setInterval(function () {
            var status = 'running'
            var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/' +conf.grox_location.name+'/'+ conf.cnt[3].name;
            sh_adn.crtci(parent, 0, status, this, function (status, res_body, to) {
                console.log('x-m2m-rsc : ' + status + ' <----');
                payload = '';
            });
    },1800000);
}
function s_Dev_PortData(data){
    if(data.length >= 14) {
        serial_data = data.slice(0,10);
        serial_data = serial_data.toString('hex');
  //      console.log(serial_data);
        payload = payload_decode(serial_data);

        // obj = payload_decode(serial_data);
        // console.log(obj);
        // var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/' +conf.grox_location.name+'/'+ conf.cnt[0].name;
        // sh_adn.crtci(parent, 0, JSON.stringify(obj), this, function (status, res_body, to) {
        //     console.log('x-m2m-rsc : ' + status + ' <----');
        // });
    }
    serial_buffer = '';
}



var car_array = [];
var human_array = [];
//var message ='';
var hexsum = 0x00;
exports.noti = function(path_arr, cinObj) {
    var cin = {};
    cin.ctname = path_arr[path_arr.length-2];
    cin.con = (cinObj.con != null) ? cinObj.con : cinObj.content;
    console.log(cin.con);
    var configure = (cin.con).split(',');
    console.log(configure);
    if(cin.con == '') {
        console.log('---- is not cin message');
    }
    else {
        //console.log(JSON.stringify(cin));
        console.log(cin.con);
        if(configure[1] == 'car'){
            car_array[0] = '0x02';
            car_array[1] = '0x30';
            car_array[2] = '0x'+configure[0];
            car_array[3] = '0x3e';
            car_array[4] = '0x00';
            car_array[5] = '0x00';
            car_array[6] = '0x00';
            car_array[7] = '0x00';
            car_array[8] = '0x70';
            car_array[9] = '0x03';
            message = new Buffer.from(car_array,'hex');
            for(i = 0; i < car_array.length-2;i++){
                hexsum = hexsum + message[i];
            }
            message[8] = hexsum;
            console.log(message);

            s_Dev_Port.write(message);
        }//02 01 10 3e 0a 00 00 00 5b 03
        else if(configure[1] == 'human'){
            human_array[0] = '0x02';
            human_array[1] = '0x40';
            human_array[2] = '0x'+configure[0];
            human_array[3] = '0x3e';
            human_array[4] = '0x00';
            human_array[5] = '0x00';
            human_array[6] = '0x00';
            human_array[7] = '0x00';
            human_array[8] = '0x70';
            human_array[9] = '0x03';        
            message = new Buffer.from(human_array,'hex');
            for(i = 0; i < human_array.length-2;i++){
                hexsum = hexsum + message[i];
            }
            message[8] = hexsum;
            console.log(message);
            s_Dev_Port.write(message);
        }
//        console.log(car_array);
//        console.log(human_array);
//        console.log(message);
//        s_Dev_Port.write(message);
//        console.log('<---- send to tas');
//        console.log(

    }
};

exports.qt_noti = function(aei, cinObj) {
    var cin = {};
    cin.con = (cinObj.con != null) ? cinObj.con : cinObj.content;
    console.log(cinObj);
    if(cin.con == '') {
        console.log('---- is not cin message');
    }
    else {
        if (socket_arr[aei] != null) {
            console.log('<---- send to tas');
            console.log(aei + '/' + cin.con);
            socket_arr[aei].write(aei + '/' + cin.con + '<EOF>');
        }
    }
};
