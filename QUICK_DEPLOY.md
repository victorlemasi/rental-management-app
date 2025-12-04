# 📋 DEPLOYMENT QUICK REFERENCE CARD

## 🎯 STEP-BY-STEP DEPLOYMENT

### BACKEND (Web Service)
```
1. Render Dashboard → New + → Web Service
2. Connect: victorlemasi/rental-management-app
3. Settings:
   Name: rental-app-backend
   Root Directory: server
   Build: npm install && npm run build
   Start: npm start
4. Add 9 Environment Variables (see below)
5. Create → Wait 5-10 min → Copy URL
```

### FRONTEND (Static Site)
```
1. Render Dashboard → New + → Static Site
2. Connect: victorlemasi/rental-management-app
3. Settings:
   Name: rental-app-frontend
   Build: npm install && npm run build
   Publish: dist
   Rewrite: /* → /index.html
4. Add 1 Environment Variable (see below)
5. Create → Wait 3-5 min → Copy URL
```

### UPDATE URLS
```
1. Backend → Environment → Edit:
   CLIENT_URL = (your frontend URL)
   MPESA_CALLBACK_URL = (your backend URL)/api/mpesa/callback
2. Save → Auto-redeploy
```

---

## 🔑 ENVIRONMENT VARIABLES

### BACKEND (9 Variables)

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://VICTOR:<password>@cluster0.dphiuvb.mongodb.net/rental-management?appName=Cluster0` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://rental-app-frontend.onrender.com` (update after deploy) |
| `MPESA_CONSUMER_KEY` | Your M-Pesa key |
| `MPESA_CONSUMER_SECRET` | Your M-Pesa secret |
| `MPESA_SHORTCODE` | `174379` |
| `MPESA_PASSKEY` | Your M-Pesa passkey |
| `MPESA_CALLBACK_URL` | `https://rental-app-backend.onrender.com/api/mpesa/callback` (update) |
| `MPESA_ENVIRONMENT` | `sandbox` |

### FRONTEND (1 Variable)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://rental-app-backend-xxxx.onrender.com/api` |

**⚠️ IMPORTANT**: 
- Replace `<password>` with your actual MongoDB password
- Update URLs after both services deploy
- `VITE_API_URL` must end with `/api`

---

## ✅ TESTING CHECKLIST

### Backend Health Check
```
URL: https://your-backend.onrender.com/api/health
Expected: {"status":"ok","message":"Server is running"}
```

### Frontend Check
```
URL: https://your-frontend.onrender.com
Expected: Login page loads
```

### Full Test
- [ ] Login works
- [ ] Dashboard displays
- [ ] No CORS errors
- [ ] Mobile responsive
- [ ] PWA installable

---

## 🐛 QUICK FIXES

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB URI password |
| CORS errors | Update CLIENT_URL to match frontend URL exactly |
| 404 on API calls | Ensure VITE_API_URL ends with `/api` |
| Blank frontend | Check browser console, verify backend is running |
| Slow first load | Normal for free tier (30-60s after inactivity) |

---

## 📱 MOBILE TEST

1. Open frontend URL on phone
2. Tap hamburger menu (☰)
3. Navigate between pages
4. Try "Add to Home Screen"

---

## 🔗 USEFUL LINKS

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repo**: https://github.com/victorlemasi/rental-management-app
- **Full Guide**: See `DEPLOYMENT.md`
- **Mobile Guide**: See `MOBILE_OPTIMIZATION.md`

---

## ⏱️ DEPLOYMENT TIME

- Backend: 5-10 minutes
- Frontend: 3-5 minutes
- Updates: 2-3 minutes
- **Total**: ~15-20 minutes

---

## 💡 PRO TIPS

1. **MongoDB**: Set Network Access to `0.0.0.0/0` before deploying
2. **URLs**: Copy URLs immediately after deployment
3. **Logs**: Check Render logs if something fails
4. **Testing**: Test backend health endpoint first
5. **Mobile**: Test on real device after deployment

---

## 📞 SUPPORT

**If stuck:**
1. Check Render logs (Dashboard → Service → Logs)
2. Review `DEPLOYMENT.md` for detailed help
3. Verify all environment variables
4. Test locally to isolate issues

---

**Print this page for quick reference during deployment!**

Last Updated: 2025-12-03
