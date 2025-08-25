import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.GATEWAY_ENDPOINT || "http://localhost:8000";
const urlPaths = ["orders", "cart", "catalogue"];

export const options = {
  vus: 10,
  duration: "5m",
};

export function setup() {
  console.log("Waiting for services to be ready...");
  while (true) {
    const response = http.get(`${baseUrl}/orders`)
    if (response.status === 200) {
      console.log("Orders Service is ready.");
      break;
    }
  }
  while (true) {
    const response = http.get(`${baseUrl}/catalogue`)
    if (response.status === 200) {
      console.log("Catalogue Service is ready.");
      break;
    }
  }
  while (true) {
    const response = http.get(`${baseUrl}/cart`)
    if (response.status === 200) {
      console.log("Cart Service is ready.");
      break;
    }
  }
}

export default function () {
  const path = urlPaths[Math.floor(Math.random() * urlPaths.length)];
  const url = `${baseUrl}/${path}`;
  const response = http.get(url);
  check(response, {
    "status is 200": (r) => r.status === 200,
  });
  sleep(1);
}

export function teardown() {
  console.log("Test completed.");
}
