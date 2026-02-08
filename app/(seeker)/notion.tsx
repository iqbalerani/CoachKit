import { View, StyleSheet } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import NotionHub from '../../components/NotionHub';
import { COLORS } from '../../constants/colors';

export default function SeekerNotion() {
  return (
    <View style={styles.container}>
      <BrandHeader />
      <NotionHub />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
