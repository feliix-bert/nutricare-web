// src/app/(app)/donate/form.tsx

import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useDonate } from '@/features/blockchain/hooks/useDonate'
import { MIN_DONATION, ETHERSCAN_URL } from '@/features/blockchain/config'

// Ambil private key dari secure storage kamu
// Contoh: import * as SecureStore from 'expo-secure-store'
// const privateKey = await SecureStore.getItemAsync('wallet_private_key')
const DEMO_PRIVATE_KEY = process.env.EXPO_PUBLIC_DEMO_PRIVATE_KEY || ''

const PRESET_AMOUNTS = ['0.001', '0.005', '0.01', '0.05']

// ── Success Screen ────────────────────────────────────────────────────────────

interface SuccessScreenProps {
  txHash: string
  amount: string
  onDonateAgain: () => void
  onGoBack: () => void
}

function SuccessScreen({ txHash, amount, onDonateAgain, onGoBack }: SuccessScreenProps) {
  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <View className="bg-white rounded-3xl p-8 items-center shadow-sm">

        {/* Animasi centang */}
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">✅</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Donasi Berhasil!
        </Text>
        <Text className="text-gray-500 text-center text-sm mb-2">
          {amount} ETH telah masuk ke Community Fund
        </Text>
        <Text className="text-gray-400 text-center text-xs mb-6">
          Terima kasih! Donasimu membantu anak-anak stunting Indonesia 💚
        </Text>

        {/* TX Hash */}
        <View className="bg-gray-50 border border-gray-100 rounded-xl p-4 w-full mb-6">
          <Text className="text-xs text-gray-400 mb-1">Transaction Hash</Text>
          <Text
            className="text-xs text-gray-600 font-mono"
            numberOfLines={2}
            selectable
          >
            {txHash}
          </Text>
        </View>

        {/* Tombol */}
        <TouchableOpacity
          onPress={() => Linking.openURL(`${ETHERSCAN_URL}/tx/${txHash}`)}
          className="w-full bg-blue-50 border border-blue-100 py-3.5 rounded-xl mb-3"
        >
          <Text className="text-blue-600 text-center font-semibold">
            🔍 Lihat di Etherscan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDonateAgain}
          className="w-full bg-green-600 py-3.5 rounded-xl mb-3"
        >
          <Text className="text-white text-center font-semibold">
            💚 Donasi Lagi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onGoBack}
          className="w-full bg-gray-100 py-3.5 rounded-xl"
        >
          <Text className="text-gray-600 text-center font-semibold">
            Kembali ke Pool
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ── Form Screen ───────────────────────────────────────────────────────────────

export default function DonateFormScreen() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  const { donate, loading, success, error, txHash, reset } =
    useDonate(DEMO_PRIVATE_KEY)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDonate = useCallback(() => {
    if (!amount) return

    Alert.alert(
      '🤝 Konfirmasi Donasi',
      `Kamu akan mendonasikan ${amount} ETH ke Community Fund GiziChain.\n\nJaringan: Sepolia Testnet`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Donasi!',
          onPress: () =>
            donate({
              amount,
              message: message || 'Donasi untuk anak stunting Indonesia',
            }),
        },
      ]
    )
  }, [amount, message, donate])

  const handleReset = useCallback(() => {
    setAmount('')
    setMessage('')
    reset()
  }, [reset])

  // ── Success State ────────────────────────────────────────────────────────────

  if (success && txHash) {
    return (
      <SuccessScreen
        txHash={txHash}
        amount={amount}
        onDonateAgain={handleReset}
        onGoBack={() => router.back()}
      />
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-5 py-6">

          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              Donasi ke Pool
            </Text>
            <Text className="text-gray-500 text-sm">
              Dana langsung masuk ke smart contract — transparan & aman
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">

            {/* Jumlah ETH */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Jumlah Donasi (ETH)
              </Text>

              {/* Preset */}
              <View className="flex-row gap-2 mb-3">
                {PRESET_AMOUNTS.map(preset => (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => setAmount(preset)}
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-xl border items-center ${
                      amount === preset
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        amount === preset ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input custom */}
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 bg-gray-50"
                placeholder={`Min. ${MIN_DONATION} ETH`}
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Pesan */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Pesan Semangat (opsional)
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50"
                placeholder="Semangat anak Indonesia! 💪"
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                maxLength={100}
                editable={!loading}
              />
              <Text className="text-xs text-gray-300 text-right mt-1">
                {message.length}/100
              </Text>
            </View>
          </View>

          {/* Error */}
          {error && (
            <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-500 text-sm">⚠️ {error}</Text>
            </View>
          )}

          {/* Info gas */}
          <View className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 mb-5">
            <Text className="text-yellow-700 text-xs leading-relaxed">
              ⛽ Transaksi membutuhkan sedikit ETH untuk biaya gas.
              Pastikan saldo kamu lebih dari jumlah donasi.
            </Text>
          </View>

          {/* Tombol Donasi */}
          <TouchableOpacity
            onPress={handleDonate}
            disabled={loading || !amount}
            className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${
              loading || !amount ? 'bg-gray-200' : 'bg-green-600'
            }`}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-base">
                  Memproses di blockchain...
                </Text>
              </>
            ) : (
              <Text
                className={`font-bold text-base ${
                  !amount ? 'text-gray-400' : 'text-white'
                }`}
              >
                💚 Donasi {amount ? `${amount} ETH` : ''}
              </Text>
            )}
          </TouchableOpacity>

          {/* Faucet link */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://sepoliafaucet.com')}
            className="mt-4 items-center"
          >
            <Text className="text-green-500 text-xs underline">
              Butuh Sepolia ETH? Klik untuk ke faucet →
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
