"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../contexts/theme-context"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import axios from "axios"

type Chat = {
  id: string
  lastMessage: string
  timestamp: string
  unreadCount: number
}

const ChatsScreen = () => {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()

  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchChats = async () => {
    try {
      // In a real app, you would fetch chats from the API
      // For this example, we'll use mock data
      

      setChats([])
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchChats()
  }

  const handleCreateNewChat = async () => {
    try {
      const response = await axios.post("http://localhost:3000/chat/init")
      const chatId = response.data.chatId

      navigation.navigate("ChatDetail", {
        chatId,
        title: "New Chat",
      })
    } catch (error) {
      console.error("Error creating new chat:", error)
      Alert.alert("Error", "Failed to create a new chat. Please try again.")
    }
  }

  const sendMessage = async (chatId: string, message: string, type: "text" | "image", mediaUrl?: string) => {
    try {
      const response = await axios.post("http://localhost:3000/chat/message", {
        chatId,
        message,
        type,
        mediaUrl,
      })
      const serverResponse = response.data.response // Extract the response from the server
      console.log("Message sent successfully:", serverResponse)
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send the message. Please try again.")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: colors.border }]}
      onPress={() =>
        navigation.navigate("ChatDetail", {
          chatId: item.id,
          title: `Chat ${item.id}`,
        })
      }
    >
      <View style={styles.chatAvatar}>
        <Ionicons name="chatbubble" size={24} color={colors.primary} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatTitle, { color: colors.text }]}>Chat {item.id}</Text>
          <Text style={[styles.chatTime, { color: colors.text }]}>{formatTimestamp(item.timestamp)}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text style={[styles.chatMessage, { color: colors.text }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>

          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color={colors.text} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No chats yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.text }]}>Start a new conversation</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={[styles.newChatButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateNewChat}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </>
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
  chatsList: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatTime: {
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  newChatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default ChatsScreen

