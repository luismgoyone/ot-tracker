import { useCallback, useState } from 'react';
import { useUpdateOtStatus } from '../../api/otRecords';
import { getErrorMessage } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { OtRecord, OtStatus } from '../../types';

export type ReviewDecision = OtStatus.APPROVED | OtStatus.REJECTED;

/**
 * Approve/reject OT records, tracking which rows have a request in flight
 * and surfacing API failures (403 own/other department, 409 already decided).
 */
export function useReviewOtRecord() {
  const user = useAuthStore((s) => s.user);
  const { mutateAsync } = useUpdateOtStatus();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  /** Resolves to true when the decision was saved. */
  const review = useCallback(
    async (id: number, status: ReviewDecision) => {
      setPendingIds((ids) => new Set(ids).add(id));
      try {
        await mutateAsync({ id, status });
        return true;
      } catch (err) {
        const action = status === OtStatus.APPROVED ? 'approve' : 'reject';
        setError(getErrorMessage(err, `Failed to ${action} the OT record.`));
        return false;
      } finally {
        setPendingIds((ids) => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
      }
    },
    [mutateAsync],
  );

  /** The API forbids reviewing your own records, so only pending records of others are reviewable. */
  const canReview = useCallback(
    (record: OtRecord) => record.status === OtStatus.PENDING && record.userId !== user?.id,
    [user?.id],
  );

  const isReviewing = useCallback((id: number) => pendingIds.has(id), [pendingIds]);

  return { review, canReview, isReviewing, error, clearError: () => setError(null) };
}
