import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import AccountsDisabledNotice from "../components/auth/AccountsDisabledNotice";
import FindFriendsPanel from "../components/social/FindFriendsPanel";
import FriendsPanel from "../components/social/FriendsPanel";
import MessagesPanel from "../components/social/MessagesPanel";
import { useSessionAuth } from "../hooks/useSessionAuth";
import { useGetFriends } from "../hooks/useSocialFriends";
import { useTranslation } from "../hooks/useTranslation";

export default function Social() {
  const { isAuthenticated } = useSessionAuth();
  const [activeTab, setActiveTab] = useState("friends");
  const { t } = useTranslation();
  const { data: friends, isLoading: friendsLoading } = useGetFriends();

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
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">
              {t("social.title")}
            </h1>
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-700"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">{t("social.subtitle")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" data-ocid="social.friends.tab">
              {t("social.friends")}
            </TabsTrigger>
            <TabsTrigger value="find" data-ocid="social.find_friends.tab">
              Find Friends
            </TabsTrigger>
            <TabsTrigger value="messages" data-ocid="social.messages.tab">
              {t("social.messages")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <FriendsPanel />
          </TabsContent>

          <TabsContent value="find" className="mt-6">
            <FindFriendsPanel />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <MessagesPanel
              friends={friends ?? []}
              friendsLoading={friendsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
