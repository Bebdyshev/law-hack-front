"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../../contexts/auth-context"
import { useTheme } from "../../contexts/theme-context"
import { TextInput } from "react-native-gesture-handler"
import { Picker } from "@react-native-picker/picker"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

// Replace the mock regions and cities with Kazakhstan's regions and cities
const regions = [
  "Almaty",
  "Nur-Sultan",
  "Shymkent",
  "Abay Region",
  "Akmola Region",
  "Aktobe Region",
  "Almaty Region",
  "Atyrau Region",
  "East Kazakhstan",
  "Jambyl Region",
  "Jetisu Region",
  "Karaganda Region",
  "Kostanay Region",
  "Kyzylorda Region",
  "Mangystau Region",
  "North Kazakhstan",
  "Pavlodar Region",
  "Turkistan Region",
  "Ulytau Region",
  "West Kazakhstan",
]

const cities = {
  Almaty: ["Almaty"],
  "Nur-Sultan": ["Nur-Sultan"],
  Shymkent: ["Shymkent"],
  "Abay Region": ["Semey", "Kurchatov"],
  "Akmola Region": ["Kokshetau", "Stepnogorsk", "Burabay"],
  "Aktobe Region": ["Aktobe", "Kandyagash", "Khromtau"],
  "Almaty Region": ["Taldykorgan", "Kapshagay", "Esik"],
  "Atyrau Region": ["Atyrau", "Kulsary"],
  "East Kazakhstan": ["Oskemen", "Ridder", "Ayagoz"],
  "Jambyl Region": ["Taraz", "Shu", "Karatau"],
  "Jetisu Region": ["Taldykorgan", "Tekeli"],
  "Karaganda Region": ["Karaganda", "Temirtau", "Balkhash", "Zhezkazgan"],
  "Kostanay Region": ["Kostanay", "Rudny", "Lisakovsk"],
  "Kyzylorda Region": ["Kyzylorda", "Baikonur", "Aral"],
  "Mangystau Region": ["Aktau", "Zhanaozen"],
  "North Kazakhstan": ["Petropavl", "Bulayevo"],
  "Pavlodar Region": ["Pavlodar", "Ekibastuz", "Aksu"],
  "Turkistan Region": ["Turkistan", "Kentau", "Arys"],
  "Ulytau Region": ["Zhezkazgan", "Satpayev"],
  "West Kazakhstan": ["Oral", "Aksay"],
}

// Replace the entire LoginScreen component with this enhanced version
const LoginScreen = () => {
  const navigation = useNavigation<any>()
  const { requestVerificationCode } = useAuth()
  const { colors, isDarkMode } = useTheme()

  const [phoneNumber, setPhoneNumber] = useState("")
  const [region, setRegion] = useState(regions[0])
  const [city, setCity] = useState(cities[regions[0]][0])
  const [isLoading, setIsLoading] = useState(false)
  const [isPhoneValid, setIsPhoneValid] = useState(true)

  const handlePhoneChange = (text: string) => {
    // Allow only numbers and format the phone number
    const cleaned = text.replace(/[^0-9]/g, "")
    setPhoneNumber(cleaned)
    setIsPhoneValid(cleaned.length >= 10)
  }

  const handleRequestCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setIsPhoneValid(false)
      alert("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    try {
      await requestVerificationCode(phoneNumber)
      navigation.navigate("Verification", {
        phoneNumber,
        region,
        city,
      })
    } catch (error) {
      console.error("Error requesting verification code:", error)
      alert("Failed to request verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return ""
    if (phone.length <= 3) return `+7 ${phone}`
    if (phone.length <= 6) return `+7 ${phone.slice(0, 3)} ${phone.slice(3)}`
    if (phone.length <= 8) return `+7 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
    return `+7 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="chatbubble-ellipses" size={60} color="#FFFFFF" />
            </View>
            <Text style={[styles.appTitle, { color: colors.primary }]}>Law Messenger</Text>
            <Text style={[styles.appSubtitle, { color: colors.text }]}>Connect and communicate securely</Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Sign In</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <View
                style={[
                  styles.phoneInputContainer,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: isPhoneValid ? colors.border : colors.error,
                  },
                ]}
              >
                <Text style={[styles.phonePrefix, { color: colors.text }]}>+7</Text>
                <TextInput
                  style={[styles.phoneInput, { color: colors.text }]}
                  placeholder="(XXX) XXX XXXX"
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                  keyboardType="phone-pad"
                  value={formatPhoneForDisplay(phoneNumber).substring(3)} // Remove the +7 prefix
                  onChangeText={handlePhoneChange}
                  maxLength={15}
                />
              </View>
              {!isPhoneValid && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  Please enter a valid Kazakhstan phone number
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
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
                  dropdownIconColor={colors.text}
                >
                  {regions.map((r) => (
                    <Picker.Item key={r} label={r} value={r} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
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
                <Picker
                  selectedValue={city}
                  onValueChange={setCity}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.text}
                >
                  {cities[region].map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleRequestCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Get Verification Code</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text }]}>By continuing, you agree to our</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={[styles.footerText, { color: colors.text }]}> & </Text>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// Replace the styles with these enhanced styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  formContainer: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
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
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  phonePrefix: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  button: {
    height: 54,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLinks: {
    flexDirection: "row",
    marginTop: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default LoginScreen