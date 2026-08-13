import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile, ProfileInput } from '@/types';

export async function updateProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    mutateAsync: async (args: { userId: string; input: ProfileInput }) => {
      setIsPending(true);
      try {
        const data = await updateProfile(args.userId, args.input);
        queryClient.invalidateQueries({ queryKey: ['profile', args.userId] });
        return data;
      } finally {
        setIsPending(false);
      }
    },
  };
}
