"use client"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/auth-context"
import { useTheme } from "../contexts/theme-context"

// Auth Screens
import LoginScreen from "../screens/auth/login-screen"
import VerificationScreen from "../screens/auth/verification-screen"

// Main Screens
import ChatsScreen from "../screens/main/chats-screen"
import ChatDetailScreen from "../screens/main/chat-detail-screen"
import ProfileScreen from "../screens/main/profile-screen"
import ReportScreen from "../screens/main/report-screen"

// Admin Screens
import AdminChatsScreen from "../screens/admin/admin-chats-screen"
import AdminReportsScreen from "../screens/admin/admin-reports-screen"
import AdminAnnouncementsScreen from "../screens/admin/admin-announcements-screen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Auth Navigator
const AuthNavigator = () => {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: "Verify Phone Number" }} />
    </Stack.Navigator>
  )
}

// Chat Stack Navigator
const ChatStackNavigator = () => {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: "Messages" }} />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }: any) => ({ title: route.params?.title || "Chat" })}
      />
    </Stack.Navigator>
  )
}

// User Tab Navigator
const UserTabNavigator = () => {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any

          if (route.name === "ChatStack") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else if (route.name === "Report") {
            iconName = focused ? "alert-circle" : "alert-circle-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="ChatStack" component={ChatStackNavigator} options={{ title: "Chats" }} />
      <Tab.Screen name="Report" component={ReportScreen} options={{ title: "Report" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  )
}

// Admin Tab Navigator
const AdminTabNavigator = () => {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any

          if (route.name === "AdminChats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "AdminReports") {
            iconName = focused ? "alert-circle" : "alert-circle-outline"
          } else if (route.name === "AdminAnnouncements") {
            iconName = focused ? "megaphone" : "megaphone-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="AdminChats" component={AdminChatsScreen} options={{ title: "Chats" }} />
      <Tab.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: "Reports" }} />
      <Tab.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} options={{ title: "Announcements" }} />
    </Tab.Navigator>
  )
}

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, userRole } = useAuth()

  if (isLoading) {
    // You could return a loading screen here
    return null
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : userRole === "admin" ? (
        <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
      ) : (
        <Stack.Screen name="UserMain" component={UserTabNavigator} />
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator

