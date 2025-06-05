import { useEffect, useState } from 'react';
import LoginScreen from './login';
import SplashScreen from './splashScreenView';
import Toast from 'react-native-toast-message';


export default function Index() {
  const [isShowSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 3000); 
  }, []);

  return (
    <>
      {isShowSplash ? <SplashScreen /> : <LoginScreen />}
      <Toast />
    </>
  );
}
