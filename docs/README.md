# App Configuration System

A database-driven configuration management system for storing and retrieving application settings dynamically.

## Quick Start

### 1. Apply Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Apply migration
npx prisma migrate dev --name add_app_config_table

# Or push schema directly (development)
npx prisma db push
```

### 2. Seed Initial Configuration

```bash
npm run seed:request-types
```

### 3. Use in Your Components

```typescript
import { useAppConfig } from '@/hooks/useAppConfig';

function MyComponent() {
  const { config, loading, error } = useAppConfig('request_types');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {config?.map(item => (
        <div key={item.value}>{item.label}</div>
      ))}
    </div>
  );
}
```

## Features

- ✅ **Database-Driven**: Store configuration in PostgreSQL with JSONB
- ✅ **Type-Safe**: Full TypeScript support with Zod validation
- ✅ **Authenticated**: All API endpoints require authentication
- ✅ **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE)
- ✅ **React Hook**: Easy integration with `useAppConfig` hook
- ✅ **Flexible**: Store any JSON configuration data

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config?key={key}` | Retrieve configuration |
| POST | `/api/config` | Create or update configuration |
| PUT | `/api/config` | Update existing configuration |
| DELETE | `/api/config?key={key}` | Delete configuration |

## Documentation

- [API Documentation](./CONFIG_API.md) - Complete API reference
- [Integration Guide](./INTEGRATION_GUIDE.md) - Step-by-step integration instructions

## Example: Request Types Configuration

```json
{
  "config_key": "request_types",
  "config_value": [
    {
      "value": "PLOT_SIZE_UPDATE",
      "label": "Plot Size Update",
      "icon": "User",
      "description": "Request to update your registered plot size",
      "enable": false
    },
    {
      "value": "PAYMENT_ISSUE",
      "label": "Payment Issue",
      "icon": "DollarSign",
      "description": "Report payment discrepancies or issues",
      "enable": true
    }
  ]
}
```

## Files Structure

```
├── src/
│   ├── app/api/config/route.ts          # API endpoints
│   ├── hooks/useAppConfig.ts             # React hook
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma client
│   │   ├── auth/auth-helpers.ts          # Auth utilities
│   │   └── validation/common.ts          # Zod schemas
│   └── types/index.ts                    # TypeScript types
├── prisma/schema.prisma                  # Database schema
├── scripts/seed-request-types.ts         # Seed script
└── docs/
    ├── README.md                         # This file
    ├── CONFIG_API.md                     # API docs
    └── INTEGRATION_GUIDE.md              # Integration guide
```

## TypeScript Types

```typescript
interface AppConfigItem {
  value: string;
  label: string;
  icon: string;
  description: string;
  enable: boolean;
}

interface AppConfig {
  id: number;
  config_key: string;
  config_value: AppConfigItem[];
  updated_at: string;
}
```

## Contributing

When adding new configuration types:

1. Define the TypeScript interface in `src/types/index.ts`
2. Create a Zod validation schema in `src/lib/validation/common.ts`
3. Create a seed script in `scripts/`
4. Update documentation

## License

MIT
