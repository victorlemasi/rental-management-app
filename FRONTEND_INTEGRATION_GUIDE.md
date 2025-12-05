# Frontend Integration Guide for Arrears Display

## Overview
This guide shows how to update the frontend to properly display rent arrears information to admins and tenants.

## Data Structure
The `RentHistory` object now includes:

```typescript
interface RentHistory {
  month: string;              // "2025-12"
  amount: number;             // Base rent + utilities (e.g., 15000)
  previousBalance: number;    // Arrears from previous month(s) (e.g., 5000)
  carriedForwardAmount: number; // Total due including arrears (e.g., 20000)
  amountPaid: number;         // Amount paid so far (e.g., 10000)
  water: number;
  electricity: number;
  garbage: number;
  security: number;
  status: 'paid' | 'pending' | 'partial' | 'overdue';
  dueDate: Date;
}
```

## Component Examples

### 1. Rent Details Card (for Tenant Dashboard)

```tsx
interface RentDetailsCardProps {
  rentHistory: RentHistory;
}

const RentDetailsCard: React.FC<RentDetailsCardProps> = ({ rentHistory }) => {
  const utilities = rentHistory.water + rentHistory.electricity + 
                   rentHistory.garbage + rentHistory.security;
  const baseRent = rentHistory.amount - utilities;
  const remainingBalance = rentHistory.carriedForwardAmount - rentHistory.amountPaid;

  return (
    <div className="rent-details-card">
      <h3>Rent for {rentHistory.month}</h3>
      
      <div className="breakdown">
        <div className="line-item">
          <span>Base Rent</span>
          <span>KSh {baseRent.toLocaleString()}</span>
        </div>
        
        {utilities > 0 && (
          <>
            <div className="line-item sub-item">
              <span>Water</span>
              <span>KSh {rentHistory.water.toLocaleString()}</span>
            </div>
            <div className="line-item sub-item">
              <span>Electricity</span>
              <span>KSh {rentHistory.electricity.toLocaleString()}</span>
            </div>
            <div className="line-item sub-item">
              <span>Garbage</span>
              <span>KSh {rentHistory.garbage.toLocaleString()}</span>
            </div>
            <div className="line-item sub-item">
              <span>Security</span>
              <span>KSh {rentHistory.security.toLocaleString()}</span>
            </div>
          </>
        )}
        
        {rentHistory.previousBalance > 0 && (
          <div className="line-item arrears">
            <span>⚠️ Arrears from Previous Month(s)</span>
            <span className="text-red-600">
              KSh {rentHistory.previousBalance.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="line-item total">
          <span><strong>Total Due</strong></span>
          <span><strong>KSh {rentHistory.carriedForwardAmount.toLocaleString()}</strong></span>
        </div>
        
        <div className="line-item paid">
          <span>Amount Paid</span>
          <span className="text-green-600">
            - KSh {rentHistory.amountPaid.toLocaleString()}
          </span>
        </div>
        
        <div className="line-item balance">
          <span><strong>Outstanding Balance</strong></span>
          <span className={remainingBalance > 0 ? "text-red-600" : "text-green-600"}>
            <strong>KSh {remainingBalance.toLocaleString()}</strong>
          </span>
        </div>
      </div>
      
      <div className={`status-badge ${rentHistory.status}`}>
        {rentHistory.status.toUpperCase()}
      </div>
    </div>
  );
};
```

### 2. Arrears Warning Banner

```tsx
interface ArrearsWarningProps {
  rentHistory: RentHistory;
}

const ArrearsWarning: React.FC<ArrearsWarningProps> = ({ rentHistory }) => {
  if (rentHistory.previousBalance <= 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Outstanding Balance:</strong> You have unpaid rent of KSh {rentHistory.previousBalance.toLocaleString()} 
            from previous month(s). This amount has been added to your current month's bill.
          </p>
        </div>
      </div>
    </div>
  );
};
```

### 3. Admin Tenant List Row

