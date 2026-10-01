import { createSupabaseAdminClient } from "@/lib/supabase";

// Устройство вышло на связь: время последнего сигнала видно на странице устройств.
export async function markSeen(deviceId: string) {
  const { error } = await createSupabaseAdminClient()
    .from("devices")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", deviceId);
  if (error != null) throw error;
}
