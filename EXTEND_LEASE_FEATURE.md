# Extend Lease Feature - Implementation Guide

## Overview
Added functionality for admins to extend tenant lease periods directly from the Tenants page.

## Changes Made

### Backend (Server)

#### 1. New API Endpoint (`server/src/routes/tenants.ts`)
- **Endpoint**: `POST /api/tenants/:id/extend-lease`
- **Access**: Admin/Manager only
- **Request Body**:
  ```json
  {
    "months": 6
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Lease extended by 6 month(s) successfully",
    "tenant": { ... },
    "previousLeaseEnd": "2024-12-31",
    "newLeaseEnd": "2025-06-31"
  }
  ```

**Functionality**:
- Validates the number of months (must be > 0)
- Checks property ownership for authorization
- Calculates new lease end date by adding specified months
- Updates tenant record with new lease end date
- Returns success message with old and new dates

### Frontend

#### 1. API Function (`src/services/api.ts`)
Added `extendLease` function to `tenantsAPI`:
```typescript
extendLease: async (tenantId: string, months: number) => {
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/extend-lease`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ months }),
    });
    if (!response.ok) throw new Error('Failed to extend lease');
    return response.json();
}
```

#### 2. Tenants Page (`src/pages/Tenants.tsx`)

**New State Variables**:
- `extendLeaseModalOpen`: Controls modal visibility
- `extendLeaseData`: Stores tenant ID, name, and months to extend

**New Functions**:
- `handleExtendLease(tenant)`: Opens modal with tenant info
- `submitExtendLease(e)`: Submits the lease extension request

**UI Changes**:
1. **New Button** in Actions Column:
   - Purple calendar icon
   - Placed first in the actions row
   - Tooltip: "Extend Lease"

2. **New Modal** - Extend Lease:
   - Displays tenant name in title
   - Number input for months (1-60)
   - Info message explaining the extension
   - Purple "Extend Lease" button
   - Success/error toast notifications

## Usage

### For Admins:
1. Navigate to the **Tenants** page
2. Find the tenant whose lease you want to extend
3. Click the **purple calendar icon** (🗓️) in the Actions column
4. Enter the number of months to extend (1-60)
5. Click **"Extend Lease"**
6. Confirmation toast will appear on success

### Example Scenarios:
- **Lease Renewal**: Extend by 12 months for annual renewal
- **Short Extension**: Extend by 1-3 months for temporary extension
- **Long-term**: Extend by 24+ months for multi-year lease

## Validation
- Months must be a positive integer
- Maximum 60 months allowed (5 years)
- Only property owners can extend leases
- Admin/Manager role required

## Benefits
1. **Quick Updates**: No need to manually edit lease dates
2. **Safe Calculation**: Automatically calculates correct new date
3. **Audit Trail**: Logs previous and new dates
4. **User-Friendly**: Simple modal interface
5. **Prevents Errors**: Validation ensures correct inputs

## Future Enhancements
Potential improvements:
1. Add option to extend from today vs from current end date
2. Show lease expiry warning before opening modal
3. Add lease extension history/audit log
4. Bulk extend multiple tenants at once
5. Automatic email notification to tenant about extension
6. Add option to adjust rent during extension
