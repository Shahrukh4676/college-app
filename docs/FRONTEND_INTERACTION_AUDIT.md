# Frontend Interaction Audit — Student Marketplace

This document provides a comprehensive inventory of every screen route, every interactive element (buttons, inputs, toggles, list items, filters, modals, sheets), its intended behavior, formal verification status, and backend dependencies.

### Verification Classification Key:
- **VERIFIED BY TEST**: Verified through automated unit, logic, or state machine test scripts.
- **VERIFIED BY MANUAL DEVICE TEST**: Verified during live interaction on Expo Go / Android device runtime.
- **STATICALLY INSPECTED ONLY**: Verified by code inspection and TypeScript AST typechecking.
- **BLOCKED BY BACKEND**: Frontend interface complete, but awaiting live server endpoint or gateway from Person 1.
- **FAILED — FIX REQUIRED**: Defect identified that requires code remediation.

---

## Route 1: Welcome & Onboarding (`/` — `src/app/index.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **"Create Student Account" Button** | Button: "Create Student Account" | Navigates to `/(auth)/register` | **VERIFIED BY TEST** | None |
| **"Sign In with Existing Account" Button** | Button: "Sign In with Existing Account" | Navigates to `/(auth)/login` | **VERIFIED BY TEST** | None |
| **"Browse Marketplace as Guest" Button** | Button: "Browse Marketplace as Guest" | Navigates to `/(tabs)/tasks` for unauthenticated discovery | **VERIFIED BY TEST** | None |

---

## Route 2: Login (`/(auth)/login` — `src/app/(auth)/login.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Email Input** | Input: "College / Academic Email" | Accepts email string; checks format | **VERIFIED BY TEST** | None |
| **Password Input** | Input: "Password" | Accepts password; masks characters | **VERIFIED BY TEST** | None |
| **Password Visibility Toggle** | Button: "Show password" / "Hide password" | Toggles `secureTextEntry` state via Input primitive | **STATICALLY INSPECTED ONLY** | None |
| **"Sign In" Button** | Button: "Sign In" | Validates schema, calls `authService.login`, handles loading & error | **VERIFIED BY TEST** | Blocked on Person 1 live auth in production |
| **"Forgot password?" Link** | Button: "Forgot password" | Navigates to `/(auth)/forgot-password` | **STATICALLY INSPECTED ONLY** | None |
| **"Register" Link** | Button: "Register now" | Navigates to `/(auth)/register` | **STATICALLY INSPECTED ONLY** | None |
| **Dev Credential Shortcuts** | Pressable: "Dev Mode: Tap here to fill demo test credentials" | Populates inputs with sample credentials (visible ONLY in `__DEV__`) | **VERIFIED BY TEST** | Strictly hidden in production builds |

---

## Route 3: Registration (`/(auth)/register` — `src/app/(auth)/register.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Full Name Input** | Input: "Full Name" | Updates name state | **VERIFIED BY TEST** | None |
| **Academic Email Input** | Input: "Academic / Institutional Email" | Validates email format | **VERIFIED BY TEST** | None |
| **College / University Input** | Input: "College / Institution" | Captures student institution name | **VERIFIED BY TEST** | None |
| **Course / Major Input** | Input: "Course / Branch" | Captures academic department | **VERIFIED BY TEST** | None |
| **Year of Study Input** | Input: "Year (1-5)" | Numeric constraint (1 to 6) | **VERIFIED BY TEST** | None |
| **Password Input** | Input: "Password" | Minimum 6 characters | **VERIFIED BY TEST** | None |
| **Confirm Password Input** | Input: "Confirm Password" | Validates equality with password | **VERIFIED BY TEST** | None |
| **"Complete Registration" Button** | Button: "Complete Registration" | Validates Zod schema, calls `authService.register`, locks button during submit | **VERIFIED BY TEST** | Blocked on Person 1 live auth in production |
| **"Sign In" Link** | Button: "Sign in" | Returns to `/(auth)/login` | **STATICALLY INSPECTED ONLY** | None |

---

## Route 4: Password Recovery (`/(auth)/forgot-password` — `src/app/(auth)/forgot-password.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Email Input** | Input: "Registered Email" | Validates email address format | **VERIFIED BY TEST** | None |
| **"Send Reset Link" Button** | Button: "Send Reset Link" | Submits request; displays confirmation instructions | **VERIFIED BY TEST** | Person 1 email service delivery |
| **"Return to Login" Button** | Button: "Return to Login" | Navigates back to `/(auth)/login` | **STATICALLY INSPECTED ONLY** | None |

