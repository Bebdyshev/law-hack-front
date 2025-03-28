"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../../contexts/theme-context"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

type Chat = {
  id: string
  lastMessage: string
  timestamp: string
  unreadCount: number
}

const AdminChatsScreen = () => {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()

  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchChats = async () => {
    try {
      // In a real app, you would fetch chats from the API
      // const response = await api.getAdminChats();

      // For this example, we'll use mock data
      const mockChats: Chat[] = [
        {
          id: "1",
          lastMessage: "Hello, I need assistance with my report.",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          unreadCount: 2,
        },
        {
          id: "2",
          lastMessage: "When will my report be processed?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          unreadCount: 0,
        },
        {
          id: "3",
          lastMessage: "Thank you for your help!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          unreadCount: 0,
        },
      ]

      setChats(mockChats)
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

  const handleTerminateChat = (chatId: string) => {
    Alert.alert("Terminate Chat", "Are you sure you want to terminate this chat?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Terminate",
        style: "destructive",
        onPress: async () => {
          try {
            // In a real app, you would call the API
            // await api.terminateChat(chatId);

            // For this example, we'll just remove it from the local state
            setChats(chats.filter((chat) => chat.id !== chatId))

            Alert.alert("Success", "Chat terminated successfully.")
          } catch (error) {
            console.error("Error terminating chat:", error)
            Alert.alert("Error", "Failed to terminate chat. Please try again.")
          }
        },
      },
    ])
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
    <View style={[styles.chatItem, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.chatContent}
        onPress={() =>
          navigation.navigate("ChatDetail", {
            chatId: item.id,
            title: `Chat ${item.id}`,
          })
        }
      >
        <View style={styles.chatAvatar}>
          <Ionicons name="person" size={24} color={colors.primary} />
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatTitle, { color: colors.text }]}>User Chat {item.id}</Text>
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

      <TouchableOpacity
        style={[styles.terminateButton, { backgroundColor: colors.error }]}
        onPress={() => handleTerminateChat(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>Active Chats</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
              <Text style={[styles.emptyText, { color: colors.text }]}>No active chats</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chatContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  chatInfo: {
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
  terminateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
})

export default AdminChatsScreen

