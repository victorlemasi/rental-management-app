# Deployment Guide for Render

This guide will help you deploy the Rental Management Application to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. A GitHub repository with your code
3. MongoDB Atlas database (already configured)
4. M-Pesa API credentials (if using payment features)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a new Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   
   For the **Backend** service, set these in the Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CLIENT_URL`: Your frontend URL (e.g., `https://your-app.onrender.com`)
   - `MPESA_CONSUMER_KEY`: Your M-Pesa consumer key
   - `MPESA_CONSUMER_SECRET`: Your M-Pesa consumer secret
   - `MPESA_SHORTCODE`: Your M-Pesa shortcode
   - `MPESA_PASSKEY`: Your M-Pesa passkey
   - `MPESA_CALLBACK_URL`: Your backend URL + `/api/mpesa/callback`
   
   For the **Frontend** service, set:
   - `VITE_API_URL`: Your backend URL + `/api` (e.g., `https://rental-app-backend.onrender.com/api`)

4. **Deploy**
   - Click "Apply" to deploy both services
   - Wait for the build to complete (this may take 5-10 minutes)

### Option 2: Manual Deployment

#### Deploy Backend

1. **Create a new Web Service**
   - Go to Render Dashboard → "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `rental-app-backend`
     - **Root Directory**: `server`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

2. **Add Environment Variables** (same as above)

#### Deploy Frontend

1. **Create a new Static Site**
   - Go to Render Dashboard → "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `rental-app-frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Plan**: Free

2. **Add Environment Variable**
   - `VITE_API_URL`: Your backend URL + `/api`

3. **Configure Redirects/Rewrites**
   - Add this to handle client-side routing:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

## Post-Deployment

### Update CORS Settings

After deployment, update your backend's `CLIENT_URL` environment variable to include your frontend URL:
```
CLIENT_URL=https://your-frontend.onrender.com
```

If you need multiple origins (e.g., local + production), use comma-separated values:
```
CLIENT_URL=http://localhost:5173,https://your-frontend.onrender.com
```

### Update M-Pesa Callback URL

Update your M-Pesa callback URL to point to your deployed backend:
```
MPESA_CALLBACK_URL=https://your-backend.onrender.com/api/mpesa/callback
```

### Test Your Deployment

1. Visit your frontend URL
2. Try logging in
3. Test key features:
   - Dashboard loads correctly
   - Properties and tenants display
   - Maintenance requests work
   - Payment functionality (if configured)

## Troubleshooting

### Build Failures

**Backend build fails:**
- Check that all dependencies are in `dependencies`, not `devDependencies`
- Verify Node version compatibility
- Check build logs for specific errors

**Frontend build fails:**
- Ensure `VITE_API_URL` is set correctly
- Check for TypeScript errors
- Verify all dependencies are installed

### Runtime Issues

**CORS Errors:**
- Verify `CLIENT_URL` is set correctly in backend
- Check that frontend URL matches exactly (including https://)

**Database Connection Fails:**
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check that `MONGODB_URI` is correct
- Ensure database password doesn't contain special characters that need URL encoding

**API Requests Fail:**
- Verify `VITE_API_URL` in frontend points to correct backend URL
- Check backend health endpoint: `https://your-backend.onrender.com/api/health`
- Review backend logs in Render dashboard

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for production use

## Monitoring

- **Logs**: View in Render Dashboard → Your Service → Logs
- **Metrics**: Available in Render Dashboard
- **Health Check**: Backend has `/api/health` endpoint

## Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically rebuild and redeploy your services.

## Security Checklist

- [ ] All sensitive data in environment variables (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] CORS is properly configured
- [ ] MongoDB Atlas has proper access controls
- [ ] M-Pesa credentials are secure
- [ ] HTTPS is enabled (automatic on Render)

## Support

For issues specific to:
- **Render**: Check [Render Docs](https://render.com/docs)
- **MongoDB**: Check [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- **M-Pesa**: Check [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/)
