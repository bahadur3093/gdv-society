# Expense Manager Feature

## Overview

The Expense Manager is a comprehensive monthly expense tracking system for the society. It allows administrators to track community expenses and visualize the financial health of the society on a month-by-month basis.

## Features

### 1. Monthly Expense Tracking
- Add, update, and delete expense entries for each month
- Categorize expenses (Security, Electricity, Cleaning, etc.)
- Track expense amounts with optional descriptions
- View expense breakdown by category

### 2. Collection Calculation

- Real-time tracking of collection vs. expense balance
- Breakdown by category (Core Operations vs. Sinking Fund)

### 3. Financial Visualization
- **Expense Distribution Chart**: Horizontal bar chart showing percentage breakdown of expenses by category

- **Month Selector**: Navigate between different months and years

### 4. Balance Sheet
- Real-time calculation of surplus/deficit
- Percentage-based expense distribution
- Color-coded indicators for financial health

## User Roles

### Admin Users
- Full CRUD access to expenses
- Can add, edit, and delete expense entries
- View calculated monthly collection amounts (read-only)
- Record villa maintenance payments via ledger system
- View all financial data

### Regular Users
- View-only access to expense data
- Can see expense breakdown and financial summaries
- Cannot modify expense or collection data

## API Endpoints

### Expenses API (`/api/expenses`)

#### GET - Fetch Expenses
```
GET /api/expenses?month=5&year=2026
```
**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2026)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "month": 5,
      "year": 2026,
      "category": "Security",
      "amount": 25000,
      "description": "Security guard salaries",
      "createdAt": "2026-05-01T00:00:00.000Z",
      "updatedAt": "2026-05-01T00:00:00.000Z"
    }
  ],
  "total": 25000,
  "count": 1
}
```

#### POST - Create Expense
```
POST /api/expenses
Content-Type: application/json

{
  "month": 5,
  "year": 2026,
  "category": "Security",
  "amount": 25000,
  "description": "Security guard salaries"
}
```

**Requirements:**
- User must be authenticated
- User must have ADMIN role
- Category must be unique for the given month/year combination

#### PUT - Update Expense
```
PUT /api/expenses
Content-Type: application/json

{
  "id": "clx...",
  "amount": 26000,
  "description": "Updated security costs"
}
```

#### DELETE - Delete Expense
```
DELETE /api/expenses?id=clx...
```

### Collections API (REMOVED)

**Note:** The collections API has been completely removed. Collections were previously calculated from villa maintenance payments, but this functionality is no longer part of the Expense Manager.
**Query Parameters:**
- `month` (required): Month number (1-12)
- `year` (required): Year (e.g., 2026)

**Response:**
```json
{
  "success": true,
  "data": {
    "month": 5,
    "year": 2026,
    "totalAmount": 150000,
    "coreOperationsTotal": 120000,
    "sinkingFundTotal": 30000,
    "villasPaidCount": 45,
    "totalVillas": 50,
    "collectionPercentage": 90,
    "payments": 45
  },
  "message": "Collections API has been removed"
}
```

**Previous Collections Calculation Logic (REMOVED):**
- Sums all CREDIT transactions from LedgerEntry for the specified month/year
- Separates totals by category (CORE_OPERATIONS and SINKING_FUND)
- Counts unique villas that have made payments
- Calculates collection percentage based on total villas

**To Record Payments:**
The collections API and all related functionality have been removed from the Expense Manager.

## Database Schema

### MonthlyExpense Model
```prisma
model MonthlyExpense {
  id          String   @id @default(cuid())
  month       Int      // 1-12
  year        Int
  category    String
  amount      Float
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([month, year, category])
  @@index([month, year])
  @@index([category])
}
```

### Collections (REMOVED)

Collections functionality has been completely removed from the Expense Manager:

```typescript
// Collections functionality has been removed
// from LedgerEntry for a specific month/year

const payments = await prisma.ledgerEntry.findMany({
  where: {
    date: { gte: startDate, lte: endDate },
    type: TransactionType.CREDIT,
  },
});

