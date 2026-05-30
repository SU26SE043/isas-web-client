# API Plan

## Mục tiêu

Backend hiện là monolith, nên frontend chỉ dùng một API base URL chung cho toàn project. Feature vẫn tự sở hữu endpoint, type và service của mình để khi đổi path hoặc payload chỉ sửa trong feature đó.

## Kiến trúc hiện tại

Shared API chỉ giữ logic hạ tầng dùng chung:

- `src/shared/api/apiClient.ts`: Axios client singleton cho toàn backend.
- `src/shared/api/createApiClient.ts`: factory tạo Axios client với `VITE_API_BASE_URL`.
- `src/shared/api/authTokenStorage.ts`: lưu/xóa access token và refresh token.
- `src/shared/api/apiError.ts`: chuẩn hóa message lỗi từ API.
- `src/shared/api/index.ts`: public exports.

Feature tự sở hữu phần API của feature:

- `src/features/auth/services/authEndpoints.ts`: tất cả path API của auth.
- `src/features/auth/services/authService.ts`: hàm nghiệp vụ như `register`.
- `src/features/auth/types/auth.types.ts`: request/response type của auth.

## Quy ước khi thêm API mới

1. Không tạo Axios client riêng theo từng service.
2. Component không import Axios trực tiếp.
3. Component chỉ gọi service của feature:

```ts
await authService.register(payload);
```

4. Endpoint của feature nào thì đặt trong feature đó:

```text
src/features/<feature>/services/<feature>Endpoints.ts
```

5. Request/response type đặt trong:

```text
src/features/<feature>/types/*.types.ts
```

6. Nếu backend đổi host/base URL, sửa `.env`:

```text
VITE_API_BASE_URL=https://your-api-host.com
```

7. Nếu endpoint đổi path, sửa file endpoint của feature.

## Environment variables

App dùng một biến duy nhất:

```text
VITE_API_BASE_URL=https://engine-spectrum-differential-book.trycloudflare.com
```

Nếu không có env, app fallback về URL mặc định trong:

```text
src/shared/api/createApiClient.ts
```

File mẫu env:

```text
.env.example
```

## Register API hiện tại

Endpoint:

```text
POST /api/auth/register
```

Request:

```ts
{
  email: string;
  fullName: string;
  password: string;
}
```

Response:

```ts
{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
```

Flow frontend:

1. `SignUpForm` validate required fields và password tối thiểu 6 ký tự.
2. `SignUpForm` gọi `authService.register(payload)`.
3. `authService.register` gọi `apiClient.post(authEndpoints.register, payload)`.
4. Token trả về được lưu bằng `authTokenStorage.setTokens`.

## Login API hiện tại

Endpoint:

```text
POST /api/auth/login
```

Request:

```ts
{
  email: string;
  password: string;
}
```

Response:

```ts
{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
```

Flow frontend:

1. `SignInForm` validate required fields.
2. `SignInForm` gọi `authService.login(payload)`.
3. `authService.login` gọi `apiClient.post(authEndpoints.login, payload)`.
4. Token trả về được lưu bằng `authTokenStorage.setTokens`.

## Checklist review

- Không hard-code full URL trong component.
- Không hard-code endpoint path trong component.
- Component không import `axios`.
- Feature API path nằm trong `services/*Endpoints.ts`.
- Type request/response rõ ràng.
- Chỉ có một API base URL chung.
- Build pass bằng `npm run build`.
