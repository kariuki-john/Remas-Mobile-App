import { useEffect, useState } from 'react';
import LoginScreen from './login';
import SplashScreen from './splashScreenView';

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
    </>
  );
}
