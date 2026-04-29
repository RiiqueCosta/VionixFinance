# Security Specification - Vionix Finance

## 1. Data Invariants
- Every Transaction must belong to a User (`userId` matches owner).
- Every Goal must belong to a User (`userId` matches owner).
- Users can only access their own settings.
- Dates and amounts must be well-formed.
- Timestamps (`createdAt`, `updatedAt`) should be server-side validated where possible.

## 2. The "Dirty Dozen" Payloads (Malicious attempts)
1. **Identity Spoofing**: Create transaction with `userId` of another user.
2. **Settings Hijack**: Read `users/victim-id/settings/data`.
3. **Ghost Fields**: Add `isVerified: true` to a transaction.
4. **Negative Amount**: Set transaction `amount` to -999999.
5. **Huge ID**: Use a 2MB string as document ID.
6. **Bypass Verification**: Write data without `email_verified` (if required).
7. **Cross-User Query**: Query `transactions` without `userId` filter.
8. **Resource Exhaustion**: Write 1MB of junk into `description`.
9. **Timestamp Spoofing**: Send a future `createdAt` from the client.
10. **State Corruption**: Update someone else's goal `currentAmount`.
11. **Orphaned Write**: Create a transaction for a non-existent user path.
12. **PII Leak**: Read the whole `users` collection.

## 3. Anticipated Rule Structure
- Global Deny
- `isSignedIn()` helper
- `isOwner(userId)` helper
- `isValidTransaction(data)` helper
- `isValidGoal(data)` helper
- Strict `list` filters matching `resource.data.userId`
