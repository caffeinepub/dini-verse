import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search } from 'lucide-react';
import { useSearchUsers } from '../../hooks/useUserDiscovery';
import { useSendMessage, useGetMessages } from '../../hooks/useSocialMessages';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MessagesPanel() {
  const [selectedRecipient, setSelectedRecipient] = useState<Principal | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { identity } = useInternetIdentity();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchTerm);
  const { data: messages, isLoading: messagesLoading } = useGetMessages(selectedRecipient);
  const sendMessageMutation = useSendMessage();

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleSendMessage = async () => {
    if (!selectedRecipient || !messageContent.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        receiver: selectedRecipient,
        content: messageContent.trim(),
      });
      setMessageContent('');
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const filteredSearchResults = searchResults?.filter(
    ([principal]) => principal.toString() !== currentPrincipal
  );

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Select a user to message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchTerm && (
            <div className="space-y-2">
              {searchLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredSearchResults && filteredSearchResults.length > 0 ? (
                filteredSearchResults.map(([principal, user]) => (
                  <button
                    key={principal.toString()}
                    onClick={() => {
                      setSelectedRecipient(principal);
                      setSearchTerm('');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      {user.avatar && (
                        <AvatarImage src={user.avatar.getDirectURL()} alt={user.displayName} />
                      )}
                      <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.displayName}</div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              )}
            </div>
          )}

          {!searchTerm && !selectedRecipient && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Search for a user to start a conversation
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedRecipient ? <RecipientHeader principal={selectedRecipient} /> : 'Messages'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedRecipient ? (
            <div className="text-center py-16 text-muted-foreground">
              Select a user to view messages
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                {messagesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <MessageItem
                        key={message.id.toString()}
                        message={message}
                        isOwn={message.sender.toString() === currentPrincipal}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RecipientHeader({ principal }: { principal: Principal }) {
  const { data: user } = useGetUserProfile(principal);
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        {user?.avatar && (
          <AvatarImage src={user.avatar.getDirectURL()} alt={user.displayName} />
        )}
        <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <span>{user?.displayName || 'Unknown User'}</span>
    </div>
  );
}

function MessageItem({ message, isOwn }: { message: any; isOwn: boolean }) {
  const { data: sender } = useGetUserProfile(message.sender);

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        {sender?.avatar && (
          <AvatarImage src={sender.avatar.getDirectURL()} alt={sender.displayName} />
        )}
        <AvatarFallback>{sender?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
        <div className="text-xs text-muted-foreground mb-1">
          {sender?.displayName || 'Unknown User'}
        </div>
        <div
          className={`inline-block p-3 rounded-lg ${
            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
