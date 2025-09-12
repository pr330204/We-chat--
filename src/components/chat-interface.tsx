"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AppUser } from '@/lib/types';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const demoMessages = [
  { id: 1, sender: 'other', text: 'Hey, how are you doing?' },
  { id: 2, sender: 'me', text: 'I\'m doing great, thanks for asking! Just checking out Nexus Connect. It\'s pretty cool.' },
  { id: 3, sender: 'other', text: 'Awesome! Yeah, the AI-generated summaries are a nice touch.' },
  { id: 4, sender: 'other', text: 'Have you tried the follow feature yet?' },
  { id: 5, sender: 'me', text: 'I have! It\'s really useful for keeping track of people I find interesting.' },
];

export default function ChatInterface({ user }: { user: AppUser }) {
  const [messages, setMessages] = useState(demoMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), sender: 'me', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'other' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  message.sender === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
