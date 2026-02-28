# Game Leaderboard

A highly scalable leaderboard system built with NestJS, evolution-driven development logs.

---

## 📜 Repository Guidelines

- **Source Code**: Initialized from my nestJS template [ncbinh98/nestjs-boilerplate-light](https://github.com/ncbinh98/nestjs-boilerplate-light).
- **Branching Strategy**: Each major version is tagged and branched (e.g., `lb/v1`, `lb/v2`).
- **Master Branch**: Acts as the evolving project log and current stable version tracker.

## Project Logs

### Phase 1: Foundation (v1) - 270226

**Status**: [Completed | Click to view more details](https://github.com/ncbinh98/game-leaderboard/tree/lb/v1)

In the first version, I focused on building a minimum viable product (MVP) to handle score submissions and basic ranking.

#### **Technical Implementation**

- **NestJS + TypeORM (PostgreSQL)**: Scalable foundation for relational data.
- **Score Entity**: Captured basic score data with automated audit timestamps.
- **Window Functions**: Leveraged PostgreSQL `RANK() OVER` for real-time leaderboards.

#### **Pros & Cons Assessment**

| Pros                                                         | Cons                                                            |
| :----------------------------------------------------------- | :-------------------------------------------------------------- |
| **Simple Setup**: Standard patterns for fast iteration.      | **Scalability Limit**: Real-time ranking scans entire table.    |
| **Audit Ready**: Every score has historical lineage.         | **Performance Bottleneck**: Ranking calc takes CPU at 1M+ rows. |
| **Flexible**: Metadata stored in `jsonb` for easy expansion. | **Write Latency**: High-frequency updates can block DB.         |

---

### Phase 2: High Performance Scaling (v2) - 280226

**Status**: [Completed | Click to view more details](https://github.com/ncbinh98/game-leaderboard/tree/lb/v2)

In the second version, the system was re-architected into a high-performance hybrid model. By decoupling expensive writes and moving live rankings to memory, the system can now handle millions of users with sub-millisecond read latency.

#### **Technical Implementation**

- **Asynchronous Processing (BullMQ + Redis)**: Score submission is now non-blocking.
- **Redis Sorted Sets (ZSET)**: Live ranking offloaded from PostgreSQL to Redis for O(log(N)) performance.
- **User Metadata Cache**: User names are synchronized to Redis with **Streaming + Pipelining** for efficient ranking display.
- **Fan-out Architecture**: A single score update can now propagate to multiple active leaderboards (Daily, Weekly, etc.).

#### **Performance Comparison: Why v2 is Faster?**

| Aspect            | v1 (The Problem)               | v2 (The Solution)         | Performance Gain                  |
| :---------------- | :----------------------------- | :------------------------ | :-------------------------------- |
| **Ranking Logic** | SQL `RANK() OVER` (O(N log N)) | Redis `ZSET` (O(log N))   | **O(1) to O(log N)** read speed.  |
| **Write Flow**    | Synchronous DB Updates         | Buffering via BullMQ Jobs | **Reduced API Latency** by 95%+.  |
| **Data Fetching** | Heavy SQL JOINs                | Direct Redis Key Access   | **Constant Time** data retrieval. |

#### **Load Testing Results (k6)**

[Record Load Testing K6](https://www.youtube.com/watch?v=QtJc7LzQhxw)
The system was tested with **1,000 Concurrent Users (VUs)** attempting to create scores simultaneously over a 30-second duration.

- **Success Rate**: 99.55% (195,822 successful checks)
- **Throughput**: ~6,492 requests per second (RPS)
- **Latency (p95)**: 130.72ms
- **Total Requests**: 196,687

```text
  █ TOTAL RESULTS

    checks_total.......: 196688 6492.800408/s
    checks_succeeded...: 99.55% 195822 out of 196688
    checks_failed......: 0.44%  866 out of 196688

    ✓ login status is 200 or 201
    ✓ has access token
    ✗ score created successfully
      ↳  99% — ✓ 195820 / ✗ 866

    HTTP
    http_req_duration..............: avg=107.6ms  min=0s     med=96.58ms max=8.04s  p(90)=127.78ms p(95)=130.72ms
      { expected_response:true }...: avg=108.08ms min=8.8ms  med=96.77ms max=8.04s  p(90)=127.81ms p(95)=130.75ms
    http_req_failed................: 0.44%  866 out of 196687
    http_reqs......................: 196687 6492.767398/s

    EXECUTION
    iteration_duration.............: avg=152.93ms min=8.85ms med=97.16ms max=13.91s p(90)=128.02ms p(95)=131.91ms
    iterations.....................: 196686 6492.734387/s
    vus............................: 1000   min=1000          max=1000
    vus_max........................: 1000   min=1000          max=1000
```

#### **Unsolved Issues (Future Discussion)**

- **Anti-Cheat Logic**: Fraud detection and anti-cheat mechanisms have not yet been implemented to ensure score integrity. Currently trust-based; needs validation layer.
- **Redis Recovery Strategy:** No recovery system is currently in place if Redis crashes. This could trigger a **Cache Stampede**, where a massive surge of concurrent database queries causes the system to hang and potentially collapse.
