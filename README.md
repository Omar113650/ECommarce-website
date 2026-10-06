# E-Learning Platform

**Complete Online Learning Platform with Courses, Enrollments, Payments, AI Integration, and Multi-Role Management**

A complete E-Learning backend platform built with Node.js, Express.js, TypeScript, and MongoDB.

The platform provides a complete infrastructure for managing users, courses, lessons, enrollments, evaluations, payments, comments, categories, and administrative operations.

It also integrates external services such as AI capabilities, online payments, cloud-based file storage, and email services.

---

## Table of Contents

1. Project Overview
2. Core Features
3. Tech Stack
4. System Architecture
5. Authentication and Authorization
6. Course Management
7. Lesson Management
8. Categories
9. Enrollment System
10. Evaluation System
11. Comments
12. Payments
13. AI Integration
14. File Uploads
15. Email Services
16. Admin Dashboard
17. Validation and Error Handling
18. Project Structure
19. Environment Configuration
20. Installation and Setup
21. Engineering Highlights
22. Future Enhancements
23. Author

---

# Project Overview

The E-Learning Platform is a backend system designed to manage the complete online learning lifecycle.

The platform allows users to discover courses, access lessons, enroll in courses, submit evaluations, interact through comments, and complete payments.

Administrators can manage the platform through dedicated administrative functionality and dashboard endpoints.

The backend also integrates AI functionality, cloud-based file management, payment processing, and email services.

A simplified platform flow:

```text
User
 |
 v
Authentication
 |
 v
Browse Courses
 |
 v
View Course
 |
 v
Enroll
 |
 v
Payment
 |
 v
Access Lessons
 |
 v
Evaluate Course
 |
 v
Interact through Comments
```

---

# Core Features

The platform includes:

- User Authentication
- Email Verification
- Password Reset
- User Management
- Course Management
- Lesson Management
- Category Management
- Course Enrollment
- Course Evaluations
- Course Comments
- Payment Processing
- Payment Session Creation
- AI Integration
- File Upload Management
- Cloudinary Integration
- Email Services
- Admin Dashboard
- Request Validation
- Centralized Error Handling
- Application Logging

---

# Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT-based Authentication |
| File Upload | Multer |
| Cloud Storage | Cloudinary |
| Payments | Paymob |
| AI Integration | Google Gemini |
| Email | Email Service |
| Validation | Custom Validation Middleware |
| Logging | Application Logger |
| Architecture | Controller / Model / Route / Service Architecture |

---

# System Architecture

The backend follows a modular Express architecture.

```text
                     Client Application
                            |
                            v
                       Express API
                            |
              ---------------------------
              |            |            |
              v            v            v
        Middleware     Validation    Authentication
              |
              v
            Routes
              |
              v
         Controllers
              |
              v
        Business Logic
              |
       -------------------
       |        |        |
       v        v        v
    MongoDB   Services   External APIs
       |        |            |
       v        |      -----------------
    Mongoose    |      |       |       |
                v      v       v       v
             Email   Paymob Gemini Cloudinary
```

This architecture separates HTTP routing, request validation, business logic, database models, and external service integrations.

---

# Authentication and Authorization

Authentication logic is handled through:

```text
AuthController.ts
authMiddleware.ts
Auth.routes.ts
```

The authentication layer is responsible for protecting private resources and identifying authenticated users.

The project also contains dedicated models for account verification and password recovery:

```text
VerificationCode.ts
PasswordResetToken.ts
```

A typical authentication workflow:

```text
Register
   |
   v
Create User
   |
   v
Verification Code
   |
   v
Verify Account
   |
   v
Login
   |
   v
Generate Authentication Token
   |
   v
Access Protected Resources
```

---

# User Management

User operations are handled through:

```text
UserController.ts
User.ts
user.routes.ts
```

The user module is responsible for user-related operations and account management.

User information also connects with other platform resources such as:

