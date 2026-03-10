import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Film,
  MessageSquare,
  Paperclip,
  Send,
  Smile,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FriendInfo } from "../../hooks/useSocialFriends";
import {
  useDeleteMessage,
  useGetMessages,
  useSendGif,
  useSendMedia,
  useSendMessage,
} from "../../hooks/useSocialMessages";
import { getCurrentUser } from "../../utils/socialStorage";

const GIPHY_KEY = "dc6zaTOxFJmzC";

interface GiphyResult {
  id: string;
  images: {
    fixed_height_small: { url: string; width: string; height: string };
    original: { url: string };
  };
  title: string;
}

interface MessagesPanelProps {
  friends: FriendInfo[];
  friendsLoading?: boolean;
}

export default function MessagesPanel({
  friends,
  friendsLoading,
}: MessagesPanelProps) {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [showGiphy, setShowGiphy] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<GiphyResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const me = getCurrentUser();

  const { data: messages, isLoading: msgsLoading } =
    useGetMessages(selectedFriend);
  const sendMsg = useSendMessage();
  const sendMedia = useSendMedia();
  const sendGif = useSendGif();
  const deleteMsg = useDeleteMessage();

  // Auto scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async () => {
    if (!selectedFriend || !text.trim()) return;
    try {
      await sendMsg.mutateAsync({ to: selectedFriend, content: text.trim() });
      setText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFriend) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await sendMedia.mutateAsync({
          to: selectedFriend,
          dataUrl: ev.target?.result as string,
          mediaType: "image",
        });
      } catch {
        toast.error("Failed to send image");
      }
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFriend) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Video must be smaller than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await sendMedia.mutateAsync({
          to: selectedFriend,
          dataUrl: ev.target?.result as string,
          mediaType: "video",
        });
      } catch {
        toast.error("Failed to send video");
      }
    };
    reader.readAsDataURL(file);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const searchGiphy = async (query: string) => {
    if (!query.trim()) return;
    setGifLoading(true);
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=20`,
      );
      const data = await res.json();
      setGifResults(data.data || []);
    } catch {
      toast.error("Failed to load GIFs");
    } finally {
      setGifLoading(false);
    }
  };

  const handleSendGif = async (gif: GiphyResult) => {
    if (!selectedFriend) return;
    try {
      await sendGif.mutateAsync({
        to: selectedFriend,
        gifUrl: gif.images.fixed_height_small.url,
      });
      setShowGiphy(false);
      setGifSearch("");
      setGifResults([]);
    } catch {
      toast.error("Failed to send GIF");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!selectedFriend) return;
    try {
      await deleteMsg.mutateAsync({
        friendUsername: selectedFriend,
        messageId,
      });
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const selectedFriendInfo = friends.find((f) => f.username === selectedFriend);

  return (
    <div className="flex h-[600px] rounded-2xl border overflow-hidden bg-card">
      {/* Friend Sidebar */}
      <div className="w-72 border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Friends
          </h3>
        </div>
        <ScrollArea className="flex-1">
          {friendsLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div
              data-ocid="social.messages.empty_state"
              className="p-6 text-center text-muted-foreground text-sm"
            >
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Add friends to start chatting</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {friends.map((friend, idx) => (
                <button
                  key={friend.username}
                  type="button"
                  data-ocid={`social.messages.friend_item.${idx + 1}`}
                  onClick={() => setSelectedFriend(friend.username)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    selectedFriend === friend.username
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      {friend.avatarUrl && (
                        <AvatarImage
                          src={friend.avatarUrl}
                          alt={friend.displayName}
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {friend.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                        friend.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {friend.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{friend.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedFriend ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Select a friend to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  {selectedFriendInfo?.avatarUrl && (
                    <AvatarImage
                      src={selectedFriendInfo.avatarUrl}
                      alt={selectedFriendInfo.displayName}
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {(selectedFriendInfo?.displayName || selectedFriend)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                    selectedFriendInfo?.isOnline
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {selectedFriendInfo?.displayName || selectedFriend}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedFriendInfo?.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {msgsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-3/4" />
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, idx) => {
                    const isOwn = msg.sender === me;
                    if (msg.deleted) {
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs text-muted-foreground italic px-3 py-1.5 rounded-xl bg-muted/50">
                            [Message deleted]
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={msg.id}
                        data-ocid={`social.messages.delete_button.${idx + 1}`}
                        className={`group flex gap-2 items-end ${
                          isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        {!isOwn && (
                          <Avatar className="h-7 w-7 shrink-0">
                            {selectedFriendInfo?.avatarUrl && (
                              <AvatarImage
                                src={selectedFriendInfo.avatarUrl}
                                alt={selectedFriendInfo.displayName}
                              />
                            )}
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                              {(
                                selectedFriendInfo?.displayName ||
                                selectedFriend
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[65%] ${
                            isOwn ? "items-end" : "items-start"
                          } flex flex-col gap-1`}
                        >
                          {msg.type === "text" && (
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm break-words ${
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              {msg.content}
                            </div>
                          )}
                          {msg.type === "image" && (
                            <img
                              src={msg.content}
                              alt=""
                              className="max-w-full max-h-64 rounded-2xl object-cover"
                            />
                          )}
                          {msg.type === "video" && (
                            // biome-ignore lint/a11y/useMediaCaption: user-sent video
                            <video
                              src={msg.content}
                              controls
                              className="max-w-full max-h-64 rounded-2xl"
                            />
                          )}
                          {msg.type === "gif" && (
                            <div className="relative">
                              <img
                                src={msg.content}
                                alt="GIF"
                                className="max-w-full max-h-48 rounded-2xl"
                              />
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                GIF
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isOwn && (
                              <button
                                type="button"
                                onClick={() => handleDelete(msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                title="Delete message"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No messages yet. Say hello!</p>
                </div>
              )}
            </ScrollArea>

            {/* Giphy Panel */}
            {showGiphy && (
              <div className="border-t p-3 bg-muted/30">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Search GIFs..."
                    value={gifSearch}
                    onChange={(e) => setGifSearch(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && searchGiphy(gifSearch)
                    }
                    className="text-sm h-8"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => searchGiphy(gifSearch)}
                    className="h-8 shrink-0"
                  >
                    Search
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowGiphy(false);
                      setGifSearch("");
                      setGifResults([]);
                    }}
                    className="h-8 shrink-0"
                  >
                    ✕
                  </Button>
                </div>
                <ScrollArea className="h-36">
                  {gifLoading ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                      Loading GIFs...
                    </div>
                  ) : gifResults.length > 0 ? (
                    <div className="grid grid-cols-4 gap-1">
                      {gifResults.map((gif) => (
                        <button
                          key={gif.id}
                          type="button"
                          onClick={() => handleSendGif(gif)}
                          className="rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                        >
                          <img
                            src={gif.images.fixed_height_small.url}
                            alt={gif.title}
                            className="w-full h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                      {gifSearch ? "No GIFs found" : "Search for GIFs above"}
                    </div>
                  )}
                </ScrollArea>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  Powered by GIPHY
                </p>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                  className="flex-1"
                  data-ocid="social.messages.text.input"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => imageInputRef.current?.click()}
                  title="Send image"
                  data-ocid="social.messages.image.upload_button"
                  className="shrink-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => videoInputRef.current?.click()}
                  title="Send video"
                  data-ocid="social.messages.video.upload_button"
                  className="shrink-0"
                >
                  <Film className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowGiphy((p) => !p)}
                  title="Send GIF"
                  data-ocid="social.messages.gif.button"
                  className={`shrink-0 ${showGiphy ? "bg-accent" : ""}`}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSendText}
                  disabled={
                    !text.trim() || sendMsg.isPending || sendMedia.isPending
                  }
                  title="Send message"
                  data-ocid="social.messages.send_button"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Paperclip className="h-2.5 w-2.5" /> Image
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Film className="h-2.5 w-2.5" /> Video
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Smile className="h-2.5 w-2.5" /> GIF
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Max 10MB
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Re-export for compatibility
export type { MessagesPanelProps };
