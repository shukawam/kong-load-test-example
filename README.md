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

TODO
