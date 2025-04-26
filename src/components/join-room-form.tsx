"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Switch } from "@/components/ui/switch"; // assuming you have a Switch component

const formSchema = z.object({
  roomid: z.string().min(1).min(5),
  url: z.string().optional(),
  joinLink: z.string().optional(),
});

export default function JoinRoomForm() {
  const [isJoining, setIsJoining] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomid: "",
      url: "",
      joinLink: "",
    },
  });

  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isJoining) {
        if (!values.joinLink) {
          toast.error("Please provide a join link.");
          return;
        }
        router.push(values.joinLink);
      } else {
        router.push(
          `/room/${values.roomid}?url=${encodeURIComponent(values.url || "")}`
        );
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="border border-dashed bg-secondary/10 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-lg font-semibold">{isJoining ? "Join Room" : "Create Room"}</p>
          <p className="text-sm text-muted-foreground">
            {isJoining
              ? "Enter the room link to join an existing room."
              : "Create a new room by filling the form."}
          </p>
        </div>
        <Switch checked={isJoining} onCheckedChange={setIsJoining} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isJoining ? (
            <FormField
              control={form.control}
              name="joinLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Join Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paste room join link"
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="roomid"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Room Name"
                        className="border shadow-none focus-visible:ring-0 text-3xl md:text-3xl py-6 bg-background"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Video URL{" "}
                      <span className="text-xs text-neutral-500 px-2">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="https://youtu.be/Bdmh9eRUz8g?si=BOra1yAHFobpLqT8"
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormDescription>
                      {/* Only mp4 for now if you want. */}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" className="w-full py-8 text-lg font-semibold " >
            {isJoining ? "Join Room 🚀" : "Create Room 😎"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