- Enrollments
- Evaluations
- Comments
- Payments
- Courses

---

# Course Management

Courses represent the main educational resource in the platform.

Course functionality is implemented through:

```text
CourseController.ts
Course.ts
course.route.ts
```

The course system can support operations such as:

- Create courses
- Retrieve courses
- Update courses
- Delete courses
- Organize courses by category
- Connect lessons to courses
- Manage course enrollment
- Manage course evaluations
- Manage course comments

---

# Lesson Management

Lessons are managed separately from courses.

The project contains:

```text
LessonController.ts
Lesson.ts
Lesson.routes.ts
```

A course can contain multiple lessons.

Conceptually:

```text
Course
  |
  +---- Lesson 1
  |
  +---- Lesson 2
  |
  +---- Lesson 3
  |
  +---- Lesson N
```

Separating lessons from courses keeps the content architecture flexible and easier to maintain.

---

# Category Management

Courses can be organized into categories.

Category functionality is implemented through:

```text
CategoryController.ts
Category.ts
category.routes.ts
```

Conceptually:

```text
Category
   |
   +---- Course
   |
   +---- Course
   |
   +---- Course
```

Categories make course discovery and organization easier.

---

# Enrollment System

The platform contains a dedicated enrollment module.

Implementation:

```text
EnrollmentController.ts
Enrollment.ts
Enrollment.routes.ts
```

The enrollment system connects users with courses.

A typical workflow:

```text
User
 |
 v
Select Course
 |
 v
Validate Course
 |
 v
Check Existing Enrollment
 |
 v
Process Required Payment
 |
 v
Create Enrollment
 |
 v
Grant Course Access
```

Enrollment is an important business entity because it represents the relationship between a learner and a course.

---

# Evaluation System

Students can evaluate courses through a dedicated evaluation system.

Implementation:

```text
EvaluationController.ts
Evaluation.ts
EvaluationRoutes.ts
```

Evaluations can be associated with:

```text
User
  |
  v
Course
  |
  v
Evaluation
```

This allows the platform to collect feedback about educational content.

---

# Comment System

The platform includes course-related commenting functionality.

Implementation:

```text
CommentController.ts
Comment.ts
commentRoutes.ts
```

Comments allow users to interact with course content and provide feedback or discussion.

---

# Payments

The platform includes payment functionality.

Payment-related files include:

```text
PaymentController.ts
Payment.model.ts
PaymentRoutes.ts
createPaymentSessionController.ts
paymobService.ts
```

The architecture separates payment business logic from the external payment provider integration.

A typical payment flow:

```text
User
 |
 v
Select Course
 |
 v
Create Payment Session
 |
 v
Paymob Service
 |
 v
Payment Gateway
 |
 v
Payment Result
 |
 v
Store Payment
 |
 v
Complete Enrollment
```

This separation makes the payment integration easier to maintain.

---

# Paymob Integration

The project contains:

```text
paymobService.ts
```

This service acts as an integration layer between the application and Paymob.

Conceptually:

```text
Application
    |
    v
Payment Controller
    |
    v
Paymob Service
    |
    v
Paymob API
```

Keeping payment provider logic inside a dedicated service reduces coupling between controllers and external APIs.

---

# AI Integration

The project contains dedicated AI functionality.

AI-related files include:

```text
aiController.ts
ai.ts
aiHelper.ts
gemini.ts
```

The architecture separates AI routing, controller logic, helper functionality, and the AI provider integration.

Conceptually:

```text
Client
  |
  v
AI Route
  |
  v
AI Controller
  |
  v
AI Helper
  |
  v
Gemini Integration
  |
  v
AI Response
```

This makes AI functionality independent from the core educational modules.

---

# Gemini Integration

The project includes:

```text
gemini.ts
```

This indicates a dedicated integration layer for Google Gemini.

The AI functionality can be used to extend the learning experience without coupling the entire application directly to the AI provider.

