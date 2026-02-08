import DashboardHome from '../../components/DashboardHome';
import { COLORS } from '../../constants/colors';

export default function SeekerHome() {
  return <DashboardHome accentColor={COLORS.accent} showCreateLink={false} />;
}
