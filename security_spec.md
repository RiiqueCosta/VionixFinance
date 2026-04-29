# Security Specification

## Data Invariants
1. A transaction must always belong to the authenticated user (`userId` match).
2. A financial goal must always belong to the authenticated user.
3. Users can only read their own data (no blanket reads).
4. Timestamps (`createdAt`, `updatedAt`) must be strictly validated against `request.time`.
5. Document IDs must be validated to prevent poisoning.

## The "Dirty Dozen" Payloads (Test Cases)

1. **Identity Spoofing**: Attempt to create a transaction with `userId` of another user.
2. **Identity Spoofing (Update)**: Attempt to change `userId` of an existing transaction.
3. **Shadow Field Injection**: Adding `isAdmin: true` to a transaction.
4. **ID Poisoning**: Using a 2KB string as a transaction ID.
5. **Type Poisoning**: Sending `amount: "ten thousand"` (string) instead of a number.
6. **Resource Exhaustion**: Sending a 1MB string in `description`.
7. **Temporal Fraud**: Setting `createdAt` to a future date instead of `request.time`.
8. **Malicious Update**: Changing `createdAt` of an existing transaction.
9. **Relational Bypass**: Listing transactions without a `where` clause (rules must catch this).
10. **State Shortcut**: Setting a goal's `currentAmount` to a negative value or non-number.
11. **PII Leak**: Authenticated user trying to `get` another user's settings.
12. **Unauthenticated Write**: Attempting to create a goal without being signed in.

## Test Runner (Mock)
(Tests would verify PERMISSION_DENIED for above cases)
