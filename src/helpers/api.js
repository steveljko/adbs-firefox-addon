import http from '.././helpers/http.js';

export const endpoints = {
    ping: `/ping`,
    login: `/login`,
};

export async function ping() {
  return await http.get(endpoints.ping);
}

export async function login(creds) {
  return await http.post(endpoints.login, creds);
}
