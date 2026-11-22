# Arabic Educational Platform - API Full Guide

Comprehensive REST API reference for the Arabic Educational Platform Backend.

---

## Overview & Architecture

- **Base URL:** `http://localhost:5000` (or `PORT` from `.env`)
- **API Prefix:** `/api`
- **Data Format:** JSON (`Content-Type: application/json`)
- **Authentication:** Bearer JWT Token via HTTP Header:
  ```http
  Authorization: Bearer 8ec29a30f45cdb4cc964b05ab870e8fd5675eb5f05599f0833bcf6aef65b1fb8
  ```
- **Error Response Standard:**
  ```json
  {
    "status": "error",
    "message": "Error description message"
  }
  ```

---

## Table of Contents

1. [System & Health Checks](#1-system--health-checks)
2. [Authentication (`/api/auth`)](#2-authentication-apiauth)
3. [Years / Grade Levels (`/api/years`)](#3-years--grade-levels-apiyears)
4. [Courses (`/api/courses`)](#4-courses-apicourses)
5. [Lessons (`/api/lessons`)](#5-lessons-apilessons)
6. [Enrollments (`/api/enrollments`)](#6-enrollments-apienrollments)
7. [Individual Lesson Access (`/api/lesson-access`)](#7-individual-lesson-access-apilesson-access)
8. [Exams (`/api/exams`)](#8-exams-apiexams)
9. [Lesson Progress (`/api/progress`)](#9-lesson-progress-apiprogress)
10. [Course Requests (`/api/course-requests`)](#10-course-requests-apicourse-requests)
11. [User Profiles (`/api/profiles`)](#11-user-profiles-apiprofiles)
12. [Complaints & Feedback (`/api/complaints`)](#12-complaints--feedback-apicomplaints)
13. [Users / Admin CRUD (`/api/users`)](#13-users--admin-crud-apiusers)

---

## 1. System & Health Checks

### `GET /`
- **Access:** Public
- **Description:** Basic API info and sanity check.
- **Response `200 OK`:**
  ```json
  {
    "message": "Arabic Educational Platform API",
    "version": "1.0.0"
  }
  ```

### `GET /health`
- **Access:** Public
- **Description:** Verifies database connection pool and system health.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "db": {
      "connected": true,
      "database": "arabic_teacher_db",
      "timestamp": "2026-11-22T12:00:00.000Z"
    }
  }
  ```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Access:** Public
- **Body:**
  ```json
  {
    "full_name": "أحمد محمود",
    "phone": "01012345678",
    "password": "Password123!",
    "email": "ahmed@example.com",
    "governorate_name": "Cairo",
    "center_name": "Center Al-Noor",
    "parent_phone_number": "01098765432",
    "current_year_id": "c138b16c-3ef8-4aa9-952a-35a0fbead001"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "<JWT_TOKEN>",
    "user": {
      "id": "uuid",
      "full_name": "أحمد محمود",
      "phone": "01012345678",
      "email": "ahmed@example.com",
      "student_id": 10001,
      "current_year_id": "c138b16c-3ef8-4aa9-952a-35a0fbead001",
      "governorate_name": "Cairo",
      "center_name": "Center Al-Noor",
      "created_at": "2026-11-22T10:00:00.000Z"
    }
  }
  ```

### `POST /api/auth/login`
- **Access:** Public
- **Body:**
  ```json
  {
    "phone": "01012345678",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "<JWT_TOKEN>",
    "user": {
      "id": "uuid",
      "full_name": "أحمد محمود",
      "phone": "01012345678",
      "email": "ahmed@example.com"
    }
  }
  ```

### `GET /api/auth/me`
- **Access:** Private (`Bearer Token`)
- **Response `200 OK`:** Current authenticated profile data.

---

## 3. Years / Grade Levels (`/api/years`)

Educational school years (e.g., الصف الأول الثانوي).

| Method   | Endpoint         | Access        | Description                                           |
| -------- | ---------------- | ------------- | ----------------------------------------------------- |
| `GET`    | `/api/years`     | Public        | List all school years ordered by `order_index`        |
| `GET`    | `/api/years/:id` | Public        | Get details for specific year                         |
| `POST`   | `/api/years`     | Authenticated | Create a year (`title`, `description`, `order_index`) |
| `PATCH`  | `/api/years/:id` | Authenticated | Update year fields                                    |
| `DELETE` | `/api/years/:id` | Authenticated | Delete a year                                         |

---

## 4. Courses (`/api/courses`)

| Method   | Endpoint           | Access        | Query / Params / Body                                                 |
| -------- | ------------------ | ------------- | --------------------------------------------------------------------- |
| `GET`    | `/api/courses`     | Public        | Optional query: `?year_id=<uuid>` (returns published courses)         |
| `GET`    | `/api/courses/:id` | Public        | Single course details                                                 |
| `POST`   | `/api/courses`     | Authenticated | `{ year_id, title, description, thumbnail_url, price, is_published }` |
| `PATCH`  | `/api/courses/:id` | Authenticated | Partial update course                                                 |
| `DELETE` | `/api/courses/:id` | Authenticated | Delete course                                                         |

---

## 5. Lessons (`/api/lessons`)

| Method | Endpoint | Access | Query / Params / Body |
|---|---|---|---|
| `GET` | `/api/lessons` | Authenticated | Query required: `?course_id=<uuid>` |
| `GET` | `/api/lessons/:id` | Authenticated | Get single lesson details |
| `POST` | `/api/lessons` | Authenticated | `{ course_id, title, content, video_url, order_index, attachment_urls, is_published }` |
| `PATCH` | `/api/lessons/:id` | Authenticated | Update lesson fields |
| `DELETE` | `/api/lessons/:id` | Authenticated | Delete lesson |

---

## 6. Enrollments (`/api/enrollments`)

Full-course enrollments.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/enrollments/me` | Authenticated | List all enrolled courses for logged-in user |
| `GET` | `/api/enrollments` | Authenticated (Admin) | Filter enrollments by `?user_id=` or `?course_id=` |
| `POST` | `/api/enrollments` | Authenticated (Admin) | Enroll user: `{ user_id, course_id, expires_at }` |
| `DELETE` | `/api/enrollments/:id` | Authenticated (Admin) | Revoke/delete enrollment by ID |

---

## 7. Individual Lesson Access (`/api/lesson-access`)

Granular access to specific individual lessons (outside full-course enrollment).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/lesson-access/me` | Authenticated | Lessons unlocked for current user (`?course_id=` optional) |
| `POST` | `/api/lesson-access` | Authenticated (Admin) | Unlock single lesson: `{ user_id, lesson_id, course_id, notes, expires_at }` |
| `DELETE` | `/api/lesson-access/:id` | Authenticated (Admin) | Revoke lesson access |

---

## 8. Exams (`/api/exams`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/exams` | Authenticated | List exams (`?year_id=`, `?course_id=`) |
| `GET` | `/api/exams/:id` | Authenticated | Get single exam info |
| `POST` | `/api/exams` | Authenticated | Create exam: `{ course_id, year_id, title, exam_url }` |
| `PATCH` | `/api/exams/:id` | Authenticated | Update exam details |
| `DELETE` | `/api/exams/:id` | Authenticated | Delete exam |
| `POST` | `/api/exams/:id/submit` | Authenticated | Submit exam answers: `{ answers, score, max_score }` |
| `GET` | `/api/exams/:id/submissions` | Authenticated | Get user's submission history for this exam |

---

## 9. Lesson Progress (`/api/progress`)

Tracks completion status of lessons per student.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/progress/me` | Authenticated | List user completed lessons (`?course_id=` optional) |
| `POST` | `/api/progress` | Authenticated | Mark lesson as completed: `{ lesson_id }` |
| `DELETE` | `/api/progress/:lesson_id` | Authenticated | Unmark / reset lesson completion |

---

## 10. Course Requests (`/api/course-requests`)

Workflow for students requesting access to courses (e.g. via bank transfer/instapay verification).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/course-requests` | Authenticated (Admin) | List all requests (`?status=pending\|approved\|rejected`) |
| `GET` | `/api/course-requests/me` | Authenticated | List requests submitted by logged-in student |
| `POST` | `/api/course-requests` | Authenticated | Submit request: `{ course_id, notes }` |
| `PATCH` | `/api/course-requests/:id` | Authenticated (Admin) | Update status: `{ status: "approved"\|"rejected" }` (auto-enrolls if approved) |

---

## 11. User Profiles (`/api/profiles`)

| Method  | Endpoint            | Access                | Description                                            |
| ------- | ------------------- | --------------------- | ------------------------------------------------------ |
| `GET`   | `/api/profiles`     | Authenticated (Admin) | List profiles (`?year_id=`, `?search=`)                |
| `GET`   | `/api/profiles/:id` | Authenticated         | Get specific profile details                           |
| `PATCH` | `/api/profiles/:id` | Authenticated         | Update profile details (students can edit own profile) |

---

## 12. Complaints & Feedback (`/api/complaints`)

| Method | Endpoint          | Access                | Description                                                              |
| ------ | ----------------- | --------------------- | ------------------------------------------------------------------------ |
| `POST` | `/api/complaints` | Public                | Submit complaint: `{ complaint_text, phone_number, user_name, user_id }` |
| `GET`  | `/api/complaints` | Authenticated (Admin) | List all complaints chronologically                                      |

---

## 13. Users / Admin CRUD (`/api/users`)

Service/repository based user administration.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Public / Admin | List users (`?limit=20&offset=0`) |
| `POST` | `/api/users` | Validated | Create user: `{ full_name, phone, password, ... }` |
| `GET` | `/api/users/:id` | Validated UUID | Retrieve single user |
| `DELETE` | `/api/users/:id` | Validated UUID | Delete user |

---

## Quick Testing Examples (cURL)

### Register User
```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","phone":"01000000001","password":"Password123!"}'
```

### Login & Store Token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"01000000001","password":"Password123!"}' | jq -r '.token')
```

### Access Protected Endpoint
```bash
curl -s -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
