# Member Tag Implementation

## Overview
This implementation adds a member tag/indicator to users who have purchased a membership plan. The `isMember` boolean field in the User model automatically tracks membership status.

## Database Changes

### Schema Update
Added `isMember` field to the User model:
```prisma
model User {
  // ... other fields
  isMember  Boolean   @default(false)
  // ... other fields
}
```

### Migration
Run the following command to apply the database migration:
```bash
cd backend
npx prisma migrate dev --name add_is_member_field
```

## Features Implemented

### 1. Automatic Member Status Update
When a user successfully purchases a membership:
- The `isMember` field is automatically set to `true`
- This happens in both paid and free membership activations
- The update is done within a database transaction for data consistency

**Files Modified:**
- `backend/src/services/membership-services/membership.service.ts`
  - `handleMembershipPayment()` - Sets `isMember=true` on successful payment
  - `activateFreeMembership()` - Sets `isMember=true` for free memberships

### 2. Membership Expiry Management

**New Service:** `MembershipExpiryService`
- **Location:** `backend/src/services/membership-services/membershipExpiry.service.ts`

**Methods:**
1. `checkAndUpdateExpiredMemberships()` - Checks all expired memberships and updates user status
2. `updateUserMemberStatus(userId)` - Updates member status for a specific user
3. `getMembershipsExpiringInDays(days)` - Gets memberships expiring in N days (useful for reminder emails)

### 3. API Endpoints

**New Endpoints Added:**
```
POST   /api/membership/check-expired
       - Triggers expired membership check
       - Can be called by cron job or manually

POST   /api/membership/update-member-status/:userId
       - Updates member status for a specific user

GET    /api/membership/expiring?days=7
       - Gets memberships expiring in specified days
       - Default: 7 days
```

**Files Created:**
- `backend/src/controllers/membership-controller/membershipExpiry.controller.ts`
- Routes added to: `backend/src/routes/membership/membership.routes.ts`

### 4. User Profile API Response
The `isMember` field is now included in user profile responses:

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "isMember": true,
    "shippingAddress": []
  }
}
```

**Files Modified:**
- `backend/src/models/user.model.ts` - Added `isMember` field to User interface
- `backend/src/services/auth-services/auth.service.ts` - Returns `isMember` in `getUserById()`

## Cron Job Setup

### Manual Script
Run the expiry check manually:
```bash
cd backend
npx ts-node src/dev-script/checkExpiredMemberships.ts
```

### Automated Cron Job (Recommended)

#### Option 1: Node-cron (In-app)
Install node-cron:
```bash
npm install node-cron @types/node-cron
```

Add to your server startup (e.g., `backend/src/server.ts`):
```typescript
import cron from 'node-cron';
import { MembershipExpiryService } from './services/membership-services/membershipExpiry.service';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running membership expiry check...');
  await MembershipExpiryService.checkAndUpdateExpiredMemberships();
});
```

#### Option 2: System Cron (Linux/Mac)
Edit crontab:
```bash
crontab -e
```

Add this line (runs daily at midnight):
```
0 0 * * * cd /path/to/backend && npx ts-node src/dev-script/checkExpiredMemberships.ts >> /var/log/membership-expiry.log 2>&1
```

#### Option 3: External Service
Use services like:
- **Vercel Cron** (if deployed on Vercel)
- **AWS EventBridge** (if on AWS)
- **Google Cloud Scheduler** (if on GCP)
- **Render Cron Jobs** (if on Render)

Create an endpoint caller:
```bash
curl -X POST https://your-api.com/api/membership/check-expired
```

## Usage Examples

### Frontend: Display Member Badge
```typescript
// In your React component
const UserProfile = () => {
  const { user } = useAuth(); // Assuming you have auth context
  
  return (
    <div>
      <h2>{user.name}</h2>
      {user.isMember && (
        <span className="badge">⭐ Member</span>
      )}
    </div>
  );
};
```

### Backend: Check Member Status
```typescript
// In any service or controller
const user = await AuthService.getUserById(userId);

if (user.isMember) {
  // Apply member-specific logic
  // e.g., discounts, special access, etc.
}
```

### Apply Member Discounts
```typescript
// In booking or payment service
const applyMemberDiscount = (price: number, userId: string) => {
  const user = await AuthService.getUserById(userId);
  
  if (user.isMember) {
    return price * 0.9; // 10% member discount
  }
  
  return price;
};
```

## Testing

### Test Member Status Update
1. Purchase a membership
2. Verify payment
3. Check user profile - `isMember` should be `true`

### Test Expiry Check
1. Manually set a membership's `expiresAt` to past date
2. Run: `npx ts-node src/dev-script/checkExpiredMemberships.ts`
3. Verify `isMember` is set to `false` for that user

### API Testing
```bash
# Check expired memberships
curl -X POST http://localhost:3000/api/membership/check-expired

# Update specific user status
curl -X POST http://localhost:3000/api/membership/update-member-status/USER_ID

# Get expiring memberships
curl http://localhost:3000/api/membership/expiring?days=7
```

## Benefits

1. **Performance**: Direct boolean field is faster than querying memberships table
2. **Simplicity**: Easy to check member status with single field
3. **UI/UX**: Can easily display member badges, apply conditional styling
4. **Business Logic**: Simple to implement member-only features and discounts
5. **Automated**: Membership status updates automatically on purchase and expiry

## Future Enhancements

1. **Member Tiers**: Add `memberTier` field (Bronze, Silver, Gold)
2. **Member Since**: Add `memberSince` field to track how long they've been a member
3. **Notifications**: Send emails when membership is about to expire
4. **Analytics**: Track member conversion rates and retention
5. **Member Dashboard**: Create a dedicated member portal

## Troubleshooting

### Issue: isMember not updating
- Check if migration was run successfully
- Verify transaction is completing without errors
- Check logs for any database transaction failures

### Issue: Expired memberships not updating
- Ensure cron job is running
- Check if script has database access
- Verify date comparison logic in service

### Issue: isMember showing in wrong state
- Run manual status update:
  ```bash
  curl -X POST http://localhost:3000/api/membership/update-member-status/USER_ID
  ```

