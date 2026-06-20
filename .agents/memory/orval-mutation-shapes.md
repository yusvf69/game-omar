---
name: Orval mutation shapes
description: Correct call signature for Orval-generated useMutation hooks in this repo.
---

Orval-generated mutation hooks in this repo use a **flat** call signature.
Path params are top-level siblings of `data`, NOT wrapped in a `params` object.

**Correct:**
```ts
updateGame.mutate({ id: game.id, data: payload });
deleteGame.mutate({ id: game.id });
addToWishlist.mutate({ id: userId, data: { gameId } });
removeFromWishlist.mutate({ userId, gameId });
createReview.mutate({ id: gameId, data: { userId, rating, content } });
```

**Wrong (causes TS2353 "params does not exist" error):**
```ts
updateGame.mutate({ params: { id: game.id }, data: payload }); // ❌
```

**Why:** Orval inlines path params directly into the mutation variables type. The generated type is `{ id: number; data: Body }`, not `{ params: { id }; data: Body }`.

**How to apply:** Whenever writing a mutation call for an Orval-generated hook, check the generated type in `lib/api-client-react/src/generated/api.ts` before writing the call.
