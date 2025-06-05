import React from "react";
import { View, Image } from "react-native";


export default function SplashScreen() {
  return (
   
    
      <View style={{  justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
        <Image
          source={require("../assets/images/splash.png")}
            style={{ width: "100%", height: "100%",position: "absolute", top: 0, left: 0,backgroundColor:'white' }}
            resizeMode="cover"
            
        />
        
      </View>
    
  );
}