---

## Route 5: Home Dashboard (`/(tabs)/home` — `src/app/(tabs)/home.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Notification Bell** | Button: "Notifications" | Navigates to `/(tabs)/notifications` | **STATICALLY INSPECTED ONLY** | None |
| **"Post a Task" Banner Button** | Button: "Post a task now" | Navigates to `/task/create` | **STATICALLY INSPECTED ONLY** | None |
| **Search Bar Shortcut** | Button: "Search marketplace tasks" | Navigates to `/(tabs)/tasks` | **STATICALLY INSPECTED ONLY** | None |
| **Category Quick Pills (x5)** | Buttons: "Coding", "Math", etc. | Navigates to `/(tabs)/tasks?category=...` with category filter pre-applied | **VERIFIED BY TEST** | None |
| **Task Cards in Feed** | Button / Card: Task items | Navigates to `/task/[id]` | **STATICALLY INSPECTED ONLY** | None |
| **"View all" Link** | Button: "View all" | Navigates to `/(tabs)/tasks` | **STATICALLY INSPECTED ONLY** | None |
| **Pull to Refresh** | Pull gesture | Refetches active tasks query | **STATICALLY INSPECTED ONLY** | None |
| **Error Retry Button** | Button: "Try Again" | Re-triggers query on network failure | **VERIFIED BY TEST** | None |

---

## Route 6: Marketplace & Search (`/(tabs)/tasks` — `src/app/(tabs)/tasks.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Search Input** | Input: "Search tasks..." | Filters task list in real time by keywords | **VERIFIED BY TEST** | None |
| **Search Clear Button (X)** | Button: Clear search | Clears search input text and resets filter | **VERIFIED BY TEST** | None |
| **Category Filter Pills (x7)** | Buttons: Category chips | Filters list by selected category | **VERIFIED BY TEST** | None |
| **Status Filter Pills (x4)** | Buttons: Status chips | Filters list by OPEN, IN_PROGRESS, COMPLETED | **VERIFIED BY TEST** | None |
| **"Reset All Filters" Button** | Button: "Reset All Filters" | Resets category to 'ALL' and clears search when 0 results found | **VERIFIED BY TEST** | None |
| **Task Cards** | Button / Card: Task items | Navigates to `/task/[id]` | **STATICALLY INSPECTED ONLY** | None |
| **Header "+" Button** | Button: "Create task" | Navigates to `/task/create` | **STATICALLY INSPECTED ONLY** | None |
| **Floating Action Button (FAB)** | Button: "Create Task FAB" | Elevated button navigating to `/task/create` | **STATICALLY INSPECTED ONLY** | None |
| **Pull to Refresh** | Pull gesture | Refetches task repository | **STATICALLY INSPECTED ONLY** | None |
| **Error Retry Button** | Button: "Try Again" | Re-attempts network query | **VERIFIED BY TEST** | None |

---

## Route 7: Task Creation (`/task/create` — `src/app/task/create.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Back Arrow Button** | Button: "Go back" | Prompts confirmation alert if unsaved changes exist; navigates back | **VERIFIED BY TEST** | None |
| **Title Input** | Input: "Task Title" | Validates minimum 5 characters | **VERIFIED BY TEST** | None |
| **Category Selector Chips** | Buttons: Category chips | Selects one of 7 academic categories | **VERIFIED BY TEST** | None |
| **Description Input** | Input: "Detailed Description & Scope" | Validates minimum 20 characters | **VERIFIED BY TEST** | None |
| **Budget Input** | Input: "Budget Offering (INR)" | Numeric input, enforces ₹50 minimum and ₹100,000 maximum | **VERIFIED BY TEST** | None |
| **Deadline Preset Chips** | Buttons: "24 Hours", "48 Hours", etc. | Sets estimated completion deadline | **VERIFIED BY TEST** | None |
| **Skill Tag Input** | Input: "Add required skill" | Accepts skill name text | **VERIFIED BY TEST** | None |
| **Skill "Add" Button** | Button: "Add" | Appends skill chip to required skills list | **VERIFIED BY TEST** | None |
| **Skill Pill Remove (X)** | Button: Remove skill | Removes specific skill chip | **VERIFIED BY TEST** | None |
| **"Publish Task" Button** | Button: "Publish Task" | Validates form, submits mutation, locks button, invalidates query cache, redirects to new task | **VERIFIED BY TEST** | Blocked on Person 1 live backend in production |

