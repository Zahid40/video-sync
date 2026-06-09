"use server";

import { createClient } from "@/lib/server";
import { UserType } from "@/types/type";
import { getUser } from "./user.action";
import { ApiResponseType } from "@/types/api.response.type";

export const getFriendsList = async (): Promise<UserType[]> => {
  const supabaseClient = await createClient();
  const { data: userData, error: authenticationError } =
    await supabaseClient.auth.getUser();
  const user = userData?.user;

  if (authenticationError || !user?.id) {
    return [] as UserType[];
  }

  const { data: profileData, error: profileError } = await supabaseClient
    .from("friendships")
    .select("*, profiles!friend_id_fkey(id, display_name, email, avatar_url)")
    .eq("user_id", user.id);

  if (profileError || !profileData) {
    return [] as UserType[];
  }

  return (profileData || []).map((f: any) => {
    const p = f.profiles;
    return {
      ...p,
      username: p?.display_name || "",
    } as UserType;
  });
};

export const getAllProfiles = async (): Promise<UserType[]> => {
  const supabaseClient = await createClient();
  // optional: you may want to restrict this to authenticated users
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, display_name, avatar_url");

  if (error) {
    throw error;
  }

  return (data || []).map((p: any) => ({
    ...p,
    username: p.display_name,
  })) as UserType[];
};

/**
 * addFriend:
 * - Accepts the current authenticated user as sender and p_targetId as recipient.
 * - Inserts/updates friend_requests row (sender_id, recipient_id) => 'pending'.
 * - If reciprocal pending request exists (recipient had already sent request), we immediately create friendship and mark both requests accepted.
 * - Uses a small transaction via pg function or an upsert pattern. Here we rely on simple queries and idempotent inserts using canonicalization trigger on friendships.
 */
export const addFriend = async (
  targetProfileId: string
): Promise<ApiResponseType> => {
  if (!targetProfileId)
    return { success: false, message: "targetProfileId required" };
  const supabaseClient = await createClient();
  const user = await getUser();
  const senderId = user.id;
  const recipientId = targetProfileId;

  if (senderId === recipientId)
    return { success: false, message: "Cannot friend yourself" };

  // Insert or update friend request to pending
  const { error: upsertError } = await supabaseClient
    .from("friend_requests")
    .upsert(
      {
        sender_id: senderId,
        recipient_id: recipientId,
        status: "pending",
        sent_at: new Date().toISOString(),
      },
      { onConflict: "sender_id,recipient_id" }
    );

  if (upsertError) {
    return { success: false, message: upsertError.message };
  }

  // Check for reciprocal pending request (recipient already sent to sender)
  const { data: reciprocal, error: reciprocalError } = await supabaseClient
    .from("friend_requests")
    .select("sender_id, recipient_id, status")
    .eq("sender_id", recipientId)
    .eq("recipient_id", senderId)
    .single();

  if (reciprocalError && reciprocalError.code !== "PGRST116") {
    // PGRST116 or 404-like single error means no reciprocal; ignore that specific case
    // but surface other errors
    return { success: false, message: reciprocalError.message };
  }

  // If reciprocal exists and is pending, create friendship and mark both accepted
  if (reciprocal && reciprocal.status === "pending") {
    // create friendship (use canonical ordering, primary key conflicts ignored)
    const { error: insertFriendError } = await supabaseClient
      .from("friendships")
      .insert([{ user_id: senderId, friend_id: recipientId }])
      .maybeSingle();

    if (insertFriendError) {
      return { success: false, message: insertFriendError.message };
    }

    // update both requests to accepted
    const { error: updateError } = await supabaseClient
      .from("friend_requests")
      .update({ status: "accepted" })
      .in("sender_id", [senderId, recipientId])
      .in("recipient_id", [senderId, recipientId]);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return { success: true, message: "Friendship established" };
  }

  // Otherwise request created/updated to pending
  return { success: true, message: "Friend request sent" };
};

/**
 * removeFriend:
 * - Removes friendship row between the authenticated user and targetProfileId (both orderings).
 * - Also optionally deletes any friend_requests between them.
 */
export const removeFriend = async (
  targetProfileId: string
): Promise<{ success: boolean; message?: string }> => {
  if (!targetProfileId)
    return { success: false, message: "targetProfileId required" };

  const supabaseClient = await createClient();
  const { data: userData, error: authError } =
    await supabaseClient.auth.getUser();
  const user = userData?.user;
  if (authError || !user?.id)
    return { success: false, message: "Not authenticated" };

  const idA = user.id;
  const idB = targetProfileId;

  if (idA === idB) return { success: false, message: "Cannot remove yourself" };

  // Because friendships are canonicalized (user_id < friend_id),
  // compute canonical ordering in JS to delete the single row.
  const [user_id, friend_id] = idA < idB ? [idA, idB] : [idB, idA];

  // Delete friendship
  const { error: deleteError } = await supabaseClient
    .from("friendships")
    .delete()
    .match({ user_id, friend_id });

  if (deleteError) {
    return { success: false, message: deleteError.message };
  }

  // Optionally remove any friend_requests between them
  const { error: deleteRequestsError } = await supabaseClient
    .from("friend_requests")
    .delete()
    .or(
      `and(sender_id.eq.${idA},recipient_id.eq.${idB}),and(sender_id.eq.${idB},recipient_id.eq.${idA})`
    );

  if (deleteRequestsError) {
    // non-fatal
    console.warn("Failed to delete friend requests:", deleteRequestsError);
  }

  return { success: true, message: "Friend removed" };
};

export const getAllUsers = async (): Promise<UserType[]> => {
  const user = await getUser();
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .not("id", "eq", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  
  return (profiles || []).map((p: any) => ({
    ...p,
    username: p.display_name,
  })) as UserType[];
};
