const fetch = require("node-fetch");
jest.setTimeout(3 * 60 * 1000);
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
      return;
    }
  }
  console.error('WIREMOCK NOT STARTED WITHIN 10 SECS ...');
};


function closeServer(){
  console.log('STOPING WIREMOCK ...');
  return fetch(`http://localhost:${PORT}/__admin/shutdown`, {method: 'POST'});
}

beforeAll(awaitServer);
afterAll(closeServer);

describe("Api tests", () => {
  it("test get", () => {
    return fetch(`http://localhost:${PORT}/api/tariffs`)
      .then((res) => res.json())
      .then((body) => {
        expect(body.length).toBe(3);
      });
  });
  it("test post", () => {
    const tariff = {id:111, name:'barato'}
    return fetch(`http://localhost:${PORT}/api/tariffs/create`, {
      method: 'POST',
      body: JSON.stringify(tariff),
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    })})
      .then((res) => res.json())
      .then((body) => {
        expect(!!body).toBeTruthy();
      });
  });
});
