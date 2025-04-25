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

const formSchema = z.object({
  roomid: z.string().min(1).min(5),
  url: z.string().min(1).min(5),
});

export default function JoinRoomForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      roomid: "",
      url: "",
    }
  });

  const router = useRouter();

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
      router.push(
        `/room/${values.roomid}?url=${encodeURIComponent(values.url || "")}`
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="border border-dashed bg-neutral-100 p-6 rounded-xl max-w-xl" >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 "
        >
          <FormField
            control={form.control}
            name="roomid"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Room Name</FormLabel> */}
                <FormControl>
                  <Input placeholder="Room Name" className="border-none shadow-none focus-visible:ring-0 text-3xl md:text-3xl" type="text" {...field} />
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
                <FormLabel>Video Url</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>
                <FormDescription>
                  ( currently only support .mp4 format ) if you are joining a room make sure video url must same as your friend
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
