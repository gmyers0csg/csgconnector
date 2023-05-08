const axios = require('axios');
const net = require('net');

const fi_endPoint = 'https://echotech.flightinsight.io/api/devices';
0
const av_endPoint = 'https://csgconnectorav.free.beeceptor.com';
//const av_endPoint = 'http://localhost:5000/update';
const api_secret = 'e7affe51ac1e4173b69cc815812ed6df';
const datetime_type = 'recorded_at';
//let start_datetime = new Date();
//let end_datetime = new Date(start_datetime.getTime() + 3000);
//let start_datetime = new Date().toISOString();
//let end_datetime = new Date(Date.now() + 3000).toISOString();
let start_datetime = new Date(Date.now() - 6000).toISOString();
let end_datetime = new Date(Date.now() - 5000).toISOString();
let loop_duration = null; // Set to null for infinite loop
let loop_counter = 0;

function updateDateTime() {
    start_datetime = end_datetime;
    const end_datetime_dateObj = new Date(end_datetime);
    end_datetime = new Date(end_datetime_dateObj.getTime() + 1000).toISOString();
  }

function getRequestURL() {
    const start_datetime_dateObj = new Date(start_datetime);
    const start_datetime_str = start_datetime_dateObj.toISOString();
    const end_datetime_dateObj = new Date(end_datetime);
    const end_datetime_str = end_datetime_dateObj.toISOString();
    
    return `${fi_endPoint}?api_secret=${api_secret}&start_datetime=${start_datetime_str}&end_datetime=${end_datetime_str}&datetime_type=${datetime_type}`;
  }
  

  function processFIInputJSON(fiInputJSON) {
    let avOutputJSON = {
      geometry: {},
      properties: {}
    };
  
    if (!fiInputJSON.data || !fiInputJSON.data.data) {
      return avOutputJSON;
    }
  
    let latestTimestamp = null;
  
    for (const data of fiInputJSON.data.data) {
      if (!data.sensor) {
        continue;
      }
  
      const sensor = data.sensor;
      if (sensor.name === 'Location') {
        avOutputJSON.geometry.coordinates = data.geolocation.coordinates;
        avOutputJSON.geometry.type = data.geolocation.type;
      } else if (sensor.name === 'Baro Altitude') {
        avOutputJSON.properties.altitude = data.value;
      }
  
      // Update the latest timestamp
      if (data.recorded_at && (!latestTimestamp || data.recorded_at > latestTimestamp)) {
        latestTimestamp = data.recorded_at;
      }
    }
  
    avOutputJSON.properties.sourceId = fiInputJSON.data.serial_number;
    avOutputJSON.properties.name = fiInputJSON.data.serial_number;
    avOutputJSON.properties.timestamp = latestTimestamp;
  
    return avOutputJSON;
  }
  
  

async function postDataToAV(avOutputJSON) {
  try {
    const response = await axios.post(av_endPoint, avOutputJSON);
    if (loop_counter < 4) {
      console.log(`Iteration ${loop_counter + 1} POST request sent to AV:`, avOutputJSON);
    }
  } catch (error) {
    console.error('Error posting data to AV:', error);
  }
}

async function fetchActiveDeviceData() {
  try {
    const response = await axios.post(getRequestURL());
    const fiInputJSON = response.data;

    if (fiInputJSON && fiInputJSON.data) {
      const avOutputJSON = processFIInputJSON(fiInputJSON);
      
      // Check if the timestamp property is not null before posting the data to AV
      if (avOutputJSON.properties.timestamp !== null) {
        await postDataToAV(avOutputJSON);
      }
    }
  } catch (error) {
    console.error('Error fetching active device data:', error);
  }
}


async function main() {
  while (loop_duration === null || loop_counter < loop_duration) {
    await fetchActiveDeviceData();
    updateDateTime();
    loop_counter++;
    //console.log("start", start_datetime);
    //console.log("end", end_datetime);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
//console.log(start_datetime);
main();
