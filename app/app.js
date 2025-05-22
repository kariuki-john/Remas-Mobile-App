import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from './ThemeContext'; 


const Stack = createStackNavigator();

const App = () => {
  const { theme } = useTheme(); 
  const darkTheme = {
    dark: true,
    colors: {
      primary: '#1f1f1f',
      background: '#121212',
      card: '#333333',
      text: '#fff',
      border: '#444444',
      notification: '#ff0000',
    },
  };

  const lightTheme = {
    dark: false,
    colors: {
      primary: '#ffffff',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#000000',
      border: '#ddd',
      notification: '#ff0000',
    },
  };

  return (
  
    <ThemeProvider>
      <App />
    </ThemeProvider>
    
  );
};

export default App;
