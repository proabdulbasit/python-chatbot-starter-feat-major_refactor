import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = ({
  url,
  privateKey,
}: {
  url?: string;
  privateKey?: string;
}) => {
  if (!url) throw new Error(`Missing environment variable SUPABASE_URL`);
  if (!privateKey)
    throw new Error(`Missing environment variable SUPABASE_PRIVATE_KEY`);

  const supabaseClient = createClient(url, privateKey);

  return supabaseClient;
};
