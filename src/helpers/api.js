import http from '.././helpers/http.js';

export const endpoints = {
    ping: `/ping`,
};

export async function ping() {
  return await http.get(endpoints.ping);
}
