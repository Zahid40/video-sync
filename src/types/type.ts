import { User } from "@supabase/supabase-js";
import { Tables } from "./db.types";

export type UserType = Tables<"profiles"> & User