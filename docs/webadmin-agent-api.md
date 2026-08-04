# TimesGreen WebAdmin API for Agent Integration

## 1) Required runtime values

```env
WEBADMIN_BASE_URL=https://notes-solomon-stress-stunning.trycloudflare.com
```

Authentication is currently cookie-based. The login API sets an HTTP-only cookie named `admin_token`.

```http
Cookie: admin_token=<JWT_FROM_SET_COOKIE>
```

Important: the token expires after 7 days. The agent should refresh it by calling `POST /api/admin/login` again.

## 2) Technical account for AI

Do not use a personal admin account. Create a dedicated account, for example:

```json
{
  "email": "ai-agent@timesgreen.net",
  "fullName": "TimesGreen AI Agent",
  "role": "editor",
  "status": "active"
}
```

Creation options:

### Option A — create via Admin UI
Use the admin account management screen and create the account above.

### Option B — create via API
Requires an existing logged-in admin cookie with role `admin`.

```bash
curl -i -b admin.cookies \
  -X POST "$WEBADMIN_BASE_URL/api/admin/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"ai-agent@timesgreen.net","password":"CHANGE_ME_STRONG_PASSWORD","fullName":"TimesGreen AI Agent","role":"editor"}'
```

Then login as the AI account:

```bash
curl -i -c ai-agent.cookies \
  -X POST "$WEBADMIN_BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ai-agent@timesgreen.net","password":"CHANGE_ME_STRONG_PASSWORD"}'
```

The response body does not include the token. Read it from the `Set-Cookie` header or from `ai-agent.cookies`.

Example success response:

```json
{
  "message": "Đăng nhập hệ thống thành công.",
  "admin": {
    "id": 2,
    "email": "ai-agent@timesgreen.net",
    "fullName": "TimesGreen AI Agent",
    "role": "editor"
  }
}
```

Revocation: deactivate or delete this account. If using the current implementation, many endpoints only verify the JWT cookie; safest revocation is also rotating `JWT_SECRET` on the server and restarting the app.

Security note: set a real `JWT_SECRET` environment variable in production. The source has a dev fallback secret and should not be relied on for a public admin system.

## 3) Cloudflare / trycloudflare

Public URL provided:

```text
https://notes-solomon-stress-stunning.trycloudflare.com
```

I could not verify Cloudflare Access/WAF from this workstation because TLS/Schannel failed against the trycloudflare host. To check from your machine/server:

```bash
curl -i "$WEBADMIN_BASE_URL/api/admin/me"
```

Expected if no Cloudflare Access is blocking and the request reaches Next.js:

```json
{
  "isAuthenticated": false,
  "error": "Phiên làm việc chưa được thiết lập."
}
```

with HTTP `401`.

If Cloudflare Access is enabled, the response usually redirects to Cloudflare Access or returns an HTML Access challenge. In that case, create a Cloudflare Access Service Token and send:

```http
CF-Access-Client-Id: <client_id>
CF-Access-Client-Secret: <client_secret>
```

If WAF/rate limits are enabled, whitelist the agent server IP or create a WAF skip rule for the admin API paths the agent needs.

## 4) Authentication endpoints

### POST /api/admin/login

Body:

```json
{
  "email": "ai-agent@timesgreen.net",
  "password": "CHANGE_ME_STRONG_PASSWORD"
}
```

Also accepts `username` instead of `email`.

Success response `200`:

```json
{
  "message": "Đăng nhập hệ thống thành công.",
  "admin": {
    "id": 2,
    "email": "ai-agent@timesgreen.net",
    "fullName": "TimesGreen AI Agent",
    "role": "editor"
  }
}
```

Headers: `Set-Cookie: admin_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`

### GET /api/admin/me

Cookie required.

Success response `200`:

```json
{
  "isAuthenticated": true,
  "admin": {
    "id": 2,
    "email": "ai-agent@timesgreen.net",
    "fullName": "TimesGreen AI Agent",
    "role": "editor"
  }
}
```

Unauthorized response `401`:

```json
{
  "isAuthenticated": false,
  "error": "Phiên làm việc chưa được thiết lập."
}
```

### POST /api/admin/logout

Clears `admin_token`.

Success response:

```json
{
  "message": "Đăng xuất thành công."
}
```

## 5) Core admin endpoints

All protected endpoints require:

```http
Cookie: admin_token=<JWT>
Content-Type: application/json
```

### System settings

#### GET /api/admin/settings
Requires the root `admin` account in current code.

Response:

```json
{
  "success": true,
  "settings": {
    "site_status": "active",
    "page_home_status": "active",
    "page_tours_status": "active",
    "page_visa_status": "active",
    "page_news_status": "active",
    "page_contact_status": "active",
    "page_local_specialties_status": "active"
  }
}
```

#### POST /api/admin/settings
Requires the root `admin` account in current code.

Body:

```json
{
  "settings": {
    "page_contact_status": "inactive"
  }
}
```

Allowed keys: `site_status`, `page_home_status`, `page_tours_status`, `page_visa_status`, `page_news_status`, `page_contact_status`, `page_local_specialties_status`.