---

# File Upload Management

The platform contains dedicated file upload middleware:

```text
multer.ts
```

Multer handles multipart/form-data uploads before files are processed or uploaded to external storage.

A typical flow:

```text
Client
  |
  v
Upload File
  |
  v
Multer Middleware
  |
  v
Validate File
  |
  v
Cloudinary
  |
  v
Store File Reference
```

---

# Cloudinary Integration

Cloud-based file storage is handled through:

```text
Cloudinary.ts
```

Cloudinary can be used for storing resources such as:

- Course images
- User images
- Educational assets
- Uploaded media

This prevents the backend server from depending entirely on local file storage.

---

# Email Services

The project contains:

```text
emailServices.ts
```

The email layer can support workflows such as:

- Email verification
- Password reset
- Account notifications
- Enrollment-related emails
- Payment-related notifications

Conceptually:

```text
Application Event
       |
       v
Email Service
       |
       v
Email Provider
       |
       v
User Inbox
```

---

# Admin Dashboard

Administrative dashboard functionality is handled through:

```text
adminDashboardController.ts
AdminRoutes.ts
```

The Admin Dashboard can provide centralized access to platform management and statistics.

Administrative operations may include:

- User management
- Course management
- Enrollment monitoring
- Payment monitoring
- Platform statistics
- Content management

---

# Validation

The project includes dedicated validation functionality.

Relevant files include:

```text
validate.ts
ValidateID.ts
validation/
```

Validation middleware ensures that invalid requests are rejected before reaching core business logic.

A typical request flow:

```text
Request
   |
   v
Validate ID
   |
   v
Validate Body
   |
   v
Authentication
   |
   v
Controller
```

This keeps controllers focused on application logic rather than repeated validation code.

---

# Error Handling

The project includes centralized error handling through:

```text
Error.ts
```

Centralized error handling helps provide consistent API responses.

Common HTTP errors may include:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# Logging

The project contains:

```text
logger.ts
```

Centralized logging can be used to track:

- Application activity
- API errors
- Authentication issues
- Payment operations
- External service failures
- Unexpected application behavior

Logging is important for debugging and production monitoring.

---

# Database Models

The project contains the following main models:

```text
Category.ts
Comment.ts
Course.ts
Enrollment.ts
Evaluation.ts
Lesson.ts
PasswordResetToken.ts
Payment.model.ts
User.ts
VerificationCode.ts
```

The relationships between these models are configured through:

```text
associations.ts
```

A simplified domain model:

```text
User
 |
 +---- Enrollments
 |
 +---- Evaluations
 |
 +---- Comments
 |
 +---- Payments


Category
 |
 +---- Courses
         |
         +---- Lessons
         |
         +---- Enrollments
         |
         +---- Evaluations
         |
         +---- Comments
```

---

# Project Structure

The actual project structure follows:

```text
src/
|
|-- config/
|   `-- connectDB.ts
|
|-- controllers/
|   |-- AuthController.ts
|   |-- CategoryController.ts
|   |-- CommentController.ts
|   |-- CourseController.ts
|   |-- EnrollmentController.ts
|   |-- EvaluationController.ts
|   |-- LessonController.ts
|   |-- PaymentController.ts
|   |-- UserController.ts
|   |-- adminDashboardController.ts
|   |-- aiController.ts
|   `-- createPaymentSessionController.ts
|
|-- middlewares/
|   |-- Error.ts
|   |-- ValidateID.ts
|   |-- authMiddleware.ts
|   |-- multer.ts
|   `-- validate.ts
|
|-- models/
|   |-- Category.ts
|   |-- Comment.ts
|   |-- Course.ts
|   |-- Enrollment.ts
|   |-- Evaluation.ts
|   |-- Lesson.ts
|   |-- PasswordResetToken.ts
|   |-- Payment.model.ts
|   |-- User.ts
|   |-- VerificationCode.ts
|   `-- associations.ts
|
|-- routes/
|   |-- AdminRoutes.ts
|   |-- Auth.routes.ts
|   |-- Enrollment.routes.ts
|   |-- EvaluationRoutes.ts
|   |-- Lesson.routes.ts
|   |-- PaymentRoutes.ts
|   |-- ai.ts
|   |-- category.routes.ts
|   |-- commentRoutes.ts
|   |-- course.route.ts
|   `-- user.routes.ts
|
|-- services/
|   |-- aiHelper.ts
|   |-- gemini.ts
|   `-- paymobService.ts
|
|-- utils/
|   |-- cache/
|   |-- Cloudinary.ts
|   |-- emailServices.ts
|   `-- logger.ts
|
|-- validation/
|
|-- appStatus.json
|-- client.ts
`-- index.ts
```

