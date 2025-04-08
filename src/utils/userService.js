import { supabase } from "../supabase.js";

export async function getUserByPhoneNumber(phoneNumber) {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("phonenumber", phoneNumber)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

// 1. Get the current maximum userid
export async function getNextUserId() {
  const { data, error } = await supabase
    .from("User")
    .select("userid")
    .order("userid", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching max userid:", error);
    return null;
  }

  return data.userid + 1;
}

// 2. Insert new user manually with provided userid
export async function createUserWithPhone(phoneNumber) {
  const nextUserId = await getNextUserId();

  if (!nextUserId) return null;

  const { data, error } = await supabase
    .from("User")
    .insert([
      {
        userid: nextUserId,
        phonenumber: phoneNumber,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error inserting user:", error);
    return null;
  }

  return data;
}

export async function updateUser(userid, updates) {
  const { data, error } = await supabase
    .from("User")
    .update(updates)
    .eq("userid", userid)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data;
}
