import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ContactScreen from '../screens/ContactScreen';
import WaterMonitoringScreen from '../screens/WaterMonitoringScreen';
import TankLoadingScreen from '../screens/TankLoadingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

// Auth Stack (used as a nested screen in the RootStack)
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0891b2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator (registered as 'MainTabs' in the RootStack)
const MainTabs = () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  const { useSafeAreaInsets } = require('react-native-safe-area-context');
  const insets = useSafeAreaInsets();
  const { logout } = require('../utils/auth');
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'menu-book'; // User Guide tab uses a book icon
              break;
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Monitor':
              iconName = 'opacity'; // water droplet icon in MaterialIcons
              break;
            case 'Contact':
              iconName = 'contact-mail';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 5,
          paddingBottom: Math.max(insets.bottom, 6),
          height: 56 + insets.bottom,
        },
        tabBarLabelStyle: {
          marginBottom: insets.bottom ? 2 : 0,
        },
        headerStyle: {
          backgroundColor: '#0891b2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ paddingRight: 12 }}>
            <MaterialIcons name="logout" size={22} color="#fff" />
          </TouchableOpacity>
        ),
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Monitor" component={WaterMonitoringScreen} options={{ title: 'Water Monitor' }} />
      <Tab.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Us' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'User Guide', tabBarLabel: 'User Guide' }} />
    </Tab.Navigator>
  );
};

// Root navigator that registers both AuthStack and MainTabs as routes
const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Loading">
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="Loading" component={TankLoadingScreen} />
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