```tsx
interface TenantRowProps {
  tenant: Tenant;
  currentRent: RentHistory | null;
}

const TenantRow: React.FC<TenantRowProps> = ({ tenant, currentRent }) => {
  const hasArrears = currentRent?.previousBalance > 0;
  const outstandingBalance = currentRent 
    ? currentRent.carriedForwardAmount - currentRent.amountPaid 
    : tenant.balance;

  return (
    <tr className={hasArrears ? 'bg-yellow-50' : ''}>
      <td>{tenant.name}</td>
      <td>{tenant.unitNumber}</td>
      <td>
        {hasArrears && (
          <span className="inline-flex items-center mr-2 text-yellow-600">
            ⚠️
            <span className="ml-1 text-xs">Arrears</span>
          </span>
        )}
        KSh {outstandingBalance.toLocaleString()}
      </td>
      <td>
        <span className={`status-badge ${currentRent?.status || tenant.paymentStatus}`}>
          {currentRent?.status || tenant.paymentStatus}
        </span>
      </td>
      <td>
        {/* Action buttons */}
      </td>
    </tr>
  );
};
```

### 4. Payment History Table

```tsx
interface PaymentHistoryProps {
  rentHistory: RentHistory[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ rentHistory }) => {
  return (
    <table className="payment-history-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Base Rent</th>
          <th>Utilities</th>
          <th>Arrears</th>
          <th>Total Due</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rentHistory.map((record) => {
          const utilities = record.water + record.electricity + 
                          record.garbage + record.security;
          const baseRent = record.amount - utilities;
          const balance = record.carriedForwardAmount - record.amountPaid;

          return (
            <tr key={record.month}>
              <td>{record.month}</td>
              <td>KSh {baseRent.toLocaleString()}</td>
              <td>KSh {utilities.toLocaleString()}</td>
              <td className={record.previousBalance > 0 ? 'text-red-600' : ''}>
                {record.previousBalance > 0 
                  ? `KSh ${record.previousBalance.toLocaleString()}`
                  : '-'
                }
              </td>
              <td>KSh {record.carriedForwardAmount.toLocaleString()}</td>
              <td className="text-green-600">
                KSh {record.amountPaid.toLocaleString()}
              </td>
              <td className={balance > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                KSh {balance.toLocaleString()}
              </td>
              <td>
                <span className={`status-badge ${record.status}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
```

### 5. Suggested CSS Styles

```css
.rent-details-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.breakdown {
  margin: 20px 0;
}

.line-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.line-item.sub-item {
  padding-left: 20px;
  font-size: 0.9em;
  color: #666;
}

.line-item.arrears {
  background: #fef3c7;
  padding: 12px;
  margin: 8px -12px;
  border-radius: 4px;
  border-bottom: none;
}

.line-item.total {
  border-top: 2px solid #333;
  border-bottom: none;
  font-size: 1.1em;
  padding-top: 16px;
  margin-top: 8px;
}

.line-item.balance {
  background: #f9fafb;
  padding: 12px;
  margin: 8px -12px;
  border-radius: 4px;
  border-bottom: none;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.partial {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.overdue {
  background: #fee2e2;
  color: #991b1b;
}
```

## API Integration Example

```typescript
// Fetch rent history with arrears info
const fetchCurrentRent = async (tenantId: string) => {
  const response = await fetch(`/api/tenants/${tenantId}/rent-history`);
  const rentHistory: RentHistory[] = await response.json();
  
  // Get current month's record
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentRent = rentHistory.find(r => r.month === currentMonth);
  
  return {
    currentRent,
    hasArrears: currentRent?.previousBalance > 0,
    totalDue: currentRent?.carriedForwardAmount || 0,
    outstandingBalance: currentRent 
      ? currentRent.carriedForwardAmount - currentRent.amountPaid 
      : 0
  };
};
```

## Key Points for Frontend Implementation

1. **Always use `carriedForwardAmount`** for displaying total due, not just `amount`
2. **Highlight arrears** with warning colors (yellow/red) to draw attention
3. **Show breakdown** clearly so tenants understand what they're paying for
4. **Display status badges** with appropriate colors
5. **Calculate outstanding** as `carriedForwardAmount - amountPaid`
6. **Show utility breakdown** separately from base rent
7. **Add warning banners** when arrears exist

## Mobile-Friendly Considerations

For mobile displays, consider:
- Collapsible breakdown sections
- Simplified view with expandable details
- Prominent display of total due and outstanding balance
- Clear call-to-action buttons for payment

## Accessibility

- Use semantic HTML
- Ensure sufficient color contrast
- Add aria-labels for screen readers
- Make status indicators readable without relying solely on color
