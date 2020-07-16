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

var s_Dev_Port = null;
exports.ready = function tas_ready () {
        // s_Dev_PortNum = '/dev/ttyAMA0';
        s_Dev_PortNum = 'COM8';
        s_Dev_Baudrate = '38400';
        s_Dev_PortOpening();
};
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
function s_Dev_PortOpen() {
    console.log('s_Dev_Port open. ' + s_Dev_PortNum + ' Data rate: ' + s_Dev_Baudrate);
}

function s_Dev_PortClose() {
    console.log('s_Dev_Port closed.');

    setTimeout(s_Dev_PortOpening, 2000);
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

function s_Dev_PortData(data){
    if(data.length >= 14) {
        serial_data = data.slice(0,10);
        serial_data = serial_data.toString('hex');
        obj = payload_decode(serial_data);
        console.log(obj);
        var parent = '/' + conf.cse.name + '/' + conf.ae.name + '/' + conf.cnt[0].name;
        sh_adn.crtci(parent, 0, JSON.stringify(obj), this, function (status, res_body, to) {
            console.log('x-m2m-rsc : ' + status + ' <----');
        });
    }
    serial_buffer = '';
}


exports.noti = function(path_arr, cinObj) {
    var cin = {};
    cin.ctname = path_arr[path_arr.length-2];
    cin.con = (cinObj.con != null) ? cinObj.con : cinObj.content;

    if(cin.con == '') {
        console.log('---- is not cin message');
    }
    else {
        //console.log(JSON.stringify(cin));
        console.log('<---- send to tas');

        if (socket_arr[path_arr[path_arr.length-2]] != null) {
            socket_arr[path_arr[path_arr.length-2]].write(JSON.stringify(cin) + '<EOF>');
        }
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
