// /lib/server/auth.ts
"use server";

import { createClient } from "@/lib/server";
import { UserType } from "@/types/type";
import { redirect } from "next/navigation";

export const getUser = async (): Promise<UserType> => {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authUser = authData?.user;
  
  if (authError || !authUser?.id) {
    return {} as UserType;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    return {} as UserType;
  }

  // Spread profile first, then add User fields
  return {
    ...profile,       // fields from "profiles"
    ...authUser       // Supabase auth user fields
  } as UserType;
};


export const logoutUser = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
};

type UpdateUserInput = Partial<
  Omit<UserType, "id" | "created_at" | "updated_at">
>;

export const updateUser = async (updates: UpdateUserInput): Promise<UserType> => {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authUser = authData?.user;

  if (authError || !authUser?.id) {
    return {} as UserType;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", authUser.id)
    .select("*")
    .single();

  if (error || !profile) {
    throw new Error(error?.message || "Profile update failed");
  }

  // Always return merged object
  return {
    ...profile,
    ...authUser
  } as UserType;
};
