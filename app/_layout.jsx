import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{
    headerTitle: "RoFits",
    headerTintColor: "white",
    headerStyle: {backgroundColor: "#ee2424"}
  }} />;
}

