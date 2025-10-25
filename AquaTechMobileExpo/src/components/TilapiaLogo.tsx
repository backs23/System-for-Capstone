import { Image, StyleSheet, View } from 'react-native';

// Helper component to render the TilapiaSync logo image where needed
// Place the uploaded logo at assets/tilapia-logo.png
export function TilapiaLogo({ size = 64 }: { size?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const src = require('../../assets/tilapia-logo.png');
  return (
    <View style={styles.container}>
      <Image source={src} style={{ width: size, height: size, resizeMode: 'contain' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
