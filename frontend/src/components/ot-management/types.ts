import { OtRecord } from '../../types';
import { ReviewDecision } from './useReviewOtRecord';

/** Props shared by the desktop table and the mobile list. */
export interface OtRecordsViewProps {
  records: OtRecord[];
  canReview: (record: OtRecord) => boolean;
  isReviewing: (id: number) => boolean;
  onView: (record: OtRecord) => void;
  onReview: (id: number, status: ReviewDecision) => void;
}
