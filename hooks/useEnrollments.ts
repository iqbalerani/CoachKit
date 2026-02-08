import { useState, useEffect, useCallback } from 'react';
import { Coach, EnrollmentRecord } from '../types';
import { getEnrollments, enrollCoach, unenrollCoach } from '../services/storage';
import { useCoaches } from './useCoaches';

export function useEnrollments() {
  const { getCoachById } = useCoaches();
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEnrollments = useCallback(async () => {
    const data = await getEnrollments();
    setEnrollments(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const enrolledCoaches: Coach[] = enrollments
    .map(e => getCoachById(e.coachId))
    .filter((c): c is Coach => c !== undefined);

  const enroll = useCallback(async (coachId: string) => {
    await enrollCoach(coachId);
    await loadEnrollments();
  }, [loadEnrollments]);

  const unenroll = useCallback(async (coachId: string) => {
    await unenrollCoach(coachId);
    await loadEnrollments();
  }, [loadEnrollments]);

  const isEnrolled = useCallback((coachId: string): boolean => {
    return enrollments.some(e => e.coachId === coachId);
  }, [enrollments]);

  return {
    enrollments,
    enrolledCoaches,
    isLoading,
    enroll,
    unenroll,
    isEnrolled,
    refresh: loadEnrollments,
  };
}
