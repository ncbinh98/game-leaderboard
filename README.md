# Game Leaderboard

A highly scalable leaderboard system built with NestJS, evolution-driven development logs.

---

## Project Logs

### Phase 1: Foundation (v1) - 2026-02-27

**Status**: [Completed|Click to view more details](https://github.com/ncbinh98/game-leaderboard/tree/lb/v1)

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

### Phase 2: High Performance Scaling (v2) - _In Progress_

**Focus**: Low-latency rankings and multi-leaderboard support.

#### **Planned Enhancements**

- [ ] **Redis Sorted Sets (ZSET)**: Offload live ranking from PostgreSQL to Redis for O(log(N)) performance.
- [ ] **Leaderboard Contexts**: Support multiple rankings (Weekly, Mode-Specific, Friends-Only).
- [ ] **Personal Best Cache**: Store high-scores on User entities to avoid aggregation.
- [ ] **Source of Truth Refactor**: Append-only score tracking with fan-out to specialized ranking tables.

## 📜 Repository Guidelines

- **Source Code**: Initialized from [ncbinh98/nestjs-boilerplate-light](https://github.com/ncbinh98/nestjs-boilerplate-light).
- **Branching Strategy**: Each major version is tagged and branched (e.g., `lb/v1`).
- **Master Branch**: Acts as the evolving project log and current stable version tracker.
