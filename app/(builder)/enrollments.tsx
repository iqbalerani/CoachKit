import EnrolledCoachesList from '../../components/EnrolledCoachesList';
import { COLORS } from '../../constants/colors';

export default function BuilderEnrollments() {
  return <EnrolledCoachesList accentColor={COLORS.accent} libraryRoute="/(builder)/library" />;
}
