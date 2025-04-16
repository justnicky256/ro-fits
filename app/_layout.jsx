import { Stack } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  useEffect(function() {
    setStatusBarStyle("light");
  }, []);

  return (
    <PaperProvider theme={{mode: "exact"}}>
      <Stack screenOptions={{
        headerTitle: "RoFits",
        headerTintColor: "white",
        headerStyle: {backgroundColor: "#ee2424"}
      }} />
    </PaperProvider>
  );
}