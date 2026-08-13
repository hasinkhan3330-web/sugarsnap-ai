import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { FoodLog, FoodLogInput, FoodLogItemInput } from '@/types';

export async function fetchFoodLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<FoodLog[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*, food_log_items(*)')
    .eq('user_id', userId)
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)
    .order('logged_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useFoodLogs(userId: string | undefined, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return useQuery({
    queryKey: ['foodLogs', userId, start.toISOString()],
    queryFn: () => fetchFoodLogs(userId!, start.toISOString(), end.toISOString()),
    enabled: !!userId,
  });
}

export async function createFoodLogWithItems(
  input: FoodLogInput,
  items: Omit<FoodLogItemInput, 'food_log_id'>[]
): Promise<FoodLog> {
  const { data: log, error: logError } = await supabase
    .from('food_logs')
    .insert({
      logged_at: input.logged_at,
      meal_type: input.meal_type,
      image_path: input.image_path ?? null,
      source: input.source,
      total_calories: input.total_calories,
      total_protein_g: input.total_protein_g,
      total_carbs_g: input.total_carbs_g,
      total_fat_g: input.total_fat_g,
      total_fiber_g: input.total_fiber_g,
      total_sugar_g: input.total_sugar_g,
      total_added_sugar_g: input.total_added_sugar_g,
      ai_confidence: input.ai_confidence ?? null,
    })
    .select()
    .single();
  if (logError) throw logError;

  if (items.length > 0) {
    const itemsWithLogId = items.map((item) => ({ ...item, food_log_id: log.id }));
    const { error: itemsError } = await supabase
      .from('food_log_items')
      .insert(itemsWithLogId);
    if (itemsError) throw itemsError;
  }

  return log;
}

export function useCreateFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { input: FoodLogInput; items: Omit<FoodLogItemInput, 'food_log_id'>[] }) =>
      createFoodLogWithItems(args.input, args.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
    },
  });
}

export async function deleteFoodLog(logId: string): Promise<void> {
  const { error } = await supabase.from('food_logs').delete().eq('id', logId);
  if (error) throw error;
}

export function useDeleteFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFoodLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
    },
  });
}

export async function updateFoodLog(
  logId: string,
  updates: Partial<FoodLogInput>
): Promise<FoodLog> {
  const { data, error } = await supabase
    .from('food_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function useUpdateFoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { logId: string; updates: Partial<FoodLogInput> }) =>
      updateFoodLog(args.logId, args.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
    },
  });
}
