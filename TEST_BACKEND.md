# Test Your Backend Locally

## The Problem:
Your frontend is calling: `https://assignment-k2f4.onrender.com/api/admin/dash`
But your updated backend code is only on your LOCAL machine (not deployed yet).

## Solution - Test Locally:

### 1. Start Your Local Backend:
```bash
cd backend
npm start
```

### 2. Update Frontend to Use Local API:

**Option A: Create `.env` file in frontend folder:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Option B: Or temporarily edit `frontend/src/api.js`:**
Change this line:
```javascript
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
```
To this:
```javascript
baseURL: 'http://localhost:5000/api'
```

### 3. Start Your Frontend:
```bash
cd frontend
npm start
```

### 4. Test Login:
- Email: admin email from your database
- Password: admin password

## Quick Test API:

You can test the backend directly with this:

### Test 1 - Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","pwd":"Admin@123"}'
```

### Test 2 - Get Dashboard (replace TOKEN):
```bash
curl http://localhost:5000/api/admin/dash \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## For Production:
After testing locally, you need to:
1. Push your code to GitHub
2. Deploy to Render.com (or your hosting)
3. Then frontend will work with production URL