The architecture follows a clear separation between:

```text
Routes
   |
   v
Middleware
   |
   v
Controllers
   |
   v
Services
   |
   v
Models / External Services
```

---

# Environment Configuration

The exact environment variables depend on the implementation, but the project may require configuration for:

```env
PORT=3000

DATABASE_URL=your_database_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

PAYMOB_API_KEY=your_paymob_api_key

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Never commit production credentials or API keys to Git.

---

# Installation and Setup

## Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create the required `.env` file and configure the database and external services.

## Start Development Server

```bash
npm run dev
```

The exact scripts should follow the scripts configured inside `package.json`.

---

# Engineering Highlights

The project demonstrates several important backend engineering concepts.

## Modular Express Architecture

The application separates routes, controllers, middleware, models, services, utilities, and validation.

## Authentication Workflows

Authentication includes supporting infrastructure for verification codes and password reset tokens.

## Payment Integration

Paymob is isolated behind a dedicated service layer.

## AI Integration

Google Gemini integration is separated into AI routes, controllers, helpers, and provider logic.

## File Management

Multer handles incoming files while Cloudinary provides external cloud storage.

## Validation

Dedicated validation middleware keeps request validation separate from business logic.

## Centralized Error Handling

Application errors are handled through shared middleware rather than duplicated error logic.

## Database Relationships

The application contains explicit model associations between the main educational entities.

## External Service Integration

The backend integrates multiple external systems while keeping their logic separated from core controllers.

---

# Future Enhancements

Possible future improvements include:

- Redis caching
- Background job processing
- Docker containerization
- CI/CD pipelines
- Automated testing
- Course recommendations
- Advanced AI learning assistant
- Online quizzes
- Certificates
- Progress tracking
- Course completion tracking
- Advanced analytics
- Structured monitoring
- Rate limiting
- API documentation
- Search optimization
- Horizontal scaling

---

# Use Cases

## Student

A student can:

- Register an account
- Verify their account
- Login
- Browse courses
- View lessons
- Enroll in courses
- Complete payments
- Submit evaluations
- Write comments
- Interact with AI-powered features

## Administrator

An administrator can:

- Manage users
- Manage courses
- Manage categories
- Monitor enrollments
- Monitor payments
- Access dashboard functionality
- Manage platform content

---

# Final Note

The E-Learning Platform demonstrates a complete backend architecture for an online education system using Node.js, Express.js, TypeScript, and a model-based database architecture.

The project goes beyond basic CRUD functionality by integrating authentication, account verification, password recovery, course enrollment, payments, AI capabilities, file uploads, cloud storage, email services, evaluations, comments, validation, logging, and administrative functionality.

The separation between controllers, routes, models, middleware, services, and utilities provides a maintainable foundation that can be extended as the platform grows.

---

# Author

**Omar Elhelaly**

Backend Developer specializing in:

- Node.js
- Express.js
- TypeScript
- RESTful APIs
- Database Design
- Authentication and Authorization
- Payment Integration
- AI Integration
- Cloudinary
- File Upload Systems
- Backend Architecture
