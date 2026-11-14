# FEVIQO Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default Deny**: Every unmatched path is strictly denied (`allow read, write: if false;`).
2. **Email Verification Mandate**: Every authenticated write requires `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Isolation**: `/members/{memberId}`, `/membershipOrders/{orderId}`, `/memberships/{membershipId}`, and `/membershipHistory/{historyId}` contain PII (`email`, `phone`, `fullName`) and are readable (`get` and `list`) **only** when `resource.data.ownerUid == request.auth.uid || isAdmin()`.
4. **Admin Isolation**: `/admins/{adminUid}`, `/adminAuditLogs/{logId}`, `/emailNotifications/{notifId}`, and `/membershipConfig/{configId}` writes are strictly restricted to verified `isAdmin()` accounts (`rexanmedia01@gmail.com` / `partner@feviqo.com` with `email_verified == true` or active doc in `/admins/{uid}`).
5. **No Self-Activated Memberships**: Only `isAdmin()` can `create` documents in `/memberships/{membershipId}`. Customers can only transition their own `active` membership to `cancelled` (`affectedKeys().hasOnly(['status', 'cancelledAt', 'updatedAt'])`).
6. **Order Relational Integrity & Terminal Locking**:
   - Customer `create` on `/membershipOrders/{orderId}` must start at `status == 'awaiting_payment'`, reference an existing `/members/{memberId}` owned by `request.auth.uid`, and lock `ownerUid == request.auth.uid`.
   - Customer `update` on `/membershipOrders/{orderId}` cannot mutate an `approved` or `expired` order and can only transition to `'pending_verification'` with `affectedKeys().hasOnly(['status', 'proofFileName', 'proofOriginalName', 'proofMimeType', 'proofDataUrl', 'proofSubmittedAt', 'paymentNote', 'rejectionReason', 'updatedAtIso', 'updatedAt'])`.
7. **Temporal Integrity & Immutability**: `createdAt == request.time` on create; `updatedAt == request.time` on update; `id`, `ownerUid`, `memberId`, `createdAt`, `createdAtIso` remain immutable after creation.
8. **Volumetric & Array Guards**: Every string field enforces strict `.size()` bounds matching `firebase-blueprint.json`, `selectedDramaIds` is bounded (`1..10`) with string element checks, and `proofDataUrl` is bounded to `<= 800000` bytes.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Order Creation**: Unauthenticated user attempts `setDoc(/membershipOrders/ord-evil)` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoofing Admin**: User with `email: 'rexanmedia01@gmail.com'` and `email_verified: false` attempts to list `/membershipOrders` or write `/admins/{uid}` -> `PERMISSION_DENIED`.
3. **PII Cross-Member Read**: Verified user `uid-A` attempts `getDoc(/members/mem-B)` owned by `uid-B` -> `PERMISSION_DENIED`.
4. **Blanket List Query Scrape**: Verified non-admin user attempts `getDocs(collection(db, 'membershipOrders'))` without `where('ownerUid', '==', uid)` -> `PERMISSION_DENIED`.
5. **Customer Self-Approving Order**: Verified customer `uid-A` attempts `updateDoc(/membershipOrders/ord-A, { status: 'approved' })` -> `PERMISSION_DENIED`.
6. **Customer Self-Creating Active Membership**: Verified customer `uid-A` attempts `setDoc(/memberships/sub-A, { status: 'active', ownerUid: 'uid-A', ... })` -> `PERMISSION_DENIED`.
7. **Shadow Ghost Field Injection**: Verified customer `uid-A` adds `isVerified: true` to `/membershipOrders/ord-A` create payload -> `PERMISSION_DENIED`.
8. **ID Poisoning Attack**: Attacker uses a 300-character or invalid `$`/`.` document ID on `/members/{id}` -> `PERMISSION_DENIED`.
9. **Terminal State Mutation**: Verified customer `uid-A` tries to overwrite an already `approved` order back to `pending_verification` -> `PERMISSION_DENIED`.
10. **Immutable Owner Tampering**: Verified customer `uid-A` tries to change `ownerUid` or `createdAt` during an update -> `PERMISSION_DENIED`.
11. **Oversized Proof / Value Poisoning**: Customer attempts to upload `proofDataUrl` > 800,000 chars or invalid `amountPkr` type (`"free"`) -> `PERMISSION_DENIED`.
12. **Privilege Escalation**: Non-admin user attempts `setDoc(/admins/uid-A, { role: 'admin', isActive: true })` -> `PERMISSION_DENIED`.
