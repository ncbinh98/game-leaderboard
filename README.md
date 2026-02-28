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

#### **Unsolved Issues (Future Discussion)**

- **Anti-Cheat Logic**: Fraud detection and anti-cheat mechanisms have not yet been implemented to ensure score integrity. Currently trust-based; needs validation layer.
- **Redis Recovery Strategy:** No recovery system is currently in place if Redis crashes. This could trigger a **Cache Stampede**, where a massive surge of concurrent database queries causes the system to hang and potentially collapse.
