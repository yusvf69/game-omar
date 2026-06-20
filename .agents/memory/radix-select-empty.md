---
name: Radix Select empty values
description: Radix UI Select.Item cannot have empty string as value — causes runtime crash.
---

Radix UI's `<SelectItem value="">` throws: *"A Select.Item must have a value prop that is not an empty string."*

**Fix:** Use a non-empty sentinel string like `"__all__"` for "no filter" options, then convert to `undefined` before passing to APIs.

```tsx
// State
const [tier, setTier] = useState("__all__");

// Convert for API call
subscription_tier: tier !== "__all__" ? tier : undefined,

// JSX
<SelectItem value="__all__">All Tiers</SelectItem>
```

**Why:** Radix uses empty string internally to mean "no selection / placeholder shown", so it reserves it and throws if you try to use it as an actual value.
