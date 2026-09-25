# EduSupport — Campus Helpdesk & Support Ticketing System

EduSupport is a full-stack campus helpdesk and support ticketing platform designed to streamline student support requests, manage department queues, track Service Level Agreements (SLAs), and provide visibility into ticket ownership and activity.

The system supports three primary roles — **Student, Staff, and Manager** — with role-based workflows for creating, assigning, processing, and monitoring support requests.

---

## 🌟 Key Features

* Student ticket creation and tracking
* Staff ticket assignment and management
* Manager-level ticket visibility
* Role-based authentication and authorization
* Ticket categories and priorities
* Controlled ticket status workflow
* SLA deadline calculation based on priority
* SLA breach identification
* Ticket comments/conversation
* Ticket activity history
* Responsive desktop and mobile UI
* Search/filtering of support tickets
* Protected API routes
* Demo accounts for evaluation

---

# 🏗️ Architecture & Technical Approach

## 1. Technology Stack

### Frontend

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Axios
* Lucide / React Icons

### Backend

* Node.js
* Express.js
* TypeScript
* JWT
* Bcrypt

### Database

* MongoDB Atlas
* Mongoose

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 2. Application Architecture

The application follows a modular full-stack architecture.

```text
                    ┌──────────────────────┐
                    │      Next.js UI      │
                    │ React + TypeScript   │
                    └──────────┬───────────┘
                               │
                              Axios
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Express REST API  │
                    │                      │
                    │ Auth / Controllers   │
                    │ Middleware / Routes  │
                    └──────────┬───────────┘
                               │
                          Mongoose
                               │
                               ▼
                    ┌──────────────────────┐
                    │    MongoDB Atlas     │
                    │                      │
                    │ Users / Tickets      │
                    │ Comments / Activity  │
                    └──────────────────────┘
```

The backend separates authentication, authorization, routing, controllers, models, and utility logic.

The frontend uses reusable components such as:

* Sidebar
* Navbar
* StatusBadge
* SlaBadge
* Ticket cards
* Ticket tables
* Create Ticket modal
* Custom dropdown components

---

# 👥 User Roles

## Student

Students can:

* Create support tickets
* View their own tickets
* Track ticket status
* Add comments/replies
* View ticket activity

## Staff

Staff can:

* View support tickets
* Manage assigned tickets
* Update status
* Change priority
* Assign/reassign tickets
* Respond to students
* Monitor SLA status

## Manager

Managers can:

* View broader ticket queues
* Monitor staff workload
* Review ticket status and priority
* Monitor SLA breaches
* Reassign tickets
* Review ticket activity

---

# 🔄 Ticket Workflow

Tickets follow a controlled lifecycle:

```text
OPEN
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
PENDING
  ↓
RESOLVED
  ↓
CLOSED
```

A resolved ticket can be reopened when additional action is required.

Important ticket changes are recorded in the activity history.

---

# ⏱️ SLA Model

Each ticket receives an SLA target based on its priority.

| Priority |   Target |
| -------- | -------: |
| Critical |  4 hours |
| High     | 12 hours |
| Medium   | 24 hours |
| Low      | 48 hours |

The application compares the ticket's `dueAt` value against the current time.

Active tickets whose SLA deadline has passed are identified as breached.

Resolved and closed tickets are excluded from active SLA breach calculations.

---

# 🧠 Product Decisions & Assumptions

## Ownership

Every ticket has a clear student owner and can be assigned to a staff member.

This helps avoid requests becoming unowned or difficult to track.

## Priority

Tickets support four priority levels:

```text
Critical
High
Medium
Low
```

Priority determines the SLA target and helps staff identify urgent requests.

## Activity History

Important actions such as assignment, status changes, and priority changes are recorded so that support teams can understand how a ticket progressed.

## Role-Based Access

Students should only be able to access their own tickets, while staff and managers have broader operational visibility.

Authorization is enforced on the backend rather than relying only on frontend route restrictions.

---

# 🔐 Authentication & Authorization

The application uses JWT-based authentication.

The backend uses authentication and authorization middleware to protect API endpoints.

Example role hierarchy:

```text
STUDENT
   │
   └── Own tickets

STAFF
   │
   └── Support queue

MANAGER
   │
   └── Broader management visibility
```

The frontend stores the authenticated session information locally for this prototype, while the backend validates the JWT before processing protected API requests.

### Prototype Trade-off

`localStorage` was chosen for the client-side session handling to keep the assessment implementation simple.

For a production system, authentication could be strengthened using secure, HTTP-only cookies and additional session/security controls.

---

