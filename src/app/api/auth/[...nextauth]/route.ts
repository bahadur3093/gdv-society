import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

// Re-export authConfig for backward compatibility
export { authConfig as authOptions } from '@/lib/auth';