import { useCallback } from "react";
import { setStringAsync } from "expo-clipboard";
import { Image, StyleSheet, ToastAndroid, View } from "react-native";
import { Icon, Text, TouchableRipple } from "react-native-paper";

export default function OutfitTile({ thumbUrl, name, id }) {
    const copyId = useCallback(function() {
        setStringAsync(id.toString());
        ToastAndroid.show("Outfit ID copied to clipboard.", ToastAndroid.SHORT);
    }, []);

    const showName = useCallback(function() {
        ToastAndroid.show(name, ToastAndroid.SHORT);
    }, []);

    return (
        <TouchableRipple onPress={copyId} onLongPress={showName} borderless style={styles.container}>
            <>
                {thumbUrl ? <Image style={styles.thumb} src={thumbUrl} /> : <View style={{marginTop: 30, opacity: 0.2}}><Icon source="help" size={100} /></View>}
                <View style={{alignItems: "center", paddingHorizontal: 5, gap: 4}}>
                    <Text numberOfLines={1}>{name}</Text>
                    <Text style={styles.idText}>{id}</Text>
                </View>
            </>
        </TouchableRipple>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "48.5%",
        height: 210,
        backgroundColor: "#f5f5f5",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 7,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#cacaca"
    },
    idText: {
        color: "#a9a9a9"
    },
    thumb: {
        aspectRatio: 1 / 1,
        width: "100%"
    }
});