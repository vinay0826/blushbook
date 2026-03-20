# Migrations

- Run all setup steps: `npm run migrate`
- Current migrations:
  - `001_init_collections.js`: creates base collections and indexes (`users`, `reviews`, `shelfitems`)
  - `002_review_feed_indexes.js`: adds feed-focused indexes for search, pagination, and top liked sorting
  - `003_add_comments_follows.js`: creates `comments` + `follows` collections and indexes
