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
  Modal,
  TextInput,
  ScrollView,
  Image,
} from "react-native"
import { useTheme } from "../../contexts/theme-context"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Picker } from "@react-native-picker/picker"
import { SafeAreaView } from "react-native-safe-area-context"

// Mock data for regions and cities
const regions = ["North", "South", "East", "West", "Central"]
const cities = {
  North: ["City A", "City B", "City C"],
  South: ["City D", "City E", "City F"],
  East: ["City G", "City H", "City I"],
  West: ["City J", "City K", "City L"],
  Central: ["City M", "City N", "City O"],
}

type Announcement = {
  id: string
  title: string
  body: string
  media: string[]
  region: string
  city: string
  createdAt: string
}

const AdminAnnouncementsScreen = () => {
  const { colors, isDarkMode } = useTheme()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)

  // Form state for creating a new announcement
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [region, setRegion] = useState(regions[0])
  const [city, setCity] = useState(cities[regions[0]][0])
  const [media, setMedia] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAnnouncements = async () => {
    try {
      // In a real app, you would fetch announcements from the API
      // const response = await api.getAnnouncements();

      // For this example, we'll use mock data
      const mockAnnouncements: Announcement[] = [
        {
          id: "1",
          title: "Road Closure Notice",
          body: "Main Street will be closed for repairs from Monday to Wednesday next week. Please use alternate routes.",
          media: ["/placeholder.svg?height=300&width=300"],
          region: "West",
          city: "City J",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: "2",
          title: "Community Meeting",
          body: "There will be a community meeting at the Town Hall on Friday at 7 PM to discuss the new park development.",
          media: [],
          region: "North",
          city: "City A",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: "3",
          title: "Water Service Interruption",
          body: "Water service will be interrupted in the East district on Tuesday from 10 AM to 2 PM for maintenance work.",
          media: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
          region: "East",
          city: "City G",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        },
      ]

      setAnnouncements(mockAnnouncements)
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnnouncements()
  }

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions to upload images.")
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newMedia = result.assets.map((asset) => asset.uri)
        setMedia([...media, ...newMedia])
      }
    } catch (error) {
      console.error("Error picking image:", error)
    }
  }

  const removeMedia = (index: number) => {
    const newMedia = [...media]
    newMedia.splice(index, 1)
    setMedia(newMedia)
  }

  const handleCreateAnnouncement = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the announcement.")
      return
    }

    if (!body.trim()) {
      Alert.alert("Error", "Please enter content for the announcement.")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would upload media to your server first
      // and then submit the announcement with the media URLs

      const announcementData = {
        title,
        body,
        media,
        region,
        city,
      }

      // In a real app, you would call the API
      // const response = await api.createAnnouncement(announcementData);

      // For this example, we'll just simulate a successful submission
      setTimeout(() => {
        const newAnnouncement: Announcement = {
          id: (announcements.length + 1).toString(),
          title,
          body,
          media,
          region,
          city,
          createdAt: new Date().toISOString(),
        }

        setAnnouncements([newAnnouncement, ...announcements])

        // Reset form
        setTitle("")
        setBody("")
        setRegion(regions[0])
        setCity(cities[regions[0]][0])
        setMedia([])

        // Close modal
        setCreateModalVisible(false)

        Alert.alert("Success", "Announcement created successfully.")
      }, 1500)
    } catch (error) {
      console.error("Error creating announcement:", error)
      Alert.alert("Error", "Failed to create announcement. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
    <TouchableOpacity
      style={[
        styles.announcementItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => {
        setSelectedAnnouncement(item)
        setModalVisible(true)
      }}
    >
      <Text style={[styles.announcementTitle, { color: colors.text }]}>{item.title}</Text>

      <Text style={[styles.announcementBody, { color: colors.text }]} numberOfLines={2}>
        {item.body}
      </Text>

      <View style={styles.announcementFooter}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color={colors.text} />
          <Text style={[styles.locationText, { color: colors.text }]}>
            {item.city}, {item.region}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: colors.text }]}>{formatTimestamp(item.createdAt)}</Text>
      </View>

      {item.media.length > 0 && (
        <View style={styles.mediaPreview}>
          <Image source={{ uri: item.media[0] }} style={styles.mediaImage} resizeMode="cover" />
          {item.media.length > 1 && (
            <View style={[styles.mediaCountBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.mediaCountText}>+{item.media.length - 1}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Announcements</Text>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setCreateModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.announcementsList}
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
              <Ionicons name="megaphone-outline" size={64} color={colors.text} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No announcements found</Text>
              <Text style={[styles.emptySubtext, { color: colors.text }]}>
                Create a new announcement to inform users
              </Text>
            </View>
          }
        />
      )}

      {/* View Announcement Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {selectedAnnouncement && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedAnnouncement.title}</Text>

                <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalBody, { color: colors.text }]}>{selectedAnnouncement.body}</Text>

              <View style={styles.locationDetail}>
                <Ionicons name="location-outline" size={18} color={colors.text} />
                <Text style={[styles.locationDetailText, { color: colors.text }]}>
                  {selectedAnnouncement.city}, {selectedAnnouncement.region}
                </Text>
              </View>

              {selectedAnnouncement.media.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Media ({selectedAnnouncement.media.length})
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.mediaGallery}
                  >
                    {selectedAnnouncement.media.map((url, index) => (
                      <Image key={index} source={{ uri: url }} style={styles.galleryImage} resizeMode="cover" />
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={[styles.timeDetail, { color: colors.text }]}>
                Posted on: {formatTimestamp(selectedAnnouncement.createdAt)}
              </Text>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Announcement</Text>

              <TouchableOpacity style={styles.closeModalButton} onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter announcement title"
              placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: colors.text }]}>Content</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter announcement content"
              placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: colors.text }]}>Region</Text>
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Picker
                selectedValue={region}
                onValueChange={(itemValue) => {
                  setRegion(itemValue)
                  setCity(cities[itemValue][0])
                }}
                style={{ color: colors.text }}
              >
                {regions.map((r) => (
                  <Picker.Item key={r} label={r} value={r} />
                ))}
              </Picker>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>City</Text>
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Picker selectedValue={city} onValueChange={setCity} style={{ color: colors.text }}>
                {cities[region].map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Media</Text>
            <View style={styles.mediaContainer}>
              {media.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                    onPress={() => removeMedia(index)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addImageButton, { borderColor: colors.border }]}
                onPress={handlePickImage}
              >
                <Ionicons name="add" size={32} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }, isSubmitting && styles.disabledButton]}
              onPress={handleCreateAnnouncement}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="megaphone" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Publish Announcement</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  announcementsList: {
    flexGrow: 1,
  },
  announcementItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  announcementBody: {
    fontSize: 14,
    marginBottom: 8,
  },
  announcementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
  },
  mediaPreview: {
    marginTop: 12,
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: 120,
    borderRadius: 4,
  },
  mediaCountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mediaCountText: {
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
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  closeModalButton: {
    padding: 4,
  },
  modalBody: {
    fontSize: 16,
    marginBottom: 16,
  },
  locationDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationDetailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mediaGallery: {
    paddingBottom: 16,
  },
  galleryImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 8,
  },
  timeDetail: {
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 120,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  mediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 4,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  submitButton: {
    flexDirection: "row",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
})

export default AdminAnnouncementsScreen

