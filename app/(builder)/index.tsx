import DashboardHome from '../../components/DashboardHome';
import { COLORS } from '../../constants/colors';

export default function BuilderHome() {
  return <DashboardHome accentColor={COLORS.accent} showCreateLink={true} />;
}