# 🛡️ Validation & Edge Cases

The following scenarios were considered during development and testing:

### Authentication

* Invalid credentials
* Missing credentials
* Unauthorized API requests
* Expired/invalid authentication token

### Authorization

* Student attempting to access another student's ticket
* Student attempting to access staff routes
* Unauthorized role attempting restricted operations

### Ticket Management

* Required ticket fields
* Ticket assignment
* Priority changes
* Status changes
* Reopening resolved tickets
* Empty ticket lists
* API failures

### SLA

* SLA deadline calculation
* Active overdue tickets
* Resolved/closed tickets excluded from active SLA breach calculations

### UI

* Loading states
* API error states
* Empty states
* Mobile responsive layouts
* Mobile navigation drawer
* Custom dropdown outside-click behaviour

---

# 📱 Responsive Design

The application is designed for both desktop and mobile devices.

On larger screens, ticket information is presented using tables and dashboard layouts.

On smaller screens, ticket tables switch to stacked cards to avoid unnecessary horizontal scrolling.

The navigation also provides a mobile drawer with a backdrop overlay.

---

# ⚖️ Engineering Trade-offs

## Modular Monolith

A modular monolithic backend was selected instead of microservices.

### Reason

The assessment requires a working prototype rather than a distributed production system.

A modular monolith reduces:

* Development time
* Deployment complexity
* Infrastructure requirements

while keeping the application structure maintainable.

## Client-Side Session Handling

`localStorage` was selected for the prototype to simplify authentication state management.

For a production application, HTTP-only secure cookies would be preferable.

## SLA Calculation

SLA status is calculated from the stored deadline rather than introducing a separate background job system.

This keeps the prototype simple while still demonstrating the required SLA functionality.

---

# 🔌 Main API Endpoints

## Authentication

```text
POST /api/auth/login
```

## Tickets

```text
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
```

## Comments

```text
POST /api/tickets/:id/comments
```

Protected endpoints require a valid JWT.

---

# 🤖 AI / Tool Usage Report

## AI Tool Used

**Gemini**

## What I Asked AI To Do

1. Design and refine responsive dashboard layouts for student and staff views.
2. Build and improve custom Shadcn-style dropdown components with click-outside handling.
3. Review and polish React/Next.js components and TypeScript implementation.

## Most Useful Prompt

> Make this ticket listing table fully responsive on mobile screens, preventing awkward sideways scrolling and table clipping, by converting it to stacked cards on mobile while keeping the desktop table view.

## Code Generated by AI

AI assistance was used for:

* Custom click-outside dropdown logic
* Mobile navigation drawer/overlay components
* Responsive card/table layouts
* UI component styling suggestions

## Code I Modified

I modified the generated code to match the application's actual requirements, including:

* API endpoint integration
* Authentication flow
* Ticket API handling
* UI styling
* Component behaviour
* Responsive layouts
* TypeScript types

## AI Output That Was Wrong

Initial suggestions relied on native `<select>` elements for some dropdown interactions, which limited the level of custom styling and interaction required for the application.

## How I Identified the Problem

I tested the component in the application and compared its behaviour and visual consistency with the intended dashboard UI.

## How I Fixed It

I replaced the relevant native select interactions with custom React state-managed dropdown components using controlled state, absolute positioning, `useRef`, and outside-click handling.

## AI Validation

AI-generated suggestions were treated as development assistance rather than automatically trusted.

The implementation was reviewed and validated by running the application, testing user workflows, checking API behaviour, and manually testing responsive layouts and role-based access scenarios.

---

# 🔑 Test Accounts

All demo accounts use:

```text
Password: password123
```

### Student

```text
student@edusupport.com
```

### Staff

```text
staff@edusupport.com
```

### Manager

```text
manager@edusupport.com
```

---

# 🚀 Local Development

## 1. Clone Repository

```bash
git clone https://github.com/jithin045/edusupport.git
cd edusupport
```

## 2. Install Backend

```bash
cd server
npm install
```

## 3. Install Frontend

```bash
cd ../client
npm install
```

## 4. Backend Environment

Create:

```text
server/.env
```

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

## 5. Frontend Environment

Create:

```text
client/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 6. Seed Demo Data

```bash
cd server
npm run seed
```

## 7. Start Backend

```bash
npm run dev
```

## 8. Start Frontend

In another terminal:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🌐 Live Deployment

### Frontend

https://edusupport-seven.vercel.app

### Backend API

https://edusupport-server.onrender.com

### Source Code

https://github.com/jithin045/edusupport

---

LinkedIn: https://linkedin.com/in/jithin-thaliyil
