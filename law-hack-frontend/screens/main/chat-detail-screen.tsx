"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useRoute } from "@react-navigation/native"
import { useTheme } from "../../contexts/theme-context"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"

type Message = {
  id: string
  content: string
  type: "text" | "image" | "location" | "system"
  sender: "user" | "other"
  timestamp: string
  mediaUrl?: string
  location?: {
    latitude: number
    longitude: number
  }
}

const ChatDetailScreen = () => {
  const route = useRoute<any>()
  const { colors, isDarkMode } = useTheme()
  const { chatId } = route.params

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)

  const flatListRef = useRef<FlatList>(null)

  const fetchChatHistory = async () => {
    try {
      // In a real app, you would fetch chat history from the API
      // For this example, we'll use mock data
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hello! How can I help you today?",
          type: "text",
          sender: "other",
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
        },
        {
          id: "2",
          content: "I need information about filing a report.",
          type: "text",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(), // 9 minutes ago
        },
        {
          id: "3",
          content: "Sure, I can help with that. What kind of report would you like to file?",
          type: "text",
          sender: "other",
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 minutes ago
        },
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error("Error fetching chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChatHistory()
  }, [chatId])

  const sendMessage = async (
    content: string,
    type: "text" | "image" | "location",
    mediaUrl?: string,
    location?: { latitude: number; longitude: number },
  ) => {
    if ((type === "text" && !content.trim()) || (type === "image" && !mediaUrl)) {
      return
    }

    setIsSending(true)

    try {
      // Add message to local state immediately for better UX
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        type,
        sender: "user",
        timestamp: new Date().toISOString(),
        mediaUrl,
        location,
      }

      setMessages((prevMessages) => [...prevMessages, newMessage])

      // Clear input after sending text message
      if (type === "text") {
        setInputText("")
      }

      // In a real app, you would send the message to the API
      // const response = await api.sendMessage(chatId, content, type, mediaUrl);

      // Simulate response from server
      setTimeout(() => {
        let responseContent = ""

        if (type === "text") {
          responseContent = "Thank you for your message. Our team will get back to you shortly."
        } else if (type === "image") {
          responseContent = "Thank you for sharing this image. We have received it."
        } else if (type === "location") {
          responseContent = "Thank you for sharing your location. We have recorded it."
        }

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          type: "text",
          sender: "other",
          timestamp: new Date().toISOString(),
        }

        setMessages((prevMessages) => [...prevMessages, responseMessage])
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleSendTextMessage = () => {
    sendMessage(inputText, "text")
  }

  const handlePickImage = async () => {
    setShowAttachmentOptions(false)

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions to upload images.")
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]

        // In a real app, you would upload the image to your server and get a URL
        // For this example, we'll just use the local URI
        sendMessage("Image", "image", asset.uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
    }
  }

  const handleShareLocation = async () => {
    setShowAttachmentOptions(false)

    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant location permissions to share your location.")
      return
    }

    try {
      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      sendMessage("Location", "location", undefined, { latitude, longitude })
    } catch (error) {
      console.error("Error getting location:", error)
      Alert.alert("Error", "Failed to get your location. Please try again.")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === "user"

    return (
      <View
        style={[styles.messageContainer, isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer]}
      >
        {item.type === "text" && (
          <View
            style={[
              styles.messageBubble,
              isUserMessage
                ? [styles.userMessageBubble, { backgroundColor: colors.primary }]
                : [styles.otherMessageBubble, { backgroundColor: colors.messageIn }],
            ]}
          >
            <Text style={[styles.messageText, { color: isUserMessage ? "#FFFFFF" : colors.text }]}>{item.content}</Text>
          </View>
        )}

        {item.type === "image" && item.mediaUrl && (
          <View
            style={[
              styles.messageBubble,
              isUserMessage
                ? [styles.userMessageBubble, { backgroundColor: "transparent" }]
                : [styles.otherMessageBubble, { backgroundColor: "transparent" }],
            ]}
          >
            <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} resizeMode="cover" />
          </View>
        )}

        {item.type === "location" && item.location && (
          <View
            style={[
              styles.messageBubble,
              isUserMessage
                ? [styles.userMessageBubble, { backgroundColor: "transparent", padding: 0 }]
                : [styles.otherMessageBubble, { backgroundColor: "transparent", padding: 0 }],
            ]}
          >
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: item.location.latitude,
                  longitude: item.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                  }}
                />
              </MapView>
            </View>
          </View>
        )}

        <Text style={[styles.messageTimestamp, { color: isUserMessage ? "#FFFFFF99" : `${colors.text}99` }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {showAttachmentOptions && (
            <View style={[styles.attachmentOptions, { backgroundColor: colors.card }]}>
              <TouchableOpacity style={styles.attachmentOption} onPress={handlePickImage}>
                <View style={[styles.attachmentIconContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="image" size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.attachmentText, { color: colors.text }]}>Image</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.attachmentOption} onPress={handleShareLocation}>
                <View style={[styles.attachmentIconContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="location" size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.attachmentText, { color: colors.text }]}>Location</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
            >
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary },
                (!inputText.trim() || isSending) && styles.disabledButton,
              ]}
              onPress={handleSendTextMessage}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  mapContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  attachmentOptions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  attachmentOption: {
    alignItems: "center",
    marginRight: 24,
  },
  attachmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 12,
  },
})

export default ChatDetailScreen

