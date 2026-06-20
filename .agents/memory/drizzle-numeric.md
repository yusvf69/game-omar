---
name: Drizzle numeric casting
description: Drizzle ORM returns numeric/decimal columns as strings from the pg driver.
---

Drizzle's `numeric()` column type maps to PostgreSQL NUMERIC/DECIMAL but the `pg` driver returns these as **JavaScript strings**, not numbers.

```ts
// game.price is string "19.99" not number
Number(game.price).toFixed(2) // ✓
game.price.toFixed(2) // ✗ runtime crash
```

**Pattern used in this project:** All route handlers call `Number(g.price)` and `Number(g.rating)` before returning JSON.

**How to apply:** Any time a Drizzle schema uses `numeric(...)`, wrap the field in `Number(...)` when reading it for math, display, or serialization.
