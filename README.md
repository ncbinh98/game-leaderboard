# Game Leaderboard v1 (270226)

Note: This source code was initialized from one of my previous NestJS template repositories created for personal use, which you can check out here: https://github.com/ncbinh98/nestjs-boilerplate-light

### **Pros:**

- **Simplicity & Functionality:** A basic and straightforward version for inserting and retrieving leaderboard data, ensuring all functional requirements are met.
- **Minimal Complexity:** The module consists only of `scores` and `users`, making it ideal for small datasets, fast startup, and MVP (Minimum Viable Product) development.

### **Cons:**

- **Scalability Issues:** Unable to handle large datasets or provide low-latency leaderboard queries, as it requires scanning the entire `scores` table to calculate rankings.
- **Performance Bottleneck:** If 1M users attempt to retrieve their rank simultaneously, the database will likely hang.
- **Write Latency:** With high-frequency score updates and a large user base, the database will become a write bottleneck, significantly slowing down performance.

### For the next version, I will implement the following:

- **Utilize Redis Sorted Sets (ZSET):** To store live rankings and enable faster user rank queries.
- **Expand Database Schema:** Create a `leaderboards` table (to support multiple leaderboards per game, such as weekly or mode-specific rankings) and a `leaderboard_best_scores` table to store a user's highest score for a specific leaderboard.
- **Refactor Score Management:** Add a `leaderboardId` field to the `scores` table; the `scores` table will serve as the **Source of Truth**, where records are **append-only** (no updates) and subsequently **fanned out** to the corresponding leaderboards.

# 🕹️ API Examples (Functional Requirements)

### 1. Record a Score

**Endpoint**: `POST /scores`

**Request Body**:

```json
{
  "userId": "d7b2a1a0-e8f0-4c3e-9b1a-1a2b3c4d5e6f",
  "scoreValue": 100
}
```

**Response**:

```json
{
  "userId": "d7b2a1a0-e8f0-4c3e-9b1a-1a2b3c4d5e6f",
  "scoreValue": 100,
  "id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "createdAt": "2026-02-27T20:30:00.000Z"
}
```

### 2. Get Ranked Leaderboard

**Endpoint**: `GET /scores/ranked`

**Response**:

```json
[
  {
    "id": "a96efdf6-6b0c-4842-b7f8-23081e2a3ce5",
    "userId": "857e9dcf-6d5b-4c94-bc22-dfc3ed355100",
    "scoreValue": 100,
    "metaData": null,
    "createdAt": "2026-02-27T13:20:38.141Z",
    "rank": 1
  },
  {
    "id": "24983be0-609a-4753-a674-b724916858be",
    "userId": "f40dfcaf-0de7-425f-bd22-b16966b0aec1",
    "scoreValue": 90,
    "metaData": null,
    "createdAt": "2026-02-27T13:21:53.147Z",
    "rank": 2
  }
]
```

---
