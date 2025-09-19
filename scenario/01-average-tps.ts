import http from "k6/http";
import { check, fail, sleep } from "k6";
import { Trend } from "k6/metrics";

// 環境に応じて修正
const baseUrl = __ENV.GATEWAY_ENDPOINT || "http://localhost:8000";
const urlPaths = ["orders", "cart", "catalogue"];

// レスポンスタイムを用いてテスト結果を判定するため専用のカスタムメトリクスを作成する
const responseTimeTrend = new Trend("response_time");

export const options = {
  scenarios: {
    contacts: {
      executor: "constant-arrival-rate", // 一定のリクエストレートを維持する
      duration: "1m", // テストの実行時間
      rate: 100, // 単位時間（timeUnit）あたりリクエスト数（=満たすべき平均TPS）
      timeUnit: "1s", // 単位時間
      preAllocatedVUs: 5, // 事前に割り当てる仮想ユーザー数
      maxVUs: 10, // 最大仮想ユーザー数
    },
  },
  thresholds: {
    // 5xxを含むエラーが発生していないこと
    checks: ["rate == 1.0"],
    // ネットワーク起因などの例外的なエラーを除きHTTP Requestが成功していること
    http_req_failed: ["rate < 0.001"],
    // レスポンスタイムが許容範囲内であること
    // see: https://developer.konghq.com/gateway/performance/benchmarks/#kong-gateway-performance-benchmark-results
    response_time: ["p(95) < 200", "p(99) < 500"],
  },
};

export function setup() {
  console.log("Waiting for services to be ready...");
  for (const path of urlPaths) {
    while (true) {
      const response = http.get(`${baseUrl}/${path}`);
      if (response.status === 200) {
        console.log(`${path} Service is ready.`);
        break;
      }
      console.log(`Waiting for ${path} service...`);
      sleep(1);
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
