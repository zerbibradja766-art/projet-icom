# RZ COACH — Backend API (Node.js + Express + MongoDB)

## التشغيل

```bash
npm install
cp .env.example .env        # ثم عدّل MONGODB_URI و JWT_SECRET
# انسخ products.json القديم إلى مجلد data/
npm run seed                # ينشئ حساب الأدمن ويستورد المنتجات
npm run dev                 # http://localhost:5000
```

MongoDB: محلي، أو مجاني على MongoDB Atlas (ضع الرابط في `MONGODB_URI`).

## الـ Endpoints

| Method | Path | الصلاحية | الوصف |
|---|---|---|---|
| POST | /api/auth/signup | عام | name, email, password, phone? |
| POST | /api/auth/login | عام | يرجع token + user |
| GET | /api/auth/me | مسجّل | بيانات المستخدم |
| PATCH | /api/auth/me | مسجّل | تعديل name/phone |
| PATCH | /api/auth/password | مسجّل | currentPassword, newPassword |
| GET | /api/products | عام | q, category, minPrice, maxPrice, featured, sort, page, limit |
| GET | /api/products/categories | عام | قائمة التصنيفات |
| GET | /api/products/:id | عام | منتج واحد |
| POST/PUT/DELETE | /api/products[/:id] | أدمن | إدارة المنتجات |
| POST | /api/orders | مسجّل | items:[{product,qty}], shippingAddress, paymentMethod |
| GET | /api/orders/mine | مسجّل | طلباتي |
| GET | /api/orders/:id | صاحب الطلب/أدمن | تفاصيل طلب |
| PATCH | /api/orders/:id/cancel | صاحب الطلب/أدمن | إلغاء (pending فقط) |
| GET | /api/orders | أدمن | كل الطلبات (?status=) |
| PATCH | /api/orders/:id/status | أدمن | pending/confirmed/shipped/delivered/cancelled |
| GET | /api/blog | عام | المقالات المنشورة |
| GET | /api/blog/:slug | عام | مقال |
| GET/POST/PUT/DELETE | /api/blog/admin/all, /api/blog[/:id] | أدمن | إدارة المدونة |
| POST | /api/contact | عام | name, email, subject?, message |
| GET/PATCH/DELETE | /api/contact[/:id/read] | أدمن | رسائل التواصل |

الاستجابة دائمًا: `{ success, data | user | message }`، والأخطاء: `{ success:false, message }`.

## الربط مع React

```js
// src/api/axios.js
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;
```

```js
// جلب المنتجات
const { data } = await api.get('/products', { params: { category: 'gym', page: 1 } });
// تسجيل الدخول
const res = await api.post('/auth/login', { email, password });
localStorage.setItem('token', res.data.token);
```

أضف `CLIENT_URL=https://your-site.com` في `.env` عند النشر ليسمح CORS بدومين الـ frontend.
