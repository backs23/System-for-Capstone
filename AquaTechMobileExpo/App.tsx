import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/styles/commonStyles';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={colors.primary}
      />
      <AppNavigator />
    </>
  );
}

export default App;
