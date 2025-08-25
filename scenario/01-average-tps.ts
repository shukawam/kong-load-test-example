import http from "k6/http";
import { check, sleep, fail } from "k6";
import { Trend } from "k6/metrics";

// 環境に応じて修正
const baseUrl = __ENV.GATEWAY_ENDPOINT || "http://localhost:8000";
const urlPaths = ["orders", "cart", "catalogue"];

const responseTimeTrend = new Trend("response_time");

export const options = {
  scenarios: {
    average_load_test: {
      executor: "constant-arrival-rate",
      rate: 100,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 20,
      maxVUs: 40,
    },
  },
  thresholds: {
    // 5xxを含むエラーが発生していないこと
    checks: ["rate == 1.0"],
    // ネットワーク起因などの例外的なエラーを除きHTTP Requestが成功していること
    http_req_failed: ["rate < 0.001"],
    // レスポンスタイムが許容範囲内であること
    // see: https://developer.konghq.com/gateway/performance/benchmarks/#kong-gateway-performance-benchmark-results
    response_time: ["p(95) < 3.6", "p(99) < 6.28"],
  },
};

export function setup() {
  console.log("Waiting for services to be ready...");
  while (true) {
    const response = http.get(`${baseUrl}/orders`);
    if (response.status === 200) {
      console.log("Orders Service is ready.");
      break;
    }
  }
  while (true) {
    const response = http.get(`${baseUrl}/catalogue`);
    if (response.status === 200) {
      console.log("Catalogue Service is ready.");
      break;
    }
  }
  while (true) {
    const response = http.get(`${baseUrl}/cart`);
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
  responseTimeTrend.add(response.timings.duration);
  const result = check(response, {
    "status is 200": (response) => response.status === 200,
    "status is not 5xx": (response) => response.status < 500,
  });
  if (!result) {
    fail("unexpected response");
  }
}

export function teardown() {
  console.log("Test completed.");
}
