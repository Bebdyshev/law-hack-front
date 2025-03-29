"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useAuth } from "../../contexts/auth-context"
import { useTheme } from "../../contexts/theme-context"
import { SafeAreaView } from "react-native-safe-area-context"

const VerificationScreen = () => {
  const route = useRoute<any>()
  const navigation = useNavigation()
  const { login, requestVerificationCode } = useAuth()
  const { colors } = useTheme()

  const { phoneNumber, region, city } = route.params
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<Array<TextInput | null>>([])
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval)
          setCanResend(true)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCode(codeDigits.join(""))
  }, [codeDigits])

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit verification code")
      return
    }

    setIsLoading(true)
    try {
      await login(phoneNumber, code, region, city)
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error("Verification error:", error)
      Alert.alert("Verification Failed", "Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    // Reset timer and resend state
    setTimer(60)
    setCanResend(false)
    
    try {
      // Запрашиваем новый код через API
      await requestVerificationCode(phoneNumber, region, city)
      Alert.alert("Code Resent", "A new verification code has been sent to your phone.")
    } catch (error) {
      console.error("Error resending verification code:", error)
      Alert.alert("Error", "Failed to resend verification code. Please try again.")
      setCanResend(true)
      return
    }

    // Start timer again
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval)
          setCanResend(true)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)
  }

  const handleCodeDigitChange = (text: string, index: number) => {
    // Update the digit at the specified index
    const newCodeDigits = [...codeDigits]
    newCodeDigits[index] = text
    setCodeDigits(newCodeDigits)

    // Auto-focus next input if a digit was entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Verification Code</Text>

        <Text style={[styles.description, { color: colors.text }]}>
          We've sent a 6-digit verification code to {phoneNumber}
        </Text>

        <View style={styles.codeContainer}>
          {codeDigits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleCodeDigitChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus()
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: colors.primary },
            (isLoading || code.length !== 6) && styles.disabledButton,
          ]}
          onPress={handleVerify}
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.text }]}>Didn't receive the code?</Text>

          <TouchableOpacity onPress={handleResendCode} disabled={!canResend}>
            <Text style={[styles.resendButton, { color: canResend ? colors.primary : colors.text }]}>
              {canResend ? "Resend Code" : `Resend in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 32,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: "bold",
  },
  verifyButton: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    marginRight: 4,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: "600",
  },
})

export default VerificationScreen

