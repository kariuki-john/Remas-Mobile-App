import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { useRouter, } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'
const router = useRouter();

const imgDir = FileSystem.documentDirectory + 'images/';



export default function RegisterScreen() {
  
  const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(imgDir, { intermediate: true });
  }
};
  const selectImage = async (useLibrary) => {
    let result;
    const options = ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75
    };

    if (useLibrary) {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    }
    if (!result.canceled) {
      console.log(result.assets[0].url)
    }
  }
  return (

    <ImageBackground source={require("../assets/images/login.png")} style={styles.image}>
      <View style={{ width: "100%", alignItems: "center", justifyContent: "center", height: "90%", }}>
        <Image
          source={require("../assets/images/removedbackground.png")}
          style={{ width: 90, height: 90, marginBottom: 5, backgroundColor: "#eeeeee" }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#53A0C1", marginBottom: 10 }}>
          REMAS
        </Text>

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="First Name"
          placeholderTextColor="#888"
        />

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Second Name"
          placeholderTextColor="#888"
        />

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Contact"
          placeholderTextColor="#888"
        />

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Id Number"
          placeholderTextColor="#888"
        />

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Email"
          placeholderTextColor="#888"
        />

        <TextInput
          style={{
            width: "90%",
            backgroundColor: "#FFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 2,
          }}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
        />

        <TouchableOpacity onPress={() => {
          selectImage(true)
        }} style={{
          width: "80%",
          backgroundColor: "#FFF",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          elevation: 2,
          placeholder: "ID picture",
          placeholderTextColor: "#888"
        }}>
          <Text>Upload ID Picture</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={{
            backgroundColor: "#53A0C1",
            width: "90%",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() => {
            router.navigate("/login")
          }}

        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>SIGN UP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          router.navigate('/login')
        }}>
          <Text style={{ color: "#53A0C1", marginTop: 20, textDecorationLine: "underline" }}>
            Am a member of the community
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>

  )
}
const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    height: 70
  }
})