Allowed values: `active` / `inactive`; `site_status` also supports `suspended`.

Response:

```json
{
  "success": true,
  "message": "Lưu cấu hình hệ thống thành công."
}
```

### Header & footer navigation

#### GET /api/admin/navigation

Response:

```json
{
  "success": true,
  "config": {
    "header": {
      "logoUrl": "/uploads/logos/logo-1784804267099-cda8540c.png",
      "logoAlt": "TimesGreen",
      "companyName": "TimesGreen",
      "menus": []
    },
    "footer": {
      "brandName": "TimesGreen",
      "description": "...",
      "menus": []
    }
  }
}
```

#### PUT /api/admin/navigation/header

Body example:

```json
{
  "logoUrl": "https://res.cloudinary.com/.../logo.png",
  "logoAlt": "TimesGreen",
  "companyName": "TimesGreen"
}
```

Response:

```json
{
  "success": true,
  "config": {}
}
```

#### PUT /api/admin/navigation/footer

Body example:

```json
{
  "brandName": "TimesGreen",
  "description": "Vietnam travel blog and itinerary consultation channel."
}
```

Response:

```json
{
  "success": true,
  "config": {}
}
```

#### POST /api/admin/navigation/logo

Multipart form data:

```text
file=<image file>
```

Response:

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../logo.png"
}
```

#### POST /api/admin/navigation/menus

Body:

```json
{
  "label": "Tours",
  "url": "/goi-du-lich",
  "location": "header",
  "order": 2,
  "isActive": true
}
```

Response:

```json
{
  "success": true,
  "menu": {
    "id": 10,
    "label": "Tours",
    "url": "/goi-du-lich",
    "location": "header",
    "order": 2,
    "isActive": true
  }
}
```

#### PATCH /api/admin/navigation/menus/{id}

Body: any menu fields to update.

```json
{
  "label": "Travel packages",
  "isActive": true
}
```

Response:

```json
{
  "success": true,
  "menu": {}
}
```

#### DELETE /api/admin/navigation/menus/{id}

Response:

```json
{
  "success": true
}
```

### Posts

#### GET /api/admin/posts

Response:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "48 giờ ở Hội An...",
      "slug": "48-gio-o-hoi-an",
      "category": "Cẩm nang",
      "summary": "...",
      "imageUrl": "https://...",
      "status": "Đã xuất bản",
      "createdAt": "2026-07-24T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/admin/posts

Body:

```json
{
  "title": "New article",
  "slug": "new-article",
  "categoryId": 1,
  "summary": "Short summary",
  "content": "Article body",
  "imageUrl": "https://...",
  "status": "Đã xuất bản",
  "translations": {
    "en": { "title": "New article", "summary": "Short summary" },
    "zh-CN": { "title": "新文章", "summary": "简短摘要" }
  }
}
```

Response:

```json
{
  "message": "Tạo bài viết thành công.",
  "post": { "id": 10, "title": "New article", "slug": "new-article" }
}
```

#### PUT /api/admin/posts

Body must include `id` plus fields to update.

```json
{
  "id": 10,
  "title": "Updated article",
  "status": "Đã xuất bản"
}
```

#### DELETE /api/admin/posts?id={id}

Response:

```json
{
  "message": "Xóa bài viết thành công."
}
```

### Post categories

`GET|POST|PUT|DELETE /api/admin/posts/categories`

Create body:

```json
{
  "name": "Guide",
  "slug": "guide"
}
```

Response:

```json
{
  "success": true,
  "category": { "id": 1, "name": "Guide", "slug": "guide" }
}
```

### Packages

`GET|POST|PUT|DELETE /api/admin/packages`

Create/update body example:

```json
{
  "name": "Ninh Binh Weekend",
  "slug": "ninh-binh-weekend",
  "destinationId": 1,
  "categoryId": 1,
  "duration": "2 days 1 night",
  "priceText": "3,400,000 VND",
  "summary": "Short trip for families",
  "description": "Longer description",
  "imageUrl": "https://...",
  "status": "Đang mở",
  "translations": {
    "en": { "name": "Ninh Binh Weekend", "summary": "..." },
    "zh-CN": { "name": "宁平周末", "summary": "..." }
  }
}
```

Response example:

```json
{
  "success": true,
  "package": {
    "id": 1,
    "name": "Ninh Binh Weekend",
    "slug": "ninh-binh-weekend"
  }
}
```

#### GET /api/admin/packages/{id}/detail

Response:

```json
{
  "detail": {
    "id": 1,
    "packageId": 1,
    "bannerImageUrl": "https://...",
    "overview": "...",
    "itinerary": [],
    "gallery": []
  },
  "translations": {}
}
```

#### PUT /api/admin/packages/{id}/detail

Body: detail fields such as `bannerImageUrl`, `overview`, `itinerary`, `gallery`, `translations`.

### Package categories

`GET|POST|PUT|DELETE /api/admin/packages/categories`

Body:

```json
{
  "name": "Family",
  "slug": "family",
  "description": "Family-friendly trips"
}
```

### Local specialties

`GET|POST|PUT|DELETE /api/admin/local-specialties`

Create/update body:

```json
{
  "name": "Thanh Hoa fermented pork roll",
  "slug": "nem-chua-thanh-hoa",
  "type": "FOOD",
  "description": "A signature Thanh Hoa specialty.",
  "priceText": "45,000 - 60,000 VND",
  "whereToBuy": "Thanh Hoa",
  "imageUrl": "https://...",
  "status": "Hiển thị",
  "translations": {
    "en": { "name": "Thanh Hoa fermented pork roll", "description": "..." },
    "zh-CN": { "name": "清化酸肉卷", "description": "..." }
  }
}
```

Response:

```json
{
  "success": true,
  "item": {
    "id": 14,
    "name": "Thanh Hoa fermented pork roll",
    "slug": "nem-chua-thanh-hoa"
  }
}
```

#### GET /api/admin/local-specialties/{id}/detail

Response:

```json
{
  "specialty": { "id": 14, "name": "Nem chua Thanh Hóa", "slug": "nem-chua-thanh-hoa" },
  "detail": {
    "id": 9,
    "specialtyId": 14,
    "bannerImageUrl": "https://...",
    "overview": "..."
  },
  "translations": {}
}
```

#### PUT /api/admin/local-specialties/{id}/detail

Body:

```json
{
  "bannerImageUrl": "https://...",
  "overview": "Overview text",
  "history": "History text",
  "ingredients": "Ingredients text",
  "howToUse": "How to use",
  "preservation": "Preservation notes",
  "translations": {
    "en": { "overview": "English overview" },
    "zh-CN": { "overview": "中文概览" }
  }
}
```

### Banners

`GET|POST|PUT|DELETE /api/admin/banners`

Body:

```json
{
  "title": "Homepage hero",
  "subtitle": "...",
  "imageUrl": "https://...",
  "page": "home",
  "position": "hero",
  "status": "active"
}
```

### Bookings

`GET|POST /api/admin/bookings`

Create body:

```json
{
  "customerName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0900000000",
  "tourName": "Ninh Binh Weekend",
  "travelDate": "2026-08-20",
  "numberOfTravelers": 2,
  "notes": "Need family pace"
}
```

`PUT|DELETE /api/admin/bookings/{id}`

Update body:

```json
{
  "status": "Đã xác nhận",
  "notes": "Confirmed by agent"
}
```

### Customers

`GET|POST /api/admin/customers`

Create body:

```json
{
  "name": "David Miller",
  "email": "david@example.com",
  "phone": "+1 555 0101",
  "status": "active"
}
```

`PUT|DELETE /api/admin/customers/{id}`

### Reviews

`GET|POST /api/admin/reviews`

Create body:

```json
{
  "customerName": "Sarah",
  "rating": 5,
  "comment": "Great support",
  "status": "approved"
}
```

`PUT|DELETE /api/admin/reviews/{id}`

### Languages

`GET|POST|PUT|DELETE /api/admin/languages`

Body:

```json
{
  "code": "zh-CN",
  "name": "Chinese Simplified",
  "nativeName": "简体中文",
  "flag": "🇨🇳",
  "isActive": true,
  "isDefault": false,
  "sortOrder": 3
}
```

### Static translations

`GET|POST|PUT|DELETE /api/admin/static-translations`

Create/update body:

```json
{
  "namespace": "nav",
  "key": "home",
  "description": "Home menu label",
  "values": {
    "vi": "Trang chủ",
    "en": "Home",
    "zh-CN": "首页"
  }
}
```

`POST /api/admin/static-translations/import` accepts a JSON import payload.

### Content translations

`GET|PUT|DELETE /api/admin/content-translations`

Query params for GET:

```text
entityType=post|package|local_specialty|local_specialty_detail
entityId=123
locale=en|zh-CN
```

PUT body:

```json
{
  "entityType": "post",
  "entityId": 1,
  "locale": "en",
  "fields": {
    "title": "English title",
    "summary": "English summary"
  },
  "status": "published"
}
```

`GET /api/admin/content-translations/export`

`POST /api/admin/content-translations/import`

`POST /api/admin/content-translations/auto-translate`

### Destinations and offers

`GET /api/admin/destinations`

`GET /api/admin/offers`

## 6) Upload endpoint

`POST /api/upload`

Multipart form data:

```text
file=<image file>
```

Response:

```json
{
  "url": "https://res.cloudinary.com/.../image/upload/...jpg"
}
```

## 7) Minimal agent call flow

1. Login:

```bash
curl -i -c ai-agent.cookies \
  -X POST "$WEBADMIN_BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ai-agent@timesgreen.net","password":"CHANGE_ME"}'
```

2. Verify session:

```bash
curl -b ai-agent.cookies "$WEBADMIN_BASE_URL/api/admin/me"
```

3. Read content, update only required fields, then verify public page.

4. If Cloudflare Access is enabled, add `CF-Access-Client-Id` and `CF-Access-Client-Secret` to every request.
