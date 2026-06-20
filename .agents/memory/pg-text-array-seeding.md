---
name: PostgreSQL text array seeding
description: How to insert text[] values when using executeSql in code_execution.
---

When seeding PostgreSQL `text[]` columns via raw SQL in the `executeSql` sandbox, `JSON.stringify([...])` produces malformed array literals. Use PostgreSQL's own array literal syntax instead.

**Correct:**
```js
params: [`{"item1","item2","item3"}`]
// with cast in SQL:
// $5::text[]
```

**Wrong:**
```js
params: [JSON.stringify(["item1","item2"])]  // ❌ "malformed array literal"
```

**Why:** PostgreSQL parses `{...}` as its native array format. JSON arrays use square brackets which PostgreSQL doesn't recognize for ARRAY types without explicit casting to jsonb first.
