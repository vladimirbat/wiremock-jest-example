const fetch = require("node-fetch");
const {TARGET_URL, REQUESTS} = require('./privateConfig');
const PORT = 9999;

const isWiremockStarted = () => {
  return fetch(`http://localhost:${PORT}/wiremocktest`).then(() => true).catch(() => false)
};

const waitFor = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

const awaitServer = async() => {
  console.log('WAITING FOR WIREMOCK TO START ...');
  for (let i = 0; i < 10; i++) {
    await waitFor(1000);
    const connected = await isWiremockStarted();
    if (connected) {
      return true;
    }
  }
  console.error('WIREMOCK NOT STARTED WITHIN 10 SECS ...');
  return false;
};


function closeServer(){
  console.log('STOPING WIREMOCK ...');
  return fetch(`http://localhost:${PORT}/__admin/shutdown`, {method: 'POST'});
}

const setUpRecording = () => {
    const config =  {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "targetBaseUrl": TARGET_URL,
          "persist" : true
        })
    };
    return fetch(`http://localhost:${PORT}/__admin/recordings/start`, config)
        .then((res) => res.json())
        .then((body) => {
            console.log(body)
        });
};

const startRequests = () => {
  const config =  {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
  };
  return new Promise((resolve) => {
    REQUESTS.forEach(async(page) => {
      return fetch(`http://localhost:${PORT}/${page}`, config)
        .then((res) => res.json())
        .then((body) => {
            console.log(`###################### ${page} #########################`);
            console.log(body)
        });
    });
    resolve();
  })

  
};

const main = async () => {
    await awaitServer();
    await setUpRecording();
    await startRequests();
    await closeServer();
    
};

main();

