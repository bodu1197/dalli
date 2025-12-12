# 👑 Super Admin Dashboard Implementation Plan

This document outlines the roadmap to transform the current "Mock UI" admin dashboard into a fully functional, production-grade control center for the Dalli platform.

## 🎯 Objective
Build a verified, secure, and data-driven Super Admin Dashboard that allows comprehensive management of Users (Buyers, Owners, Riders), Stores, Orders, and Settlements.

## 🛡️ Phase 1: Security & Foundation (Critical)
**Goal:** Ensure only authorized personnel can access admin APIs and data.

### 1.1 Role-Based Access Control (RBAC) & RLS
- **Database Policies:**
  - Create specific RLS policies for `admin` role in Supabase.
  - Allow `select`, `insert`, `update`, `delete` on ALL tables for users with `metadata.role = 'admin'`.
  - *Risk:* Without this, admins might be blocked by standard user RLS policies.
- **Middleware Enhancement:**
  - Strict enforcement of `/admin/*` routes.
  - Double-check user role in `src/middleware.ts` to prevent unauthorized access via URL manipulation.

### 1.2 Admin Service Layer
- Create `src/lib/services/admin.service.ts`.
- **Why?** Separate admin logic from `order.service.ts` or `user.service.ts` to prevent accidental exposure of sensitive admin capabilities to normal users.
- **Key Functions:**
  - `getAdminStats()`: Aggregated metrics (Total Sales, MAU, etc.).
  - `getAllUsers(filter, page)`: Paginated user list.
  - `updateUserStatus(userId, status)`: Ban/Unban logic.

---

## 👥 Phase 2: Core Management Modules

### 2.1 User Management (`/admin/users`)
- **Features:**
  - **List View:** Server-side pagination for thousands of users.
  - **Search:** Real-time search by email/phone/name using Supabase `ilike`.
  - **Action:** "Suspend User" (Ban) button with reason modal.
- **Implementation:**
  - Replace `MOCK_USERS` with `useQuery(['admin', 'users'], ...)` using pure Supabase client.

### 2.2 Store Verification System (`/admin/stores`)
- **Features:**
  - **Workflow:** Pending -> (Review Docs) -> Active / Rejected.
  - **Document Viewer:** Ability to see business license images.
  - **Status Change:** Button to "Approve" or "Reject" store applications.
- **Notification:** Trigger email/push notification to Owner upon approval.

### 2.3 Order Oversight (`/admin/orders`)
- **Features:**
  - **Global View:** See ALL orders across the platform (not limited by user ID).
  - **Emergency Override:** Admin ability to manually change order status (e.g., Force Cancel, Force Complete) in case of system hang or dispute.
  - **Dispute Resolution:** "Refund" action that triggers payment gateway refund logic.

---

## 📊 Phase 3: Analytics & Settlements (Super App Level)

### 3.1 Real-time Dashboard (`/admin/page.tsx`)
- **Live Metrics:**
  - Use Supabase Realtime to update "Order Count" badge instantly.
  - **Charts:** Visual graphs for "Hourly Orders" and "Daily Revenue" using `recharts`.
- **Optimization:** Use PostgreSQL Materialized Views for heavy aggregation queries (e.g., Monthly Sales) to keep the dashboard fast.

### 3.2 Settlements & Payouts (`/admin/settlements`)
- **Logic:**
  - Calculate: `Order Total` - `Platform Fee` - `Delivery Fee` = `Owner Payout`.
  - Generate clean "Settlement Statements" for owners.
  - **Payout Status:** Track `Pending` -> `Processing` -> `Paid`.

---

## 📅 Execution Roadmap

### Step 1: Backend & Security (Day 1-2)
- [ ] Configure Supabase RLS for Admin role.
- [ ] Implement `admin.service.ts` base structure.

### Step 2: User & Store Management (Day 3-5)
- [ ] Connect `/admin/users` to real DB.
- [ ] Connect `/admin/stores` filtering and approval logic.

### Step 3: Order & Dashboard (Day 6-7)
- [ ] Implement Global Order View.
- [ ] Wire up Main Dashboard statistics.

## 🚨 Critical Checkpoints
- **Data Privacy:** Admin access logs must be kept. Who banned whom? Who viewed whose phone number?
- **Performance:** Pagination is mandatory. Do not `select *` on the users table.
