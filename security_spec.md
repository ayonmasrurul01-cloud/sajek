# Security Specification (TDD Specification for Firestore Rules)

This document describes the security requirements and invariants for the Meghpunji Resort Firestore database.

## 1. Core Data Invariants

1. **Self-Service Boundaries**: A guest user can only read, create, and update their *own* bookings (where `userId == request.auth.uid` or matches their registered email). They must never access other guests' bookings.
2. **Immutable Identity**: A booking's `userId` and `id` must be immutable once created.
3. **Role-Based Access (RBAC)**: Only verified administrators whose UIDs exist in the `/admins` collection can:
   - Read all bookings, email logs, and contact submissions.
   - Modify booking fields such as `paymentStatus`, `status` (check-in, check-out, confirmed), and `adminNotes`.
4. **Self-Promoting Roles Prevented**: Normal users cannot add themselves to the `/admins` collection, nor modify other users' admin documents.
5. **No Anonymous/Unverified Writing**: All bookings must be made by a authenticated user with a verified email or a valid logged-in user profile, unless the app explicitly supports anonymous guest checkouts (which we secure by tracking bookings against their UID).
6. **Time & Sequence Constraints**: All timestamps (`createdAt`, `sentAt`) must be strictly bound to the server timestamp (`request.time`).

---

## 2. The "Dirty Dozen" Rogue Payloads

These 12 payloads are designed to challenge and test the integrity of our Firestore security configuration:

### Payload 1: Privilege Escalation - Self-Registration as Admin
An attacker tries to write directly to `/admins/{attackerUid}` to grant themselves admin privileges.
* **Target Path**: `/admins/attacker_uid`
* **Malicious Payload**: `{ "uid": "attacker_uid", "email": "malicious@attacker.com", "role": "admin" }`
* **Expected Result**: `PERMISSION_DENIED`

### Payload 2: Access Violation - Read Another Guest's Booking
An authenticated guest tries to read a booking belonging to another guest.
* **Target Path**: `/bookings/victim_booking_id`
* **Action**: `GET` (where booking document has `userId` as `victim_uid`)
* **Expected Result**: `PERMISSION_DENIED`

### Payload 3: Identity Spoofing - Creating Booking for Someone Else
An attacker tries to create a booking where they specify a different user's UID to charge or frame them.
* **Target Path**: `/bookings/new_booking_id`
* **Malicious Payload**: `{ "id": "new_booking_id", "userId": "victim_uid", "customerName": "Victim User", ... }`
* **Expected Result**: `PERMISSION_DENIED` (because `incoming().userId != request.auth.uid`)

### Payload 4: State Shortcutting - Force Confirm Unpaid Booking
An unauthenticated or normal user tries to update their booking status directly to `confirmed` or `checked_in` without making a payment or receiving admin approval.
* **Target Path**: `/bookings/booking_id`
* **Malicious Payload**: `{ "status": "confirmed" }` (or similar affectedKeys)
* **Expected Result**: `PERMISSION_DENIED` (only Admin can change the booking status/payment)

### Payload 5: Rogue Fields - Poisoning Schema with Ghost Field
An attacker tries to save a booking containing extra system-level fields to bypass processing.
* **Target Path**: `/bookings/booking_id`
* **Malicious Payload**: `{ "id": "booking_id", "customerName": "Attacker", ..., "isGlobalAdmin": true }`
* **Expected Result**: `PERMISSION_DENIED` (strictly checked by `keys().hasAll()` and `keys().size() == N` schema bounds)

### Payload 6: Denial of Wallet - Extreme ID Size Poisoning
An attacker attempts to inject a huge string of junk characters as a document ID to crash or balloon indexes.
* **Target Path**: `/bookings/VERY_LONG_STRING_OF_JUNK_CHARACTERS_THAT_REACHES_10KB_OR_MORE`
* **Expected Result**: `PERMISSION_DENIED` (blocked by `isValidId()` check)

### Payload 7: Timestamp Forgery - Retroactive Bookings
An attacker submits a booking with a falsified `createdAt` value set to three years in the past.
* **Target Path**: `/bookings/booking_id`
* **Malicious Payload**: `{ ..., "createdAt": "2023-01-01T00:00:00Z" }`
* **Expected Result**: `PERMISSION_DENIED` (must equal `request.time`)

### Payload 8: Immutable Identity Bypass - Re-assigning Booking Owner
An attacker tries to update an existing booking to change its `userId` or `customerEmail` to someone else.
* **Target Path**: `/bookings/booking_id`
* **Malicious Payload**: `{ "userId": "another_user_uid" }`
* **Expected Result**: `PERMISSION_DENIED` (requires `incoming().userId == existing().userId`)

### Payload 9: Rogue Email Spoofing - Impersonating Admin Notification
An attacker tries to insert a manual record into the `/email_logs` collection to trigger fake automated alerts to users.
* **Target Path**: `/email_logs/log_id`
* **Expected Result**: `PERMISSION_DENIED` (only admins can write logs, or server-backed integrations)

### Payload 10: Spamming Newsletter Subscriptions
An attacker attempts to submit a batch of random emails without a verified subscription timestamp.
* **Target Path**: `/newsletters/some_hash`
* **Malicious Payload**: `{ "email": "spam@example.com", "subscribedAt": "fake_timestamp" }`
* **Expected Result**: `PERMISSION_DENIED` (requires `request.time` matches)

### Payload 11: PII Data Leakage - Reading Contact Form Logs
An unauthorized user attempts to list and read all submitted `/contacts` feedback forms.
* **Target Path**: `/contacts`
* **Action**: `LIST` or `GET`
* **Expected Result**: `PERMISSION_DENIED` (only Admin can read contacts)

### Payload 12: Evading Financial Controls - Modifying Amount Paid
A customer updates their booking to set `amountPaid` equal to `totalAmount` without an actual transaction.
* **Target Path**: `/bookings/booking_id`
* **Malicious Payload**: `{ "amountPaid": 30000, "paymentStatus": "paid" }`
* **Expected Result**: `PERMISSION_DENIED` (only Admin can write financial/payment keys or state transitions)

---

## 3. Test Cases (TDD Verification)

To verify correctness, we run and validate our security posture so that any of the above "Dirty Dozen" attempts result in `PERMISSION_DENIED`.
