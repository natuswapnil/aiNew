// 'use strict'

// const request = require('request');

// module.exports = function getApiCall(locationName, next) {
//   const appId = 'triel'

//   const requestUrl = `https://www.nutritionix.com/track-api/v2/search/instant?branded=true&common=true&query=ss&self=false`

//   console.log('Making HTTP GET request to:', requestUrl)

//   request(requestUrl, (err, res, body) => {
//     if (err) {
//       throw new Error(err)
//     }

//     if (body) {
//       const parsedResult = JSON.parse(body)
//       next(parsedResult)
//     } else {
//       next()
//     }
//   })
// }




'use strict'

const request = require('request');
const inspect = require('eyespect').inspector();

module.exports = function getApiCall(data,config, next) {
   

    var url = config.baseUrl + 'patient/'+data.patientId+'/patient_vital';
    var options = {
        method: 'get',
        body: data,
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
        var reply={},statusCode = res.statusCode
        inspect(headers, 'headers')
        inspect(statusCode, 'statusCode')
        inspect(body, 'body')
        if(body && body.reply){
          reply = JSON.parse(body.reply);
        }
        next(reply.dataMap['09 Jan, 2017']);
    })
}


