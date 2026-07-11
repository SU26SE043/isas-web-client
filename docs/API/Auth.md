# 🔐 API Documentation - Authentication

Tài liệu này tổng hợp toàn bộ các API liên quan đến luồng xác thực (Authentication) và quản lý tài khoản cơ bản.

**Base URL:** `/api/v1/auth`

---

## 📋 Mục lục
1. [Đăng ký (Register)](#1-đăng-ký-register)
<!-- 2. [Đăng ký Tổ chức (Register Org)](#2-đăng-ký-tổ-chức-register-org) -->
3. [Đăng nhập (Login)](#3-đăng-nhập-login)
4. [Đăng nhập bằng Google (Google OAuth)](#4-đăng-nhập-bằng-google)
5. [Làm mới Token (Refresh Token)](#5-làm-mới-token-refresh)
6. [Đăng xuất (Logout)](#6-đăng-xuất-logout)
7. [Thông tin cá nhân (Me)](#7-thông-tin-cá-nhân-me)
8. [Quên mật khẩu (Forgot Password)](#8-quên-mật-khẩu-forgot-password)

---

# 1. Register

Create a new Candidate account.

## Endpoint

```http
POST /api/v1/auth/register
```

## Authentication

Not Required

## Request

```ts
interface RegisterRequest {
    email: string;
    fullName: string;
    password: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| email | Required, valid email |
| fullName | Required |
| password | Required, minimum 6 characters |

## Success Response

```ts
type RegisterResponse = ApiResponse<{
    id: string;
    email: string;
}>;
```

## Error Responses

| Status | Description |
|---------|-------------|
|400|Validation Error|
|409|Email already exists|

## Frontend Behavior

- Show success notification.
- Redirect user to Login screen.
---
<!-- 
## 2. Đăng ký Tổ chức (Register Org)
Đăng ký tài khoản dành cho khách hàng doanh nghiệp/tổ chức.

- **Endpoint:** `/register-org`
- **Method:** `POST`
- **Auth Required:** `No`

*(Bổ sung Request Body gồm các field như `orgName`, `taxCode`, `contactEmail`...)* -->

---

# 2. Login

Authenticate user using email and password.

## Endpoint

```http
POST /api/v1/auth/login
```

## Authentication

Not Required

## Request

```ts
interface LoginRequest {
    email: string;
    password: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| email | Required, valid email |
| password | Required |

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type LoginResponse = ApiResponse<LoginData>; // TBD
```

## Error Responses

| Status | Description |
|---------|-------------|
|400|Validation Error|
|401|Invalid email or password|

## Frontend Behavior

- Save Access Token (if returned)
- Save Refresh Token (if returned)
- Update Authentication Store
- Redirect user based on role

---

# 3. Google Login

Redirect user to Google OAuth authentication.

## Endpoint

```http
GET /api/v1/auth/login-google
```

## Authentication

Not Required

## Query Parameters

```ts
interface GoogleLoginQuery {
    returnUrl?: string;
}
```

## Success Response (200)

Redirect user to Google Authentication page.

## Frontend Behavior

- Redirect browser to this endpoint.
- Optional `returnUrl` is used after authentication completes.

---

# 4. Google Login Callback

Handle Google OAuth callback.

## Endpoint

```http
GET /api/v1/auth/login-google-callback
```

## Authentication

Not Required

## Query Parameters

```ts
interface GoogleCallbackQuery {
    returnUrl?: string;
    remoteError?: string;
}
```

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type GoogleCallbackResponse = ApiResponse<LoginData>; // TBD
```

## Frontend Behavior

- Backend validates Google authentication.
- Backend creates/signs user session.
- Frontend receives authentication result.
- Redirect user to `returnUrl` if provided.
- Display error message if `remoteError` exists.

---
# 5. Refresh Token

Generate a new Access Token using a valid Refresh Token.

## Endpoint

```http
POST /api/v1/auth/refresh
```

## Authentication

Not Required

## Request

```ts
interface RefreshTokenRequest {
    refreshToken: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| refreshToken | Required |

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type RefreshTokenResponse = ApiResponse<unknown>; // TODO: Replace with actual response schema
```

## Frontend Behavior

- Called automatically when Access Token expires.
- Retry the original request after refreshing the token.
- Redirect to Login if refresh fails.
---

# 6. Logout

Terminate the current authenticated session.

## Endpoint

```http
POST /api/v1/auth/logout
```

## Authentication

Required (Bearer Token)

## Request

```ts
interface LogoutRequest {
    refreshToken: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| refreshToken | Required |

## Success Response (200)

```ts
type LogoutResponse = ApiResponse<unknown>;
```

## Frontend Behavior

- Remove Access Token.
- Remove Refresh Token.
- Clear authentication state.
- Clear React Query cache.
- Redirect to Login page.

---

# 7. Current User

Retrieve information about the currently authenticated user.

## Endpoint

```http
GET /api/v1/auth/me
```

## Authentication

Required (Bearer Token)

## Request

No request body.

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type CurrentUserResponse = ApiResponse<User>; // TODO: Replace with actual schema
```

## Error Responses

| Status | Description |
|---------|-------------|
|401|Unauthorized|
|403|Forbidden|

## Frontend Behavior

- Called when the application starts.
- Populate Auth Store.
- Populate User Store.
- Refresh current user information after profile updates.

---

# 8. Update Current User

Update the profile information of the currently authenticated user.

## Endpoint

```http
PUT /api/v1/auth/me
```

## Authentication

✅ Required (Bearer Token)

## Request

```ts
interface UpdateProfileRequest {
    fullName?: string | null;
    location?: string | null;
    title?: string | null;
}
```

## Validation Rules

| Field | Type | Required | Rule |
|--------|------|----------|------|
| fullName | string \| null | ❌ | Optional |
| location | string \| null | ❌ | Optional |
| title | string \| null | ❌ | Optional |

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type UpdateProfileResponse = ApiResponse<User>;
```

## Error Responses

| Status | Description |
|---------|-------------|
|400|Validation Error|
|401|Unauthorized|
|403|Forbidden|

## Business Rules

- Only the authenticated user can update their own profile.
- Only the provided fields are updated.
- Fields omitted from the request remain unchanged.
- `null` values are accepted if supported by the backend.

## Frontend Behavior

| Action | Description |
|---------|-------------|
| Loading | Disable Save button while request is processing |
| Success | Show "Profile updated successfully" notification |
| Store | Update Auth Store / User Store |
| Cache | Invalidate Current User query |
| Error | Display validation or server error message |
---
# 9. Forgot Password

Request an OTP to reset the user's password.

## Endpoint

```http
POST /api/v1/auth/forgot-password
```

## Authentication

Not Required

## Request

```ts
interface ForgotPasswordRequest {
    email: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| email | Required, valid email |

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type ForgotPasswordResponse = ApiResponse<unknown>;
```

## Error Responses

| Status | Description |
|---------|-------------|
|400|Validation Error|
|404|Email not found|

## Frontend Behavior

- Show success notification.
- Navigate user to **Verify OTP** screen.
---
# 10. Verify OTP

Verify the OTP sent to the user's email.

## Endpoint

```http
POST /api/v1/auth/verify-otp
```

## Authentication

Not Required

## Request

```ts
interface VerifyOtpRequest {
    email: string;
    otp: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| email | Required |
| otp | Required |

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type VerifyOtpResponse = ApiResponse<unknown>;
```

## Error Responses

| Status | Description |
|---------|-------------|
|400|Invalid OTP|
|410|OTP Expired|

## Frontend Behavior

- If OTP is valid, navigate to **Reset Password** screen.
- If OTP is invalid or expired, display an error message.
---
# 11. Reset Password

Reset the user's password using a verified OTP.

## Endpoint

```http
POST /api/v1/auth/reset-password
```

## Authentication

Not Required

## Request

```ts
interface ResetPasswordRequest {
    email: string;
    newPassword: string;
}
```

## Validation Rules

| Field | Rule |
|--------|------|
| email | Required |
| newPassword | Required |

## Success Response (200)

> **Response schema is not defined in Swagger.**

```ts
type ResetPasswordResponse = ApiResponse<unknown>;
```

## Error Responses

| Status | Description |
|---------|-------------|
|400|Validation Error|
|401|Invalid or expired OTP|

## Frontend Behavior

- Display success notification.
- Redirect user to Login screen.
---