'use strict'

const request = require('request');
const inspect = require('eyespect').inspector();

module.exports = function postApiCall(locationName, next) {
    var params = {patientVitals:[{
      vitalId:1,
      vitalValue:'123',
      vitalType:'FLT',
      patientId:198161

    }]};

    var url = 'http://192.168.0.159:8080/XtrWS/services/3.31.0.0/patient/198161/vitals'
    var options = {
        method: 'put',
        body: params,
        json: true,
        url: url,
        headers:{
          "User-Agent":'praxifycc',
          'ClientType':'praxifycc',
          'Authorization':'H4sIAAAAAAAAAF2QvUoDQRSFrytK7CQEbGWxsbkrBKsEJIkpAoMG1j8IFpPkmsyyO7PMzMaNWAq-gbWIhUU6n8FWfARfIJWNpHLzowGrew8cvnvuGY1hzWgoK93DoK2MQW6QgnYROyqKlSRp0Vhu6SoJ0V8sPmnBQ3FD3aZW6TD3-jR5PHj7cMBhsGHIGKFk49DCNsuw3gzrZUyvE4qM5_m_jhKD3EDQ9RGPyEKeBXzAvZDLnudbLWSvlMZZtt1ltgyCcwj-QXaWaUb3xcJY7RUcWGmBI7oWnFY1jRM9naOvre_13MmnA5DGALBZfn8O-vu164f87WrzcvJi4W5-pUtxqIbR7PWknUhh0b2wus41EtfuTFSaDQymYlnTqSG9SFUlLvGsUT9HN7WaoiTCPvHQ9jHJCo7Ffy9THR66yI5rFfYDoAvt2pIBAAA',
          'Accept' : 'application/json',
        }
    }
    request(options, function(err, res, body) {
        if (err) {
            inspect(err, 'error posting json')
            return
        }
        var headers = res.headers
        var statusCode = res.statusCode
        inspect(headers, 'headers')
        inspect(statusCode, 'statusCode')
        inspect(body, 'body')

        next(body);
    })
}
