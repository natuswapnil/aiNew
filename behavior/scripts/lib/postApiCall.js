'use strict'

const request = require('request');
const inspect = require('eyespect').inspector();

module.exports = function postApiCall(data,config, next) {
    var params ;
    data = data || {};
    params = {patientVitals:[{
      vitalId:data.vitalId,
      vitalValue:data.vitalValue,
      vitalType:'FLT',
      patientId:data.patientId

    }]};

    var url = config.baseUrl + 'patient/'+data.patientId+'/vitals';
    var options = {
        method: 'put',
        body: params,
        json: true,
        url: url,
        headers:{
          "User-Agent":config.clientType,
          'ClientType':config.clientType,
          'Authorization':config.token,
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
        if(typeof next === 'function')
          next(body);
    })
}
