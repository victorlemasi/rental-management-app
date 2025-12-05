# Rent Arrears & Credit System

## Overview

The rental management system includes automatic arrears carry-forward and overpayment credit features:

**Arrears**: Any unpaid rent from previous months is automatically added to the next month's rent, so tenants are always aware of their total outstanding balance.

**Credits**: Any overpayment is automatically applied to reduce future months' rent, so tenants benefit from paying ahead.

Both systems work seamlessly together to provide accurate, automated rent tracking.

## How It Works

### 1. **Monthly Rent Generation**

Every month (at midnight via cron job), the system:

- Checks each active tenant's previous month rent record
- Calculates if there's any unpaid balance (arrears)
- Creates a new rent record for the current month that includes:
  - **Base Rent**: The tenant's monthly rent
  - **Previous Balance**: Any unpaid amount from previous months (arrears)
  - **Carried Forward Amount**: Total amount due (base rent + arrears + utilities)

### 2. **Data Structure**

Each `RentHistory` record now contains:

```typescript
{
  tenantId: ObjectId,
  propertyId: ObjectId,
  month: "2025-12",           // YYYY-MM format
  amount: 15000,              // Base rent + utilities for this month
  amountPaid: 0,              // How much has been paid
  previousBalance: 5000,      // Arrears from previous month(s)
  creditBalance: 0,           // Overpayment credit from previous month
  carriedForwardAmount: 20000, // Total due (amount + previousBalance - creditBalance)
  water: 500,
  electricity: 1500,
  garbage: 200,
  security: 300,
  status: "overdue",          // paid | pending | partial | overdue
  dueDate: Date
}
```

### 3. **Example Scenario**

**November 2025:**
- Base Rent: KSh 15,000
- Utilities: KSh 2,500
- Total Due: KSh 17,500
- Amount Paid: KSh 10,000
- **Unpaid Balance: KSh 7,500**

**December 2025 (Auto-generated):**
- Base Rent: KSh 15,000
- Previous Balance (Arrears): KSh 7,500
- Utilities: KSh 0 (not yet set)
- **Carried Forward Amount: KSh 22,500**
- Status: `overdue` (because there are arrears)

When the tenant pays KSh 22,500, the status changes to `paid`.

If they pay KSh 10,000, the status is `partial`, and next month will carry forward KSh 12,500 in arrears.

## Payment Processing

### How Payments Are Applied

1. **Payment is recorded** (via M-Pesa, manual entry, etc.)
2. **Amount is added** to `amountPaid` for the relevant month
3. **Status is updated** by comparing `amountPaid` to `carriedForwardAmount`:
   - `amountPaid >= carriedForwardAmount` → Status: `paid`
   - `amountPaid > 0 && amountPaid < carriedForwardAmount` → Status: `partial`
   - `amountPaid === 0` → Status: `pending` or `overdue`

4. **Tenant's global balance** is reduced by the payment amount

### Important Notes

- Payments always check against **`carriedForwardAmount`**, not just the base `amount`
- This ensures arrears are considered when determining payment status
- Arrears continue to carry forward until fully paid
- **NEW**: Overpayments create credits that automatically reduce future months' rent
  - See `CREDIT_SYSTEM.md` for detailed documentation on overpayment credits

## Updated Functions

### 1. `generateMonthlyRent()` - Rent Generator Service

```typescript
// Check previous month for unpaid balance
const previousRent = await RentHistory.findOne({
    tenantId: tenant._id,
    month: previousMonth
});

let arrears = 0;
if (previousRent) {
    const unpaidAmount = previousRent.carriedForwardAmount - previousRent.amountPaid;
    if (unpaidAmount > 0) {
        arrears = unpaidAmount;
    }
}

// Create new rent with arrears included
await RentHistory.create({
    // ... other fields
    amount: tenant.monthlyRent,
    previousBalance: arrears,
    carriedForwardAmount: tenant.monthlyRent + arrears,
    status: arrears > 0 ? 'overdue' : 'pending'
});
```

### 2. Payment Processing (All Routes)

All payment processing now uses `carriedForwardAmount`:

```typescript
// Check payment status
if (rentHistory.amountPaid >= rentHistory.carriedForwardAmount) {
    rentHistory.status = 'paid';
} else if (rentHistory.amountPaid > 0) {
    rentHistory.status = 'partial';
}
```

This applies to:
- Manual payment recording (`POST /api/tenants/:id/record-payment`)
- M-Pesa callback (`POST /api/mpesa/callback`)
- Payment API (`POST /api/payments`)

### 3. Utilities Update

When utilities are updated, `carriedForwardAmount` is recalculated:

```typescript
rentHistory.amount = tenant.monthlyRent + newUtilities;
rentHistory.carriedForwardAmount = rentHistory.amount + rentHistory.previousBalance;
```

## Testing the System

### 1. Test Arrears Analysis

Run the test script to see how arrears are tracked:

```bash
cd server
npm run tsx src/scripts/testArrearsSystem.ts
```

This shows:
- Each tenant's current and previous month records
- Unpaid amounts being carried forward
- Total amounts due with arrears

### 2. Manual Rent Generation Trigger

```bash
curl -X POST http://localhost:5000/api/admin/generate-rent
```

Or use the workflow: `/test-rent-generation`

### 3. Simulate Partial Payment

1. Create a tenant with rent KSh 10,000
2. Record a partial payment of KSh 5,000
3. Trigger next month's rent generation
4. Check that the new month shows KSh 5,000 in `previousBalance`

## Frontend Display Recommendations

When displaying rent information to admins or tenants, show:

```
Rent Breakdown for December 2025:
- Base Rent:           KSh 15,000
- Water:               KSh    500
- Electricity:         KSh  1,500
- Garbage:             KSh    200
- Security:            KSh    300
- Arrears (from Nov):  KSh  7,500
--------------------------------
Total Due:             KSh 25,000
Amount Paid:           KSh 10,000
--------------------------------
Outstanding Balance:   KSh 15,000
```

## Benefits

✅ **Automatic Tracking**: No manual calculation needed for arrears
✅ **Transparency**: Tenants see exactly what they owe and why
✅ **Accurate Status**: Payment status reflects total obligation, not just current month
✅ **Persistent**: Arrears continue to carry forward until fully cleared
✅ **Flexible**: Works with partial payments, overpayments, and multiple payment methods

## Migration from Old System

If you have existing tenants with balances:

1. The `previousBalance` field defaults to 0 for all new `RentHistory` records
2. The next rent generation will check previous months and carry forward any unpaid amounts
3. No manual data migration needed - the system handles it automatically

## API Changes

### RentHistory Model

**Added Fields:**
- `previousBalance: number` - Arrears from previous month(s)
- `creditBalance: number` - Overpayment credit from previous month  
- `carriedForwardAmount: number` - Total amount including arrears minus credits

### All Payment Endpoints

Now check against `carriedForwardAmount` instead of `amount` when determining payment status.

No breaking changes to API request/response formats - the new fields are automatically included in existing responses.
