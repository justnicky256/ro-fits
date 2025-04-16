import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, ToastAndroid, View } from "react-native";
import { Button, Dialog, Icon, Portal, Surface, Text, TextInput, TouchableRipple } from "react-native-paper";
import OutfitTile from "../components/outfit-tile.jsx";
import { nativeApplicationVersion } from "expo-application";

export default function Index() {
  const [username, setUsername] = useState("");
  const [lastUsername, setLastUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [outfitList, setOutfitList] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const onSearch = useCallback(async function(useLastUsername) {
    if (loading || errorMessage) return;

    const name = useLastUsername ? lastUsername : username.trim();
    if (!name) {
      setErrorMessage("Please enter a username.");
      return;
    }

    setLoading(true);

    const response = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      body: JSON.stringify({
        usernames: [name],
        excludeBannedUsers: true
      })
    });

    const userData = await response.json();
    if (!response.ok) {
      ToastAndroid.show("An error occurred, please try again later.", ToastAndroid.SHORT);
      console.error(userData);
      setLoading(false);
      return;
    }

    if (userData.data.length <= 0) {
      setErrorMessage("This user does not exist.");
      setLoading(false);
      return;
    }

    setLastUsername(name);
    const id = userData.data[0].id;
    const outfitRes = await fetch(`https://avatar.roblox.com/v1/users/${id}/outfits`);

    const outfitData = await outfitRes.json();
    if (!outfitRes.ok) {
      ToastAndroid.show("An error occurred, please try again later.", ToastAndroid.SHORT);
      console.error(outfitData);
      setLoading(false);
      return;
    }

    const filteredOutfits = outfitData.data.filter(outfit => outfit.isEditable); // Display only outfits created by the user.
    if (filteredOutfits.length <= 0) {
      setOutfitList([]);
      setLoading(false);
      return;
    }

    const nameDict = {};
    for (const outfit of filteredOutfits) {
      nameDict[outfit.id] = outfit.name;
    }

    do {
      const outfitThumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=${Object.keys(nameDict).join(",")}&size=420x420&format=Png`);
      const outfitThumbData = await outfitThumbRes.json();
  
      if (!outfitThumbRes.ok) {
        ToastAndroid.show("An error occurred, please try again later.", ToastAndroid.SHORT);
        console.error(outfitThumbData);
        setLoading(false);
        return;
      }

      const hasPending = outfitThumbData.data.some(item => item.state === "Pending"); // For some reason the outfits with the Pending state load after a second request.
      if (hasPending) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }
      
      const list = [];
      for (const thumb of outfitThumbData.data) {
        list.push({
          thumbUrl: thumb.imageUrl,
          id: thumb.targetId,
          name: nameDict[thumb.targetId],
        });
      }

      setOutfitList(list);
      break;
    } while (true);

    setLoading(false);
  }, [username, lastUsername, loading, errorMessage]);

  const onTextUpdate = useCallback(function(text) {
    setUsername(text);
    setErrorMessage("");
  }, []);

  const openDialog = useCallback(function() {
    setDialogVisible(true);
  }, []);

  const closeDialog = useCallback(function() {
    setDialogVisible(false);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <View style={{flex: 1, height: 56}}>
            <TextInput style={styles.inputBox} mode="outlined" label="Username" activeOutlineColor="#ee2424" autoCorrect={false} autoCapitalize="none" onChangeText={onTextUpdate} returnKeyType="search" onSubmitEditing={() => onSearch(false)} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
          <Button onPress={() => onSearch(false)} mode="contained" style={{width: 106, borderRadius: 5}} labelStyle={{fontSize: 15}} contentStyle={{backgroundColor: "red", height: 56}}>{loading ? <ActivityIndicator size="large" color="white" /> : "SEARCH"}</Button>
        </View>
        { outfitList && outfitList.length > 0 ?
          <FlatList
            style={{width: "100%"}}
            contentContainerStyle={{alignItems: "flex-start", gap: 10, paddingVertical: 10, paddingHorizontal: 15}}
            columnWrapperStyle={{width: "100%", gap: 10}}
            numColumns={2}
            refreshControl={<RefreshControl refreshing={loading} colors={["#ee2424"]} progressViewOffset={-3} onRefresh={() => onSearch(true)} />}
            data={outfitList}
            renderItem={({item}) => {
              return <OutfitTile {...item} />
            }} />
          :
          <View style={{flex: 1, justifyContent: "center", paddingHorizontal: 15}}>
            <Text style={styles.mainViewText}>{outfitList ? "This user does not have any outfits" : "Enter a Roblox username and press \"SEARCH\" to get started"}</Text>
          </View>
        }
      </View>
      <Surface style={styles.fab} elevation={2}>
        <TouchableRipple style={styles.fabTouchable} borderless rippleColor="rgba(255, 255, 255, 0.1)" onPress={openDialog}>
          <Icon source="information-outline" color="white" size={50} />
        </TouchableRipple>
      </Surface>
      <Portal>
        <Dialog style={{backgroundColor: "white"}} visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>RoFits v{nativeApplicationVersion}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This is a sample application created by Nicky. Its purpose is to fetch a particular Roblox user's outfits.{"\n\n"}You can check out its repository <Text onPress={() => Linking.openURL("https://github.com/justnicky256/ro-fits")} style={{color: "blue", textDecorationLine: "underline"}}>here</Text>.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button style={{backgroundColor: "#ee2424", width: 65}} mode="contained" onPress={closeDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center"
  },
  searchSection: {
    width: "100%",
    backgroundColor: "white",
    zIndex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    gap: 20
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 16,
    color: "#ee2424"
  },
  inputBox: {
    backgroundColor: "white",
    height: 54,
    marginTop: -6
  },
  mainViewText: {
    textAlign: "center",
    opacity: 0.4,
    fontSize: 25
  },
  fab: {
    position: "absolute",
    backgroundColor: "#ee2424",
    borderRadius: 50,
    width: 65,
    height: 65,
    margin: 25,
    right: 0,
    bottom: 0
  },
  fabTouchable: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center"
  }
});