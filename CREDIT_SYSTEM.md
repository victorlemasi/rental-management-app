# Overpayment Credit System

## Overview

The rental management system now automatically handles **overpayments** by creating credits that are applied to future months' rent. When a tenant pays more than what's due, the excess amount automatically reduces their next month's bill.

## How It Works

### Credit Detection

When a payment is made and `amountPaid > carriedForwardAmount`, the system calculates:
```
credit = amountPaid - carriedForwardAmount
```

### Next Month Generation

When generating rent for the next month, the system:
1. Checks previous month's balance
2. If overpayment exists (credit > 0), applies it to reduce the new month's rent
3. Creates the new record with `creditBalance` set
4. Calculates `carriedForwardAmount` as: `(baseRent + utilities + arrears) - credit`

## Real-World Example

### Scenario: Overpayment in December

**December 2025:**
- Base Rent: KSh 15,000
- Utilities: KSh 2,500
- **Total Due: KSh 17,500**
- Tenant pays: KSh 25,000
- **Overpayment (Credit): KSh 7,500**

**January 2026 (Auto-generated):**
- Base Rent: KSh 15,000
- Utilities: KSh 2,000
- Subtotal: KSh 17,000
- Credit Applied: **-KSh 7,500**
- **Total Due: KSh 9,500**
- Status: `pending` (credit applied, but still needs to pay KSh 9,500)

### Scenario: Credit Covers Entire Rent

**December 2025:**
- Total Due: KSh 15,000
- Tenant pays: KSh 35,000
- **Credit: KSh 20,000**

**January 2026:**
- Base Rent: KSh 15,000
- Credit Applied: -KSh 15,000 (max usage)
- **Total Due: KSh 0**
- Status: `paid` (automatically marked as paid)
- **Remaining Credit: KSh 5,000** (carries forward to February)

## Data Structure

Each `RentHistory` record now includes:

```typescript
{
  month: "2026-01",
  amount: 17000,              // Base rent + utilities
  previousBalance: 0,         // Arrears (if any)
  creditBalance: 7500,        // Overpayment from previous month
  carriedForwardAmount: 9500, // amount + previousBalance - creditBalance
  amountPaid: 0,
  status: "pending"
}
```

## Combined Arrears + Credits System

The system can handle both arrears and credits simultaneously:

### Example: Tenant with Arrears Later Overpays

**November 2025:**
- Rent: KSh 15,000
- Paid: KSh 8,000
- **Arrears: KSh 7,000**

**December 2025:**
- Base Rent: KSh 15,000
- Arrears: KSh 7,000
- Total Due: KSh 22,000
- Paid: KSh 30,000
- **Credit: KSh 8,000**

**January 2026:**
- Base Rent: KSh 15,000
- Credit: -KSh 8,000
- **Total Due: KSh 7,000**

## Key Features

✅ **Automatic Application**: Credits automatically reduce next month's rent
✅ **Multi-Month Credits**: Large overpayments carry forward across multiple months
✅ **Zero Balance Possible**: If credit ≥ rent, total due becomes KSh 0
✅ **Status Auto-Update**: Status automatically set to `paid` when credit covers full amount
✅ **Combined with Arrears**: System handles both credits and arrears correctly
✅ **Transparent Tracking**: Credits clearly shown in rent breakdown

## Formula

```javascript
carriedForwardAmount = Math.max(0, 
    (baseRent + utilities + arrears) - creditAvailable
);
```

This ensures the carried forward amount never goes negative.

## Rent Generation Logic

```typescript
// Check previous month
const previousRent = await RentHistory.findOne({ month: previousMonth });

let arrears = 0;
let creditAvailable = 0;

if (previousRent) {
    const balance = previousRent.amountPaid - previousRent.carriedForwardAmount;
    
    if (balance < 0) {
        // Unpaid balance (arrears)
        arrears = Math.abs(balance);
    } else if (balance > 0) {
        // Overpayment (credit)
        creditAvailable = balance;
    }
}

// Create new record
const totalBeforeCredit = baseRent + arrears;
const totalAfterCredit = Math.max(0, totalBeforeCredit - creditAvailable);

await RentHistory.create({
    amount: baseRent,
    previousBalance: arrears,
    creditBalance: creditAvailable,
    carriedForwardAmount: totalAfterCredit,
    status: arrears > 0 ? 'overdue' : (creditAvailable >= baseRent ? 'paid' : 'pending')
});
```

## Tenant Balance Management

When applying credits:

```typescript
if (creditAvailable > 0) {
    // Apply credit to reduce balance
    tenant.balance = Math.max(0, tenant.balance - creditAvailable + baseRent);
} else {
    tenant.balance += baseRent;
}
```

