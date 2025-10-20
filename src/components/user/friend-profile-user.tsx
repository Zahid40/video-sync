import { UserType } from "@/types/type";
import React from "react";
import UserAvatar from "../user-avatar";
import { Button } from "../ui/button";
import { addFriend } from "@/action/user/profile.action";
import { toast } from "sonner";

export default function FriendProfileUser(props: {
  user: UserType;
  type: "friend" | "request" | "sent";
}) {
  return (
    <div className="border p-4 rounded-xl bg-primary/5 flex justify-between">
      <div className="flex items-center gap-2">
        <UserAvatar user={props.user} className="size-10" />
        <div className="flex flex-col">
          <p className="font-medium text-sm">{props.user.username}</p>
        </div>
      </div>
      <div>
        {props.type === "request" && (
          <div className=" flex gap-2">
            <Button variant={"secondary"}>Accept</Button>
            <Button variant={"destructive"}>Decline</Button>
          </div>
        )}
        {props.type === "sent" && (
          <div className="">
            <Button
              variant="outline"
              onClick={async () => {
                const result = await addFriend(props.user.id);
                if (result.success) {
                  toast.success("Friend request sent");
                } else {
                  toast.error(
                    "Failed to send friend request: " + result.message
                  );
                }
              }}
            >
              Request
            </Button>
          </div>
        )}
        {props.type === "friend" && (
          <div className="">
            <Button variant="destructive">Remove Friend</Button>
          </div>
        )}
      </div>
    </div>
  );
}
