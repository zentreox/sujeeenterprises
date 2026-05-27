import { supabase as typedClient } from "@/integrations/supabase/client";
export const supabase = typedClient as any;
export type Database = any;
export type Json = any;
