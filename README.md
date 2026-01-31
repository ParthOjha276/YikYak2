# 🐂 YikYak 2.0 

**A hyper-local, anonymous social network for university campuses with role-based moderation and campus isolation.**

> **Submission for [Hackathon Name] 2026**

## 🚀 Features Implemented

* **🎓 True Campus Isolation:**
* Data is strictly segregated by campus domain (e.g., `@a.edu` vs `@b.edu`).
* Students at School A cannot access, view, or interact with School B's content.


* **🛡️ Role-Based Access Control (RBAC):**
* **Student:** Can post, comment, and create communities.
* **Moderator:** Custom permissions to Ban Users and Delete Posts, restricted strictly to the communities they own (e.g., a Gaming Mod cannot delete General posts).
* **Owner:** Global administrative access.


* **🗳️ Complex Voting Logic:**
* Implemented Reddit-style Upvote/Downvote system with state tracking (1, 0, -1).
* Prevents duplicate voting and handles score calculation atomically in the backend.


* **🏘️ Dynamic Community Creation:**
* Users can instantiate new "Herds" (communities).
* Creators automatically become owners of their communities.


* **🔞 Content Safety:**
* Integrated NSFW toggle and content blurring for sensitive media.



## 🏗️ Technical Architecture

This project utilizes a **Monolithic Serverless Architecture** built on the Next.js App Router.

### Data Flow

1. **Client Layer:** React components (Client Components) handle UI state, optimistic updates, and user interactions.
2. **API Layer:** Next.js API Routes (`src/app/api/*`) serve as the backend endpoints, handling authentication, validation, and business logic.
3. **Data Access Layer:** **Prisma ORM** provides type-safe database access, managing complex relations (User <-> Posts <-> Votes).
4. **Persistence Layer:** **SQLite** is used as a portable, file-based relational database (`dev.db`), ensuring full data persistence with zero external infrastructure dependencies.

### Database Schema

* **User:** Stores credentials, RBAC roles, and campus affinity.
* **Community:** Groups posts; linked to a specific Campus and Creator.
* **Post/Comment:** Relational content linked to Authors and Communities.
* **Vote:** Unique constraint table `(userId, postId)` to enforce "one vote per user."

## 📸 Screenshots

### 1. The Campus Feed

*Real-time feed with sorting (New/Top) and voting.*

### 2. Role-Based Moderation

*Moderators see "Trash" and "Ban" tools, but only in their assigned communities.*

### 3. Campus Isolation

*Login system routes users to completely separate data silos based on email domain.*

---

## ⚡️ Instructions to Run/Test

Follow these steps to deploy the prototype locally.

### 1. Install Dependencies

```bash
npm install

```

### 2. Initialize Database

We use SQLite for portability. This command creates the local database file.

```bash
npx prisma db push

```

### 3. Start the Server

```bash
npm run dev

```

Access the app at: **[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)**

### 4. 🌱 CRITICAL: Seed the Data

**You must run the seed script to create the initial users and communities.**
Visit this URL in your browser:

> **[http://localhost:3000/api/seed](https://www.google.com/search?q=http://localhost:3000/api/seed)**

*You will see a JSON success message.*

---

## 🔑 Demo Credentials

Please use these accounts to verify the Role-Based Access and Campus Isolation.

| Role | Email | Password | Features to Test |
| --- | --- | --- | --- |
| **Moderator** | `mod@a.edu.in` | `admin` | Go to **#Gaming**. Test the **Delete/Ban buttons**. Notice they are missing in #General. |
| **Student** | `student@a.edu.in` | `123` | Create a post. Create a community (`+` button). Test Upvoting/Downvoting. |
| **Spy (School B)** | `spy@b.edu.in` | `123` | **Isolation Test:** Log in here. You will NOT see School A's posts. |

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14
* **Database:** SQLite
* **ORM:** Prisma
* **Styling:** Tailwind CSS
* **Icons:** Lucide React



