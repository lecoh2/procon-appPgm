/*const host = window.location.hostname;

const urlBase =
  host === '10.0.0.33'
    ? 'http://10.0.0.33:300'
    : host === '134.65.21.253'
      ? 'http://134.65.21.253:300'
      : 'http://localhost:5096';

export const environment = {
  apiProcon: urlBase,
  secretKey: '36f7509e-62ea-4b85-8ad7-44e92913441b'
};*/

//const urlBase = "http://localhost:5096";
const urlBase = "http://134.65.21.253:300";
export const environment = {
  apiProcon: `${urlBase}`,
  secretKey: '36f7509e-62ea-4b85-8ad7-44e92913441b'
};
