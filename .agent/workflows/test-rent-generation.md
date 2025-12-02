---
description: How to test automated rent generation
---

# Testing Automated Rent Generation

You can manually trigger the rent generation process (which normally runs at midnight) using the following command:

1. Ensure the server is running (`npm run dev` in the `server` directory).
2. Send a POST request to the manual trigger endpoint:

```bash
curl -X POST http://localhost:5000/api/admin/generate-rent
```

Or using PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/admin/generate-rent"
```

This will:
1. Find all active tenants.
2. Check if a rent record exists for the current month.
3. If not, create a `RentHistory` record and update the tenant's balance.
