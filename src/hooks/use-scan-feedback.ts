import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ScanFeedbackInput {
  foodLogId?: string | null;
  originalAiResponse?: Record<string, unknown> | null;
  correctedItems?: Record<string, unknown> | null;
  helpful?: boolean | null;
}

export async function createScanFeedback(
  userId: string,
  input: ScanFeedbackInput
): Promise<void> {
  const { error } = await supabase.from('scan_feedback').insert({
    user_id: userId,
    food_log_id: input.foodLogId ?? null,
    original_ai_response: input.originalAiResponse ?? null,
    corrected_items: input.correctedItems ?? null,
    helpful: input.helpful ?? null,
  });
  if (error) throw error;
}

export function useCreateScanFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { userId: string; input: ScanFeedbackInput }) =>
      createScanFeedback(args.userId, args.input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanFeedback'] });
    },
  });
}
