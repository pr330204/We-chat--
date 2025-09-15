import { getUser } from '@/lib/firestore';
import ChatPageClient from './page-client';

export default async function ChatPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  return <ChatPageClient user={user} />;
}
