import { getActiveUsers } from '@/lib/queries';
import NotificationForm from './NotificationForm';

export default async function SendNotificationPage() {
  const users = await getActiveUsers();
  return <NotificationForm users={users} />;
}