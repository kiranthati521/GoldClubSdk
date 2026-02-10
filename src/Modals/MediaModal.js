import React, { useState } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator
} from "react-native";
import Video from "react-native-video";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const MediaModal = ({ visible, link, onClose, loaderColor = "#0000ff" }) => {
    const [loadingContent, setLoadingContent] = useState(true);

    if (!link) return null;

    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(link);
    const isMp4 = /\.mp4$/i.test(link);
    const isPdf = /\.pdf$/i.test(link);
    const isYouTube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(link);
    const isWeb = !isImage && !isMp4 && !isPdf && !isYouTube;

    // Define modal content size dynamically
    const contentWidth = !isWeb ? width * 0.85 : width * 0.95;
    const contentHeight = !isWeb ? height * 0.65 : height * 0.9;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.contentWrapper,
                        { width: contentWidth, height: contentHeight },
                    ]}
                >
                    {/* Close button inside modal corner */}
                    <TouchableOpacity style={styles.innerCloseBtn} onPress={onClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    {/* Loader */}
                    {loadingContent && (
                        <ActivityIndicator
                            size="large"
                            color={loaderColor}
                            style={styles.loader}
                        />
                    )}

                    {/* Image */}
                    {isImage && (
                        <Image
                            source={{ uri: link }}
                            style={styles.media}
                            onLoadEnd={() => setLoadingContent(false)}
                        />
                    )}

                    {/* Video */}
                    {isMp4 && (
                        <Video
                            source={{ uri: link }}
                            style={styles.media}
                            controls
                            resizeMode="contain"
                            onLoad={() => setLoadingContent(false)}
                            onBuffer={({ isBuffering }) =>
                                setLoadingContent(isBuffering)
                            }
                        />
                    )}

                    {/* WebView */}
                    {isWeb && (
                        <View style={{ flex: 1, width: "100%", height: "100%" }}>
                            <WebView
                                source={{ uri: link }}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                style={{ flex: 1 }}
                                onLoadEnd={() => setLoadingContent(false)}
                                mixedContentMode="always"
                                originWhitelist={["*"]}
                                allowsInlineMediaPlayback={true}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    contentWrapper: {
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        position: "relative", // required for inner absolute positioning
    },
    innerCloseBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        elevation: 5,
    },
    closeText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    loader: {
        position: "absolute",
        zIndex: 5,
    },
    media: {
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
    },
});

export default MediaModal;
