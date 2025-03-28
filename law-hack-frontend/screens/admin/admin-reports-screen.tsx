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
  Image,
  ScrollView,
} from "react-native"
import { useTheme } from "../../contexts/theme-context"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"

type Report = {
  id: string
  title: string
  body: string
  location: {
    coordinates: [number, number]
    region: string
    city: string
  }
  mediaUrls: string[]
  time: string
  status: "open" | "closed"
}

const AdminReportsScreen = () => {
  const { colors } = useTheme()

  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchReports = async () => {
    try {
      // In a real app, you would fetch reports from the API
      // const response = await api.getReports();

      // For this example, we'll use mock data
      const mockReports: Report[] = [
        {
          id: "1",
          title: "Traffic Light Malfunction",
          body: "The traffic light at the intersection of Main St and 5th Ave is not working properly.",
          location: {
            coordinates: [37.7749, -122.4194],
            region: "West",
            city: "City J",
          },
          mediaUrls: ["/placeholder.svg?height=300&width=300"],
          time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          status: "open",
        },
        {
          id: "2",
          title: "Pothole on Residential Street",
          body: "There is a large pothole on Oak Street that is causing damage to vehicles.",
          location: {
            coordinates: [37.7833, -122.4167],
            region: "North",
            city: "City A",
          },
          mediaUrls: ["/placeholder.svg?height=300&width=300", "/placeholder.svg?height=300&width=300"],
          time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          status: "open",
        },
        {
          id: "3",
          title: "Graffiti on Public Building",
          body: "There is graffiti on the east wall of the public library.",
          location: {
            coordinates: [37.7855, -122.4001],
            region: "East",
            city: "City G",
          },
          mediaUrls: ["/placeholder.svg?height=300&width=300"],
          time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          status: "open",
        },
      ]

      setReports(mockReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchReports()
  }

  const handleCloseReport = (reportId: string) => {
    Alert.alert("Close Report", "Are you sure you want to close this report?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Close",
        style: "destructive",
        onPress: async () => {
          try {
            // In a real app, you would call the API
            // await api.closeReport(reportId);

            // For this example, we'll just update the local state
            setReports(
              reports.map((report) => (report.id === reportId ? { ...report, status: "closed" as const } : report)),
            )

            if (selectedReport?.id === reportId) {
              setSelectedReport({ ...selectedReport, status: "closed" as const })
            }

            Alert.alert("Success", "Report closed successfully.")
          } catch (error) {
            console.error("Error closing report:", error)
            Alert.alert("Error", "Failed to close report. Please try again.")
          }
        },
      },
    ])
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={[
        styles.reportItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => {
        setSelectedReport(item)
        setModalVisible(true)
      }}
    >
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: colors.text }]}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === "open" ? colors.primary : colors.success,
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={[styles.reportBody, { color: colors.text }]} numberOfLines={2}>
        {item.body}
      </Text>

      <View style={styles.reportFooter}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color={colors.text} />
          <Text style={[styles.locationText, { color: colors.text }]}>
            {item.location.city}, {item.location.region}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: colors.text }]}>{formatTimestamp(item.time)}</Text>
      </View>

      {item.mediaUrls.length > 0 && (
        <View style={styles.mediaPreview}>
          <Image source={{ uri: item.mediaUrls[0] }} style={styles.mediaImage} resizeMode="cover" />
          {item.mediaUrls.length > 1 && (
            <View style={[styles.mediaCountBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.mediaCountText}>+{item.mediaUrls.length - 1}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>Reports</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reportsList}
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
              <Ionicons name="document-text-outline" size={64} color={colors.text} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No reports found</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {selectedReport && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedReport.title}</Text>

                <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.statusBadgeLarge,
                  {
                    backgroundColor: selectedReport.status === "open" ? colors.primary : colors.success,
                  },
                ]}
              >
                <Text style={styles.statusTextLarge}>{selectedReport.status.toUpperCase()}</Text>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.modalBody, { color: colors.text }]}>{selectedReport.body}</Text>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
              <Text style={[styles.locationDetail, { color: colors.text }]}>
                {selectedReport.location.city}, {selectedReport.location.region}
              </Text>

              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedReport.location.coordinates[0],
                    longitude: selectedReport.location.coordinates[1],
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedReport.location.coordinates[0],
                      longitude: selectedReport.location.coordinates[1],
                    }}
                  />
                </MapView>
              </View>

              {selectedReport.mediaUrls.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Media ({selectedReport.mediaUrls.length})
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.mediaGallery}
                  >
                    {selectedReport.mediaUrls.map((url, index) => (
                      <Image key={index} source={{ uri: url }} style={styles.galleryImage} resizeMode="cover" />
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={[styles.timeDetail, { color: colors.text }]}>
                Reported on: {formatTimestamp(selectedReport.time)}
              </Text>

              {selectedReport.status === "open" && (
                <TouchableOpacity
                  style={[styles.closeReportButton, { backgroundColor: colors.success }]}
                  onPress={() => handleCloseReport(selectedReport.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.closeReportText}>Mark as Resolved</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
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
  reportsList: {
    flexGrow: 1,
  },
  reportItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  reportBody: {
    fontSize: 14,
    marginBottom: 8,
  },
  reportFooter: {
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
  statusBadgeLarge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 16,
  },
  statusTextLarge: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 16,
    marginBottom: 16,
  },
  locationDetail: {
    fontSize: 14,
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
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
  closeReportButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  closeReportText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

export default AdminReportsScreen

