import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionAuth } from '../hooks/useSessionAuth';
import FriendsPanel from '../components/social/FriendsPanel';
import MessagesPanel from '../components/social/MessagesPanel';
import PartiesPanel from '../components/social/PartiesPanel';
import FollowingPanel from '../components/social/FollowingPanel';
import AccountsDisabledNotice from '../components/auth/AccountsDisabledNotice';

export default function Social() {
  const { isAuthenticated } = useSessionAuth();
  const [activeTab, setActiveTab] = useState('friends');

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <AccountsDisabledNotice />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Social</h1>
          <p className="text-muted-foreground mt-2">
            Connect with friends and the Dini.Verse community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <FriendsPanel />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <MessagesPanel />
          </TabsContent>

          <TabsContent value="parties" className="mt-6">
            <PartiesPanel />
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <FollowingPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
