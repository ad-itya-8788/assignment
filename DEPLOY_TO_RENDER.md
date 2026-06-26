# 🚀 Deploy Your Code to Render.com

## Problem:
✅ Localhost pe kaam kar raha hai  
❌ Render.com pe 401 error aa raha hai

**Reason:** Render pe purana code hai, JWT_SECRET missing hai

---

## Solution - Deploy New Code:

### Step 1: Push Code to GitHub

```bash
# Stage all changes
git add .

# Commit
git commit -m "Fixed routes and added JWT_SECRET"

# Push to GitHub
git push origin main
```

(If `main` doesn't work, try `git push origin master`)

---

### Step 2: Add JWT_SECRET on Render

1. Go to **Render.com Dashboard**
2. Click on your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add this:
   - **Key:** `JWT_SECRET`
   - **Value:** `your_super_secret_key_change_this_in_production`

6. Click **Save Changes**

---

### Step 3: Render Will Auto-Deploy

- Render will automatically detect your GitHub push
- It will rebuild and deploy
- Wait 2-5 minutes for deployment

---

### Step 4: Check Deployment

1. Go to Render Dashboard
2. Check **Logs** tab
3. You should see: "Server running on port 5000"

---

### Step 5: Update Frontend .env

**If testing with Render URL:**

```env
REACT_APP_API_URL=https://assignment-k2f4.onrender.com/api
```

**For local testing:**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Quick Commands:

### Deploy Code:
```bash
git add .
git commit -m "Updated backend routes"
git push
```

### Test Local:
```bash
# Terminal 1
cd backend
npm start

# Terminal 2  
cd frontend
npm start
```

---

## Important:

🔴 **Environment variables on Render:**
- JWT_SECRET
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- All should be set in Render Dashboard → Environment tab

🟢 **After Render deploys, wait 2 minutes then test login**

---

## If Still Not Working:

### Check Render Logs:
1. Go to Render Dashboard
2. Click your service
3. Click **Logs** tab
4. Look for errors

### Common Issues:
- ❌ JWT_SECRET not set → Add in Environment tab
- ❌ Database not connected → Check DB credentials
- ❌ Old code still running → Wait for deployment to complete
