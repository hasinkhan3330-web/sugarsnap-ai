import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CustomFood, CustomFoodInput } from '@/types';

export async function fetchCustomFoods(userId: string): Promise<CustomFood[]> {
  const { data, error } = await supabase
    .from('custom_foods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useCustomFoods(userId: string | undefined) {
  return useQuery({
    queryKey: ['customFoods', userId],
    queryFn: () => fetchCustomFoods(userId!),
    enabled: !!userId,
  });
}

export async function createCustomFood(
  userId: string,
  input: CustomFoodInput
): Promise<CustomFood> {
  const { data, error } = await supabase
    .from('custom_foods')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function useCreateCustomFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { userId: string; input: CustomFoodInput }) =>
      createCustomFood(args.userId, args.input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFoods'] });
    },
  });
}

export async function deleteCustomFood(id: string): Promise<void> {
  const { error } = await supabase.from('custom_foods').delete().eq('id', id);
  if (error) throw error;
}

export function useDeleteCustomFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomFood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFoods'] });
    },
  });
}
