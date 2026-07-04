// src/app/(app)/donate/index.tsx

import { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { usePoolStats } from '@/features/blockchain/hooks/usePoolStats'
import { ETHERSCAN_URL, CONTRACT_ADDRESS } from '@/features/blockchain/config'

// ── Helper ────────────────────────────────────────────────────────────────────

function shortAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string
  label: string
  value: string
  bg: string
  textColor: string
}

function StatCard({ icon, label, value, bg, textColor }: StatCardProps) {
  return (
    <View className={`${bg} rounded-2xl p-4 flex-1`}>
      <Text className="text-xl mb-1">{icon}</Text>
      <Text className={`font-bold text-base ${textColor}`}>{value}</Text>
      <Text className={`text-xs ${textColor} opacity-70 mt-0.5`}>{label}</Text>
    </View>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function DonateIndexScreen() {
  const router = useRouter()
  const { stats, donations, loading, refetch } = usePoolStats()

  const handleDonatePress = useCallback(() => {
    router.push('/(app)/donate/form')
  }, [router])

  const openEtherscan = useCallback(() => {
    if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x_simulated') {
      Linking.openURL(`${ETHERSCAN_URL}/address/${CONTRACT_ADDRESS}`)
    }
  }, [])

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    >
      {/* Header Banner */}
      <View className="bg-gradient-to-b from-green-600 to-green-500 px-5 pt-8 pb-10">
        <Text className="text-white text-2xl font-bold mb-1">
          💚 Community Fund
        </Text>
        <Text className="text-green-100 text-sm leading-relaxed">
          Bantu keluarga anak stunting Indonesia.{'\n'}
          Dana langsung ke wallet orang tua — transparan di blockchain.
        </Text>

        {/* Badge jaringan */}
        <View className="flex-row items-center gap-1.5 mt-3">
          <View className="w-2 h-2 bg-yellow-300 rounded-full" />
          <Text className="text-yellow-200 text-xs font-medium">
            Sepolia Testnet · Smart Contract
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="px-5 -mt-5">
        {loading && !stats ? (
          <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
            <ActivityIndicator color="#16a34a" />
            <Text className="text-gray-400 text-sm mt-2">Memuat data pool...</Text>
          </View>
        ) : stats ? (
          <>
            {/* Saldo utama */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-3 items-center">
              <Text className="text-gray-500 text-sm mb-1">Saldo Pool Saat Ini</Text>
              <Text className="text-4xl font-bold text-green-600">
                {stats.balance}
              </Text>
              <Text className="text-gray-400 text-sm">ETH</Text>

              {stats.isSimulated && (
                <View className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 mt-3">
                  <Text className="text-orange-500 text-xs text-center">
                    ⚠️ Mode simulasi — contract belum aktif
                  </Text>
                </View>
              )}
            </View>

            {/* Stats grid */}
            <View className="flex-row gap-3 mb-3">
              <StatCard
                icon="📈"
                label="Total Masuk"
                value={`${stats.totalDonated} ETH`}
                bg="bg-blue-50"
                textColor="text-blue-700"
              />
              <StatCard
                icon="🤝"
                label="Disalurkan"
                value={`${stats.totalDisbursed} ETH`}
                bg="bg-orange-50"
                textColor="text-orange-700"
              />
            </View>
            <View className="flex-row gap-3 mb-5">
              <StatCard
                icon="👥"
                label="Donatur"
                value={`${stats.donorCount} orang`}
                bg="bg-purple-50"
                textColor="text-purple-700"
              />
              <StatCard
                icon="👨‍👩‍👧"
                label="Penerima"
                value={`${stats.beneficiaryCount} keluarga`}
                bg="bg-pink-50"
                textColor="text-pink-700"
              />
            </View>
          </>
        ) : null}

        {/* Tombol Donasi */}
        <TouchableOpacity
          onPress={handleDonatePress}
          className="bg-green-600 py-4 rounded-2xl items-center mb-6 shadow-sm"
        >
          <Text className="text-white font-bold text-lg">
            💚 Donasi Sekarang
          </Text>
        </TouchableOpacity>

        {/* Cara kerja */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <Text className="font-semibold text-gray-800 mb-4">
            ℹ️ Bagaimana cara kerja?
          </Text>
          <View className="space-y-3">
            {[
              {
                no: '1',
                text: 'Donasi masuk ke smart contract di Sepolia — transparan & tidak bisa dimanipulasi',
                color: 'bg-green-100 text-green-700',
              },
              {
                no: '2',
                text: 'Tim medis GiziChain verifikasi status stunting anak melalui assessment',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                no: '3',
                text: 'Dana otomatis cair ke wallet orang tua yang terverifikasi — langsung, tanpa perantara',
                color: 'bg-purple-100 text-purple-700',
              },
            ].map(item => (
              <View key={item.no} className="flex-row gap-3 items-start">
                <View className={`${item.color} w-6 h-6 rounded-full items-center justify-center flex-shrink-0`}>
                  <Text className="text-xs font-bold">{item.no}</Text>
                </View>
                <Text className="text-gray-600 text-sm flex-1 leading-relaxed">
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Riwayat Donasi */}
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Text className="font-semibold text-gray-800 mb-4">
            📋 Donasi Terbaru
          </Text>

          {donations.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-3xl mb-2">🌟</Text>
              <Text className="text-gray-400 text-sm">
                Belum ada donasi. Jadilah yang pertama!
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {donations.map((d, i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-3 pb-3 border-b border-gray-50 last:border-0"
                >
                  {/* Avatar */}
                  <View className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {d.donor.slice(2, 4).toUpperCase()}
                    </Text>
                  </View>

                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-gray-700">
                        {shortAddress(d.donor)}
                      </Text>
                      <Text className="text-green-600 font-bold text-sm">
                        {d.amount} ETH
                      </Text>
                    </View>
                    {d.message !== '' && (
                      <Text
                        className="text-gray-400 text-xs mt-0.5"
                        numberOfLines={1}
                      >
                        "{d.message}"
                      </Text>
                    )}
                    <Text className="text-gray-300 text-xs mt-0.5">
                      {formatDate(d.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Link Etherscan */}
        {CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x_simulated' && (
          <TouchableOpacity
            onPress={openEtherscan}
            className="mt-4 items-center"
          >
            <Text className="text-green-500 text-xs underline">
              Lihat smart contract di Etherscan →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}
