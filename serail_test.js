const SerialPort = require('serialport')
const port = new SerialPort('COM8', {
    baudRate: 38400,
    autoOpen: false
})
function payload_decode(serial_data){
    var obj = {}
    obj['device_id'] = serial_data.substring(4,6);
    obj['command'] = serial_data.substring(6,8);
    data0 = serial_data.substring(8,10);
    data1 = serial_data.substring(10,12);
    data2 = serial_data.substring(12,14);
    data3 = serial_data.substring(14,16);
    if(data0 != '00'){
        data0 = parseInt(data0,16);
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
var serial_buffer = '';
port.open(function (error) {
    if ( error ) {
        console.log('failed to open: ' + error);
    } else {
        console.log('serial port opened');
        port.on('data', function(data) {

            if(data.length >= 14) {
                serial_data = data.slice(0,10);
                serial_data = serial_data.toString('hex');
                console.log(serial_data);

            }
            serial_buffer = '';
        });
        port.on('error', function(data) {
            console.log('Error: ' + data);
        })
    }
});
