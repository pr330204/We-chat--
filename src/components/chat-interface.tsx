"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AppUser, ChatMessage } from '@/lib/types';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { sendMessage, streamMessages } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export default function ChatInterface({ recipient }: { recipient: AppUser }) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    const chatId = [currentUser.uid, recipient.uid].sort().join('-');
    const unsubscribe = streamMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [currentUser, recipient.uid]);

  useEffect(() => {
    if (scrollAreaViewport.current) {
        scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
        text: newMessage,
        from: currentUser.uid,
        to: recipient.uid,
      };
      await sendMessage(currentUser.uid, recipient.uid, message.text);
      setNewMessage('');
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      <ScrollArea className="flex-grow p-4" viewportRef={scrollAreaViewport}>
        <div className="space-y-6">
          {messages.map((message) => {
            const isMe = message.from === currentUser?.uid;
            const sender = isMe ? currentUser : recipient;
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sender.photoURL} />
                    <AvatarFallback>{sender.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
            disabled={!currentUser}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || !currentUser}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
