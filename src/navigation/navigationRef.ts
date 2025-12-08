import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function resetToMainTabs() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] })
    );
  }
}

export function resetToLoading() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Loading' as never }] })
    );
  }
}

export function resetToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' as never }] })
    );
  }
}
