"use client";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { UserType } from "@/types/type";
import { useUser } from "../provider/user-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "../user-avatar";
import { logoutUser } from "@/action/user/user.action";
import React, { useState, useEffect } from "react";
import { getAllUsers } from "@/action/user/profile.action";
import FriendProfileUser from "./friend-profile-user";
import { ScrollArea } from "../ui/scroll-area";
import { UserProfileForm } from "@/components/user-profile-form";
import { UserSecuritySettings } from "@/components/user-security-settings";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";


// Main NavUser Dialog
export function NavUser() {
  const { user } = useUser();

  const tabData = [
    { 
      label: "Profile", 
      value: "tab-profile", 
      content: <UserProfileForm /> 
    },
    { 
      label: "Security", 
      value: "tab-security", 
      content: (
        <div className="flex flex-col gap-6">
          <UserSecuritySettings />
          <DeleteAccountDialog />
        </div>
      ) 
    },
    {
      label: "Friends",
      value: "tab-2",
      content: <UserFriends />,
    },
    {
      label: "Rooms",
      value: "tab-3",
      content: <UserRooms userId={user?.id} />,
    },
  ];

  if (!user) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-full">
          <UserAvatar user={user} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-4xl h-[650px] p-0 bg-background border border-border sm:rounded-3xl overflow-hidden shadow-2xl flex flex-row"
        aria-describedby={"Profile Dialog"}
      >
        <Tabs
          defaultValue="tab-profile"
          orientation="vertical"
          className="w-full h-full flex flex-row"
        >
          <TabsList className="flex-col justify-between h-full bg-muted/30 p-3 border-r border-border min-w-40 gap-1.5 rounded-none">
            <div className="flex flex-col gap-1.5 w-full">
              {tabData.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full text-left justify-start px-3 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-sm transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={logoutUser}
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive px-3 py-2.5 rounded-xl gap-2 mt-auto text-sm font-semibold"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </TabsList>
          <div className="flex-1 text-start p-6 overflow-y-auto bg-background">
            {tabData.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="h-full mt-0 focus-visible:outline-hidden">
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Example tab content components
const UserFriends = () => {
  // const friends = getFriendsList();
  const [activeTab, setActiveTab] = useState("friends");
  const [allUsers, setAllUsers] = useState<UserType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [friends, setFriends] = useState<UserType[] | null>(null);
  const [requests, setRequests] = useState<UserType[] | null>(null);
  

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllUsers()
      .then((data) => {
        if (mounted) setAllUsers(data);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        if (mounted) setError(String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Friends List</h2>
      <Tabs defaultValue="friends" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>
        <TabsContent value="friends">
          {/* Friends List Content */}
          <div>
            {friends && friends.length > 0 ? (
              <ul className="space-y-2">
                {friends.map((friend) => (
                  <li key={friend.id} className="p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={friend} className="size-8" />
                      <span className="font-medium">{friend.username}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No friends found.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="requests">
          {/* Friend Requests Content */}
          <div>Show friend requests here using userId</div>
        </TabsContent>
        <TabsContent value="all">
          {/* All Users Content */}
          <ScrollArea className="h-96">
            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : allUsers && allUsers.length > 0 ? (
              <ul className="space-y-2">
                {allUsers.map((user) => (
                  <FriendProfileUser key={user.id} user={user} type="sent" />
                ))}
              </ul>
            ) : (
              <p>No users found.</p>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const UserRooms = ({ userId }: { userId: string }) => (
  <div>Show user&apos;s subscription or packages here using userId</div>
);
