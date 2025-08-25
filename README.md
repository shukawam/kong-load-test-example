# Kong Load Test Example

This is a sample code for load testing to Kong Gateway.

see: [https://developer.konghq.com/gateway/performance/benchmarks/#kong-gateway-performance-benchmark-results](https://developer.konghq.com/gateway/performance/benchmarks/#kong-gateway-performance-benchmark-results)

## Overview

This is an architecture of entire system.

![overview](/image/overview.png)

## How to run?

Run the following script:

```sh
k6 run \
    --out experimental-prometheus-rw \
    --env GATEWAY_ENDPOINT=http://localhost:8000 \
    ./scenario/01-average-tps.ts
```

## Scenarios

### 01-average-tps

Adjust the following based on your environment.

```ts
// 環境に応じて修正
const baseUrl = __ENV.GATEWAY_ENDPOINT || "http://localhost:8000";
const urlPaths = ["orders", "cart", "catalogue"];

// ... omit ...

// 環境に応じて修正
export const options = {
  scenarios: {
    contacts: {
      executor: "constant-arrival-rate", // 一定のリクエストレートを維持する
      duration: "5m", // テストの実行時間
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
```

### 02-ramp-up-slowly

Adjust the following based on your environment.

```ts
// 環境に応じて修正
const baseUrl = __ENV.GATEWAY_ENDPOINT || "http://localhost:8000";
const urlPaths = ["orders", "cart", "catalogue"];

// ... omit ...

// 環境に応じて修正
export const options = {
  scenarios: {
    contacts: {
      executor: "ramping-arrival-rate",
      startRate: 10, // 単位時間（timeUnit）あたりの初期リクエストレート
      timeUnit: "1s", // 単位時間
      preAllocatedVUs: 5, // 事前に割り当てる仮想ユーザー数
      stages: [
        { target: 10, duration: "1m" }, // 最初の1分間は10rpsで一定
        { target: 20, duration: "5m" }, // 次の5分間は20rpsで一定
        { target: 10, duration: "1m" }, // 最後の1分間は10rpsで一定
      ],
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
```

### 03-ramp-up-spike

Adjust the following based on your environment.

```ts
// 環境に応じて修正
const baseUrl = __ENV.GATEWAY_ENDPOINT || "http://localhost:8000";
const urlPaths = ["orders", "cart", "catalogue"];

// ... omit ...

// 環境に応じて修正
export const options = {
  scenarios: {
    contacts: {
      executor: "ramping-arrival-rate",
      startRate: 10, // 単位時間（timeUnit）あたりの初期リクエストレート
      timeUnit: "1s", // 単位時間
      preAllocatedVUs: 5, // 事前に割り当てる仮想ユーザー数
      stages: [
        { target: 10, duration: "1m" }, // 最初の1分間は10rpsで一定
        { target: 30, duration: "1m" }, // 次の1分間は30rpsで一定
        { target: 10, duration: "1m" }, // 最後の1分間は10rpsで一定
      ],
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
```
