"use client";
import { LogOut, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { Calendar, Clock, Edit } from "iconsax-react";
import { Separator } from "../ui/separator";
import { FaQuestion } from "react-icons/fa";
import { format, formatDistance, subDays } from "date-fns";
import { UserType } from "@/types/type";
import { useUser } from "../provider/user-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAvatar from "../user-avatar";
import { logoutUser, updateUser } from "@/action/user/user.action";
import React, { useState, useEffect } from "react";
import { getAllUsers, getFriendsList } from "@/action/user/profile.action";
import FriendProfileUser from "./friend-profile-user";
import { ScrollArea } from "../ui/scroll-area";

// Editable User Info Tab
const UserInfo = ({ user }: { user: UserType }) => {
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    await updateUser({
      username: formData.username,
    });
    setEditable(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <UserAvatar user={user} className="size-32" isEditable />
      </div>
      <h2 className="text-2xl font-semibold tracking-wide">
        {!editable ? (
          user?.username
        ) : (
          <input
            type="text"
            name="username"
            value={formData.username}
            className="border rounded px-2 py-1"
            onChange={handleChange}
          />
        )}
      </h2>
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Email</span>
          </div>

          <span className="text-sm">{user?.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Created At</span>
          </div>
          <span className="text-sm">
            {format(new Date(user?.created_at), "dd MMM yyyy")}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col justify-between items-center w-full gap-6">
        <div className="flex flex-row gap-4 w-full">
          {editable ? (
            <>
              <Button
                variant="default"
                className="flex items-center gap-2 w-full"
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setEditable(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="flex items-center gap-2 w-full"
                onClick={() => setEditable(true)}
              >
                <Edit className="size-6" />
                Edit
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={logoutUser}
              >
                <LogOut className="size-6" />
                Logout
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
          <Clock className="size-3" />
          last updated{" "}
          {formatDistance(subDays(new Date(user?.updated_at!), 0), new Date(), {
            addSuffix: true,
          })}
        </div>
      </div>
    </div>
  );
};

// Main NavUser Dialog
export function NavUser() {
  const { user } = useUser();

  const tabData = [
    { label: "Profile", value: "tab-1", content: <UserInfo user={user} /> },
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
        className="aspect-square w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl p-1 bg-primary-950"
        aria-describedby={"Profile Dialog"}
      >
        <Tabs
          defaultValue="tab-1"
          orientation="vertical"
          className="w-full flex-row"
        >
          <TabsList className="flex-col h-full bg-primary-950">
            {tabData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full min-w-12"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="grow rounded-md border text-start p-4">
            {tabData.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
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
  <div>Show user's subscription or packages here using userId</div>
);
