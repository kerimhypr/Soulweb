import { Dashboard } from '@/components/dashboard';
import { SetupScreen } from '@/components/setup-screen';
import { getConnectionStatus } from '@/lib/soulseek/client';
import { getConnection } from '@/lib/config/connection';
export default async function Page() { const status = await getConnectionStatus(getConnection()); return status.mode === 'unconfigured' ? <SetupScreen /> : <Dashboard />; }
