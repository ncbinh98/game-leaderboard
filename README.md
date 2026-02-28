# Game Leaderboard v2 (280226)

> **Note:** This source code was initialized from one of my previous NestJS template repositories created for personal use, which you can check out here: https://github.com/ncbinh98/nestjs-boilerplate-light

---

## Core Features

- **Asynchronous Score Ingestion**: Decoupled API submission from processing for maximum availability.
- **Real-time Rankings**: Sub-millisecond ranking retrieval using Redis Sorted Sets ($O(\log N)$).
- **Multi-Leaderboard Support**: Native "Fan-out" logic to update multiple competition contexts (Daily, Weekly, Global) from one score.
- **Personal Best Tracking**: Persistence of record-breaking scores per user/leaderboard.
- **Efficient User Cache**: Streaming user metadata synchronization with Redis Pipelining for minimal memory and network overhead.

---

## High-Level Architecture

The system follows an event-driven, hybrid architecture combining PostgreSQL's reliability with Redis's speed.
![alt Leaderboard v2](https://i.ibb.co/hJN9qdWM/lb-v2-drawio-1.png 'Leaderboard v2 Architecture')

---

## Core Entities

- **Users**: Central user management with identity and authentication details.
- **Scores**: Immutable, append-only audit log of every score ever submitted.
- **Leaderboards**: Meta-data for defining competition contexts (e.g., "Main Tournament", "Weekend Challenge").
- **LeaderboardEntries**: Unique link between a User and a Leaderboard, storing the user's **Personal Best** score.

---

## Comparison: Why v2 is Better?

| Aspect                | v1 (The Problem)      | v2 (The Solution)       | The "Why" (Impact)                                                                                             |
| :-------------------- | :-------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Ranking Logic**     | SQL `RANK() OVER`     | Redis `ZSET`            | **What**: Moves calculation from DB CPU to Memory. **Why**: 100x faster reads on large datasets.               |
| **Write Performance** | Synchronous DB Update | BullMQ Job Queue        | **What**: API returns `jobId` immediately. **Why**: Prevents API timeouts during viral traffic spikes.         |
| **Read Complexity**   | Aggregates + Joins    | Direct Redis Key Lookup | **What**: User names and scores are pre-cached. **Why**: Zero DB load for high-frequency leaderboard views.    |
| **Data Structure**    | Single Table Scan     | Fan-out Contexts        | **What**: Scores distributed to active leaderboards. **Why**: Allows infinite concurrent specialized rankings. |
| **Sync Strategy**     | Immediate / Manual    | Streaming + Pipelining  | **What**: Background sync with batching. **Why**: Keeps system fast with zero RAM/CPU overhead.                |

---

## API Examples

### 1. Submit a Score (Asynchronous)

**Endpoint**: `POST /scores`  
**Description**: Accepts a score and returns a background job ID.

```json
// POST /scores
{
  "userId": "uuid-here",
  "leaderboardId": "uuid-here",
  "scoreValue": 5000
}

// Response (202 Accepted)
{ "jobId": "123" }
```

### 2. Get Real-time Rankings

**Endpoint**: `GET /scores/ranked?top=10&leaderboardId=uuid-here`  
**Description**: Fetches the top 10 players for a specific leaderboard context.

```json
[
  { "rank": 1, "userId": "...", "score": 5000, "username": "ProGamer" },
  { "rank": 2, "userId": "...", "score": 4500, "username": "SpeedRunner" }
]
```

---

## 📜 Repository Guidelines

- **Source Code**: Evolved from [ncbinh98/nestjs-boilerplate-light](https://github.com/ncbinh98/nestjs-boilerplate-light).
- **History**: Initial v1 implementation can be found in the [lb/v1 branch](https://github.com/ncbinh98/game-leaderboard/tree/lb/v1).
- **Current State**: Main branch represents the v2 (Redis-Hybrid) architecture.