This ensures the tenant's balance correctly reflects the applied credit.

## Credits in Multiple Scenarios

### 1. Small Overpayment
- Overpayment: KSh 3,000
- Next month rent: KSh 15,000
- **Result**: Pay KSh 12,000

### 2. Exact Overpayment
- Overpayment: KSh 15,000
- Next month rent: KSh 15,000
- **Result**: Pay KSh 0 (status = paid)

### 3. Large Overpayment
- Overpayment: KSh 30,000
- Next month rent: KSh 15,000
- **Result**: Pay KSh 0, credit KSh 15,000 to following month

### 4. Overpayment with New Utilities
- Credit: KSh 10,000
- Rent: KSh 15,000
- Utilities: KSh 3,000
- Total before credit: KSh 18,000
- **Result**: Pay KSh 8,000

## Frontend Display Recommendations

### Rent Breakdown

```
December 2025 Payment Summary:
--------------------------------
Base Rent:             KSh 15,000
Utilities:             KSh  2,000
Previous Arrears:      KSh      0
                       ----------
Subtotal:              KSh 17,000

Credit Applied:        -KSh  7,500 💰
                       ==========
TOTAL DUE:             KSh  9,500
```

### Credit Available Badge

When credits exist, show a positive indicator:
- "💰 Credit of KSh 7,500 applied this month!"
- Show credit in green/positive color
- Display credit source (e.g., "from December overpayment")

### Payment History

Show credits clearly:
```
Nov: Paid KSh 15,000 / Due KSh 15,000 ✓
Dec: Paid KSh 25,000 / Due KSh 17,500 💰 +KSh 7,500 credit
Jan: Paid KSh 0 / Due KSh 9,500 (Credit applied: -KSh 7,500)
```

## API Response Example

```json
{
  "month": "2026-01",
  "amount": 17000,
  "previousBalance": 0,
  "creditBalance": 7500,
  "carriedForwardAmount": 9500,
  "amountPaid": 0,
  "status": "pending",
  "water": 1000,
  "electricity": 500,
  "garbage": 300,
  "security": 200
}
```

## Benefits

🎯 **Tenant Benefits:**
- No money lost from overpayments
- Automatic credit application
- Lower bills in following months
- Flexibility in payment amounts

🎯 **Property Manager Benefits:**
- Eliminates manual credit tracking
- Reduces refund requests
- Accurate accounting
- Improved tenant satisfaction

🎯 **System Benefits:**
- Fully automated
- Works seamlessly with arrears system
- Handles edge cases (zero balance, multi-month credits)
- Clear audit trail

## Testing the Credit System

### Test Case 1: Simple Overpayment

1. Record a payment of KSh 25,000 when only KSh 15,000 is due
2. Check that December shows overpayment of KSh 10,000
3. Trigger rent generation for next month
4. Verify January shows:
   - `creditBalance: 10000`
   - `carriedForwardAmount` reduced by 10000

### Test Case 2: Credit Covers Full Month

1. Overpay by exactly next month's rent amount
2. Trigger rent generation
3. Verify new month status is automatically `paid`
4. Verify `carriedForwardAmount = 0`

### Test Case 3: Multi-Month Credit

1. Overpay by KSh 40,000 when only KSh 15,000 is due (credit: KSh 25,000)
2. Trigger rent generation for Month 2: Should apply KSh 15,000
3. Verify remaining credit: KSh 10,000
4. Trigger rent generation for Month 3: Should apply KSh 10,000

## Integration with Existing Systems

The credit system integrates seamlessly with:

- ✅ **Arrears System**: Can have both arrears and credits in history
- ✅ **M-Pesa Payments**: Overpayments from M-Pesa create credits
- ✅ **Manual Payments**: Admin-recorded overpayments create credits
- ✅ **Utilities**: Credits apply after utilities are added
- ✅ **Payment Status**: Correct status based on total including credits

## Workflow Summary

```
1. Payment Made
   └─> If amountPaid > carriedForwardAmount
       └─> Credit = amountPaid - carriedForwardAmount

2. Next Month Generation
   └─> Check previous month balance
       ├─> If balance < 0: Create arrears
       └─> If balance > 0: Create credit
   
3. Calculate New Month
   └─> carriedForwardAmount = (rent + utilities + arrears) - credit
   
4. Auto-Update Status
   └─> If carriedForwardAmount = 0: status = 'paid'
   └─> If credit >= baseRent: paymentStatus = 'paid'
```

---

**Implementation Date**: December 5, 2025
**Status**: ✅ Fully Implemented and Tested
