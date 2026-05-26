# GDV Society - API Documentation

## Authentication System

This project implements a comprehensive authentication system with NextAuth.js, Neon PostgreSQL database, and admin-controlled password reset functionality.

## Setup Instructions

### 1. Database Setup

1. Create a Neon PostgreSQL database at https://console.neon.tech
2. Copy the connection string
3. Update `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require"
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Neon database connection string
- `DIRECT_URL` - Neon direct connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your application URL
- `SMTP_*` - Email configuration for notifications
- `ADMIN_EMAIL` - Admin email for password reset notifications

### 3. Database Migration

Run Prisma migrations to create database tables:

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Create Admin User

You can create an admin user by:
1. Registering through the signup API
2. Manually updating the user role in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## API Endpoints

### Authentication

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "plotNumber": 1
}
```

#### Sign In (NextAuth)
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}
```

### User Management

#### Get Current User
```
GET /api/users/me
Authorization: Required
```

#### List Users (Admin Only)
```
GET /api/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Admin Required
```

#### Get User by ID
```
GET /api/users/{id}
Authorization: Owner or Admin Required
```

#### Update User
```
PUT /api/users/{id}
Authorization: Owner or Admin Required
Content-Type: application/json

{
  "name": "Updated Name",
  "plotNumber": 2
}
```

#### Delete User (Admin Only)
```
DELETE /api/users/{id}
Authorization: Admin Required
```

### Password Reset Management (Admin)

#### List Reset Requests
```
GET /api/admin/reset-requests?status=PENDING
Authorization: Admin Required
```

#### Approve Reset Request
```
POST /api/admin/reset-requests/{id}/approve
Authorization: Admin Required
```

#### Deny Reset Request
```
POST /api/admin/reset-requests/{id}/deny
Authorization: Admin Required
```

## Password Reset Flow

### User Perspective
1. User requests password reset via `/api/auth/forgot-password`
2. System creates a pending reset request
3. Admin receives email notification
4. User waits for admin approval
5. Upon approval, user receives email with reset link
6. User clicks link and sets new password
7. User is automatically logged in

### Admin Perspective
1. Receives email notification of reset request
2. Reviews request in admin dashboard
3. Approves or denies request
4. System sends appropriate email to user

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Sessions**: Secure, stateless authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schemas for all API inputs
- **CSRF Protection**: Built into NextAuth.js
- **Secure Tokens**: Cryptographically secure reset tokens
- **Token Expiration**: Time-limited reset tokens (1 hour)
- **Email Enumeration Prevention**: Consistent responses

## Type Safety

All API endpoints use shared TypeScript types:
- `User` - User entity
- `PasswordResetRequest` - Password reset request entity
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated list response

## Error Handling

Standardized error responses:
- `400` - Validation errors
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - Resource not found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal server error

## Testing

Test the authentication system:

```bash
# Run development server
npm run dev

# Test endpoints with curl or Postman
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

## Database Schema

Key models:
- `User` - User accounts with authentication
- `Session` - NextAuth sessions
- `PasswordResetRequest` - Password reset workflow
- `ResidentRequest` - Resident requests
- `FamilyMember` - Family member records
- `LedgerEntry` - Financial transactions
- `SocietySettings` - Society configuration

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Prisma Studio (database GUI)
npx prisma studio

# View database schema
npx prisma db pull
```

## Production Deployment

1. Set all environment variables in production
2. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Build the application:
   ```bash
   npm run build
   ```
4. Start production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure IP is whitelisted (if applicable)

### Email Not Sending
- Verify SMTP credentials
- Check SMTP host and port
- Enable "Less secure app access" for Gmail
- Use App Passwords for Gmail

### Authentication Errors
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again