const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
```

**Previous Benefits of Calculated Collections (REMOVED):**
- ✅ Single source of truth (LedgerEntry)
- ✅ No data duplication
- ✅ Automatic updates when payments are recorded
- ✅ Detailed breakdown by category and villa
- ✅ Real-time accuracy

## Component Architecture

### Atomic Design Structure

The Expense Manager follows Atomic Design principles for maximum reusability:

#### Atoms
- **MonthSelector**: Month/year navigation component with prev/next buttons

#### Molecules
- **ExpenseChart**: Horizontal bar chart for expense distribution

- **ExpenseList**: List of expenses with edit/delete actions
- **ExpenseForm**: Form for adding/editing expenses


#### Templates
- **ExpenseManager**: Main orchestrator component that combines all molecules

### Component Reusability

All components are designed to be:
- **Modular**: Each component has a single responsibility
- **Composable**: Components can be combined in different ways
- **Reusable**: No hardcoded values, all data passed via props
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Type-safe**: Full TypeScript support with proper interfaces

## Usage Example

### Accessing the Expense Manager

1. Navigate to `/expense-manager` in your browser
2. You must be logged in (redirects to signin if not authenticated)
3. Admin users see full CRUD interface
4. Regular users see read-only view

### Adding an Expense (Admin Only)

1. Click "Add Expense" button
2. Fill in the form:
   - Category (required)
   - Amount (required)
   - Description (optional)
3. Click "Add Expense" to save
4. The expense appears in the list and charts update automatically

### Viewing Monthly Expenses (All Users)

1. Expenses are displayed for the selected month
2. Select a month/year using the month selector
3. View the calculated collection amount in the financial summary table
4. See breakdown by category (Core Operations vs. Sinking Fund)
5. View collection percentage (villas paid / total villas)

**To Record Villa Payments (Admin Only):**
- Use the Ledger system to record maintenance payments for each villa

- No manual collection entry required

### Navigating Between Months

1. Use the month/year dropdowns to select a specific period
2. Use arrow buttons to navigate to previous/next month
3. Data loads automatically when month changes

## Migration Instructions

### Removing MonthlyCollection Model

The `MonthlyCollection` model and all collections-related functionality have been completely removed from the schema and the application.

```bash
# Create a migration to remove MonthlyCollection table
npx prisma migrate dev --name remove_monthly_collection_model

# Or push directly to database (development only)
npx prisma db push

# Generate Prisma Client with updated schema
npx prisma generate
```

**Important:** This migration will drop the `MonthlyCollection` table. If you have existing collection data, you may want to:
1. Export existing collection data for reference
2. Ensure all villa payments are properly recorded in `LedgerEntry`
3. All collections-related tables and APIs have been removed

## Security Considerations

1. **Authentication**: All API endpoints require valid session
2. **Authorization**: Write operations (POST, PUT, DELETE) for expenses require ADMIN role
3. **Collections Removed**: All collections functionality has been removed from the Expense Manager
4. **Validation**: All expense inputs validated using Zod schemas
5. **SQL Injection**: Protected by Prisma ORM parameterized queries
6. **XSS Protection**: All user inputs sanitized before rendering
7. **Simplified Tracking**: Focus on expense tracking without collections management

## Performance Optimizations

1. **Memoization**: Charts and calculations use `useMemo` to prevent unnecessary recalculations
2. **Callback Optimization**: Event handlers use `useCallback` to prevent re-renders
3. **Database Indexes**: Month/year and category fields are indexed for fast queries
4. **Unique Constraints**: Prevent duplicate expenses for same month/year/category

## Future Enhancements

1. **Export to PDF/Excel**: Download monthly reports
2. **Year-over-Year Comparison**: Compare expenses across years
3. **Budget Planning**: Set budgets and track variance
4. **Expense Approval Workflow**: Multi-level approval for large expenses
5. **Automated Reminders**: Notify admins to record monthly data
6. **Advanced Charts**: Pie charts, line graphs for trends
7. **Expense Categories Management**: Allow admins to define custom categories

## Troubleshooting

### Issue: "Unauthorized" error
**Solution**: Ensure you're logged in. Check session validity.

### Issue: "Forbidden: Admin access required"
**Solution**: Only admin users can add/edit/delete expenses. Contact an administrator.

### Issue: "Expense already exists for this month, year, and category"
**Solution**: Use the edit function to update the existing expense instead of creating a new one.

### Issue: Data not loading
**Solution**: Check browser console for errors. Verify API endpoints are accessible.

## Support

For issues or questions, please contact the development team or create an issue in the project repository.