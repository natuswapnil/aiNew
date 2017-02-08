'use strict'

const request = require('request')

module.exports = function getApiCall(locationName, next) {
  const appId = 'triel'

  const requestUrl = `http://api.openweathermap.org/data/2.5/weather?units=imperial&appid=${appId}&q=${locationName}`

  console.log('Making HTTP GET request to:', requestUrl)

  request(requestUrl, (err, res, body) => {
      next('rahul');
  })

}