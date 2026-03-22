# 🚀 TASK PLANNER - CLOUD DEPLOYMENT GUIDE

## 📦 BACKEND DEPLOYMENT (NestJS + Prisma + PostgreSQL)

### 1️⃣ Prerequisite
- PostgreSQL database (Railway, Supabase, Neon, yoki boshqa)
- Node.js 18+ 
- NPM yoki PNPM

### 2️⃣ Backend Setup

#### Loyihani yaratish:
```bash
npx @nestjs/cli new task-planner-backend
cd task-planner-backend
```

#### Packages o'rnatish:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @prisma/client
npm install -D prisma @types/bcrypt @types/passport-jwt
```

#### Prisma setup:
```bash
npx prisma init
```

#### `.env` fayl yaratish:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
```

#### Prisma schema (`prisma/schema.prisma`):
Yuqorida berilgan to'liq Prisma schema'ni bu faylga joylashtiring.

#### Migration run qilish:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Backend strukturasi:
```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── tasks/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
├── categories/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── statistics/
│   ├── statistics.controller.ts
│   ├── statistics.service.ts
│   └── statistics.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts
└── main.ts
```

### 3️⃣ Cloud Platform'larga Deploy

#### **Railway.app:**
```bash
# Railway CLI o'rnatish
npm i -g @railway/cli

# Login
railway login

# Project yaratish
railway init

# Environment variables qo'shish
railway variables set DATABASE_URL="your-db-url"
railway variables set JWT_SECRET="your-secret"

# Deploy
railway up
```

#### **Render.com:**
1. GitHub'ga push qiling
2. Render.com'da yangi Web Service yarating
3. Repository'ni tanlang
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npx prisma migrate deploy && npm run start:prod`
6. Environment variables qo'shing

#### **Heroku:**
```bash
heroku create task-planner-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET="your-secret"
git push heroku main
heroku run npx prisma migrate deploy
```

---

## 🎨 FRONTEND DEPLOYMENT (React + Vite)

### 1️⃣ Environment Setup

`.env` fayl yaratish:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

**IMPORTANT:** Backend deploy qilgandan keyin olingan URL'ni bu yerga qo'ying!

### 2️⃣ Build

```bash
npm run build
```

### 3️⃣ Deploy Options

#### **Vercel:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

Environment variable qo'shish:
- Vercel dashboard → Settings → Environment Variables
- `REACT_APP_API_URL` = `https://your-backend.railway.app/api`

#### **Netlify:**
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

Environment variable:
- Netlify dashboard → Site settings → Environment variables

#### **GitHub Pages:**
```bash
npm install --save-dev gh-pages

# package.json'ga qo'shing:
{
  "homepage": "https://username.github.io/task-planner",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

npm run deploy
```

---

## 🔗 BACKEND ROUTE'LAR

### Auth Routes:
- `POST /api/auth/signup` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `GET /api/auth/me` - Foydalanuvchi ma'lumotlari (JWT required)

### Task Routes (JWT required):
- `GET /api/tasks` - Barcha vazifalar
- `GET /api/tasks/:id` - Bitta vazifa
- `POST /api/tasks` - Yangi vazifa
- `PUT /api/tasks/:id` - Vazifani yangilash
- `DELETE /api/tasks/:id` - Vazifani o'chirish
- `PATCH /api/tasks/:id/complete` - Vazifani bajarish
- `PATCH /api/tasks/:id/archive` - Vazifani arxivlash

### Category Routes (JWT required):
- `GET /api/categories` - Barcha kategoriyalar
- `GET /api/categories/:id` - Bitta kategoriya
- `POST /api/categories` - Yangi kategoriya
- `PUT /api/categories/:id` - Kategoriyani yangilash
- `DELETE /api/categories/:id` - Kategoriyani o'chirish

### Statistics Routes (JWT required):
- `GET /api/statistics` - Statistika

---

## 📝 DEPLOYMENT CHECKLIST

### Backend:
- [x] PostgreSQL database yaratildi
- [x] Environment variables to'g'ri sozlandi
- [x] Prisma migration run qilindi
- [x] JWT_SECRET o'rnatildi
- [x] CORS yoqildi (frontend URL'i allowed)
- [x] Backend deploy qilindi va ishlayapti

### Frontend:
- [x] `REACT_APP_API_URL` backend URL'ga o'rnatildi
- [x] Build muvaffaqiyatli
- [x] Frontend deploy qilindi
- [x] Login/Signup ishlayapti
- [x] API'ga ulanish ishlayapti

---

## 🔐 SECURITY CHECKLIST

- [ ] JWT_SECRET kuchli va unique
- [ ] Production'da specific CORS origin qo'ying (wildcard `*` emas)
- [ ] HTTPS ishlatilayapti
- [ ] Environment variables xavfsiz saqlanyapti
- [ ] Database credentials xavfsiz
- [ ] Password hashing (bcrypt) ishlayapti

---

## 🐛 TROUBLESHOOTING

### CORS Error:
Backend `main.ts` faylida:
```typescript
app.enableCors({
  origin: 'https://your-frontend-url.com', // Frontend URL
  credentials: true,
});
```

### Database Connection Error:
- DATABASE_URL to'g'riligini tekshiring
- Database accessible ekanligini tekshiring
- SSL required bo'lsa: `?sslmode=require` qo'shing

### JWT Error:
- JWT_SECRET ikkala joyda (backend va frontend) bir xil ekanligini tekshiring
- Token localStorage'da saqlanganligini tekshiring

---

## 📞 SUPPORT

Muammolar bo'lsa:
1. Browser Console'ni tekshiring (Frontend errors)
2. Backend logs'ni tekshiring (Railway/Render/Heroku dashboard)
3. Network tab'da API request'lar muvaffaqiyatli ekanligini tekshiring

---

**🎉 Tayyor! Task Planner ilovangiz cloud'da ishlayapti!**
