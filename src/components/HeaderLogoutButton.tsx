import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { logout } from '../utils/auth';

export function HeaderLogoutButton() {
  return (
    <TouchableOpacity onPress={logout} style={{ paddingRight: 12 }}>
      <MaterialIcons name="logout" size={22} color="#fff" />
    </TouchableOpacity>
  );
}
