import EnrolledCoachesList from '../../components/EnrolledCoachesList';
import { COLORS } from '../../constants/colors';

export default function SeekerEnrollments() {
  return <EnrolledCoachesList accentColor={COLORS.accent} libraryRoute="/(seeker)/coaches" />;
}