---

## Route 8: Task Details & Lifecycle (`/task/[id]` — `src/app/task/[id].tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Back Arrow Button** | Button: "Go back" | Returns to previous screen | **STATICALLY INSPECTED ONLY** | None |
| **Report Flag Button** | Button: "Report task" | Navigates to `/safety/report?targetType=TASK&targetId=...` | **STATICALLY INSPECTED ONLY** | None |
| **"Open Chat" Button** | Button: "Open Chat" | Appears when helper is assigned; navigates to `/(tabs)/messages` | **STATICALLY INSPECTED ONLY** | None |
| **"Submit Completed Work" Button** | Button: "Submit Completed Work" | Visible only to assigned helper in `IN_PROGRESS` status; transitions task to `SUBMITTED` | **VERIFIED BY TEST** | Blocked on Person 1 state mutation endpoint |
| **"Mark Completed & Release Escrow" Button** | Button: "Release Payment" | Visible only to task creator; displays confirmation alert; transitions task to `COMPLETED` | **VERIFIED BY TEST** | BLOCKED BY BACKEND (Server-side escrow release) |
| **"Submit Proposal / Offer" Button** | Button: "Submit Offer" | Visible to peers when task is `OPEN`; opens offer bottom sheet | **VERIFIED BY TEST** | None |
| **Offer Amount Input** | Input: "Your Price (INR)" | Validates positive numeric amount | **VERIFIED BY TEST** | None |
| **Delivery Hours Input** | Input: "Estimated Delivery" | Validates positive delivery hours | **VERIFIED BY TEST** | None |
| **Proposal Input** | Input: "Your Proposal" | Validates minimum 15 characters | **VERIFIED BY TEST** | None |
| **Modal "Submit Offer" Button** | Button: "Submit Offer" | Submits proposal to backend; refreshes offer list | **VERIFIED BY TEST** | Blocked on Person 1 live backend in production |
| **Modal Close Button (X)** | Button: Close modal | Closes offer modal without saving | **STATICALLY INSPECTED ONLY** | None |
| **Offer Card "Accept" Button** | Button: "Accept Offer" | Visible to requester; assigns helper and transitions task to `IN_PROGRESS` | **VERIFIED BY TEST** | Blocked on Person 1 live backend in production |
| **Offer Card "Decline" Button** | Button: "Decline Offer" | Visible to requester; rejects proposal | **VERIFIED BY TEST** | Blocked on Person 1 live backend in production |
| **Error Retry Button** | Button: "Try Again" | Re-attempts loading task data if network fails | **VERIFIED BY TEST** | None |

---

## Route 9: Conversations List (`/(tabs)/messages` — `src/app/(tabs)/messages.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Conversation Card** | Pressable: Conversation row | Navigates to `/chat/[id]` | **STATICALLY INSPECTED ONLY** | None |
| **Empty State "Browse Open Tasks"** | Button: "Browse Open Tasks" | Navigates to `/(tabs)/tasks` when no chats exist | **STATICALLY INSPECTED ONLY** | None |
| **Pull to Refresh** | Pull gesture | Refetches conversation list | **STATICALLY INSPECTED ONLY** | None |
| **Error Retry Button** | Button: "Try Again" | Refetches conversation list on network failure | **VERIFIED BY TEST** | None |

---

## Route 10: Chat Collaboration (`/chat/[id]` — `src/app/chat/[id].tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Back Arrow Button** | Button: "Go back" | Returns to conversation list | **STATICALLY INSPECTED ONLY** | None |
| **Message Text Input** | Input: "Type a message..." | Captures text; auto expanding | **VERIFIED BY TEST** | None |
| **Send Message Button** | Button: "Send message" | Sends message, appends to message stream, clears input | **VERIFIED BY TEST** | 4-second polling sync |
| **Error Retry Button** | Button: "Retry" | Refetches message stream on error | **VERIFIED BY TEST** | None |

---

