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
3. Check for unpaid balance (arrears) from the previous month.
4. If arrears exist, add them to the current month's `carriedForwardAmount`.
5. Create a `RentHistory` record with arrears carried forward and update the tenant's balance.

## Migrating Existing Records

If you have existing RentHistory records from before the arrears system was implemented, run this migration once:

```bash
cd server
npx tsx src/scripts/migrateRentHistory.ts
```

This will update all existing records to include the `carriedForwardAmount` field.

## Testing the Arrears System

To view how arrears are being tracked and carried forward:

```bash
cd server
npx tsx src/scripts/testArrearsSystem.ts
```

This will show:
- Current and previous month rent records for each tenant
- Any unpaid balances (arrears) from previous months
- How arrears are carried forward to the current month
- Total amounts due (base rent + utilities + arrears)