## Route 11: Notifications (`/(tabs)/notifications` — `src/app/(tabs)/notifications.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Notification Card** | Pressable: Notification item | Marks notification as read; deep-links to task, chat, or profile | **STATICALLY INSPECTED ONLY** | None |
| **Pull to Refresh** | Pull gesture | Refetches notification list | **STATICALLY INSPECTED ONLY** | None |
| **Error Retry Button** | Button: "Try Again" | Refetches notifications on failure | **VERIFIED BY TEST** | None |

---

## Route 12: Student Profile (`/(tabs)/profile` — `src/app/(tabs)/profile.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Settings Gear Button** | Button: "Settings" | Navigates to `/settings` | **STATICALLY INSPECTED ONLY** | None |
| **"Edit Profile Info" Button** | Button: "Edit Profile Info" | Opens biography edit modal | **STATICALLY INSPECTED ONLY** | None |
| **Bio Input (in Modal)** | Input: "Bio / Academic Specialization" | Captures multi-line bio text | **STATICALLY INSPECTED ONLY** | None |
| **Modal "Save Changes" Button** | Button: "Save Changes" | Updates profile via `authService.updateProfile` | **VERIFIED BY TEST** | Blocked on Person 1 live backend in production |
| **Modal "Cancel" Button** | Button: "Cancel" | Dismisses edit modal | **STATICALLY INSPECTED ONLY** | None |
| **Skill Input** | Input: "Add skill" | Captures new skill text | **VERIFIED BY TEST** | None |
| **Skill "Add" Button** | Button: "Add" | Appends skill to profile and saves | **VERIFIED BY TEST** | None |
| **Skill Pill Remove (X)** | Button: Remove skill | Removes skill from profile and saves | **VERIFIED BY TEST** | None |
| **"Log Out" Button** | Button: "Log Out" | Prompts confirmation alert; clears session and navigates to `/` | **VERIFIED BY TEST** | None |

---

## Route 13: Settings (`/settings` — `src/app/settings/index.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Back Arrow Button** | Button: "Go back" | Returns to profile screen | **STATICALLY INSPECTED ONLY** | None |
| **Push Notifications Switch** | Switch | Toggles push notification preference state | **STATICALLY INSPECTED ONLY** | Local state / backend persistence |
| **Email Digests Switch** | Switch | Toggles email alert preference | **STATICALLY INSPECTED ONLY** | Local state / backend persistence |
| **Sound Effects Switch** | Switch | Toggles in-app sound preference | **STATICALLY INSPECTED ONLY** | Local state persistence |
| **Academic Integrity Code** | Pressable: Academic Integrity row | Opens full honor code principles dialog | **STATICALLY INSPECTED ONLY** | None |
| **Privacy & Data Protection** | Pressable: Privacy & Data Protection row | Opens data protection policies dialog | **STATICALLY INSPECTED ONLY** | None |
| **Help & Support Desk** | Pressable: Help & Support Desk row | Launches email client to `support@studentmarketplace.campus.edu` with fallback info | **STATICALLY INSPECTED ONLY** | Mail client availability |
| **Developer Mock Mode Switch** | Switch: "Offline Mock API" | Toggles mock repository on/off (visible ONLY in `__DEV__`) | **VERIFIED BY TEST** | Strictly disabled in production |
| **"Sign Out" Button** | Pressable: "Sign Out" | Prompts confirmation; clears SecureStore and redirects to `/` | **VERIFIED BY TEST** | None |
| **"Delete Account Request"** | Pressable: "Delete Account Request" | Explains escrow clearance requirements and submits request | **STATICALLY INSPECTED ONLY** | Administrator review |

---

## Route 14: Safety Report (`/safety/report` — `src/app/safety/report.tsx`)

| Interactive Element | Accessibility Label / Role | Expected Action | Verification Status | Limitation / Dependency |
|---|---|---|---|---|
| **Back Arrow Button** | Button: "Go back" | Returns to previous screen | **STATICALLY INSPECTED ONLY** | None |
| **Reason Radio Buttons (x6)** | Pressable: Violation options | Selects violation category | **STATICALLY INSPECTED ONLY** | None |
| **Additional Details Input** | Input: "Additional Details (Optional)" | Captures optional context explanation | **STATICALLY INSPECTED ONLY** | None |
| **"Submit Report" Button** | Button: "Submit Report" | Validates, submits mutation, displays confirmation, and returns to previous screen | **VERIFIED BY TEST** | Blocked on Person 1 live backend in production |
