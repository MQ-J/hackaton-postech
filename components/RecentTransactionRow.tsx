import type { Task } from '@/lib/types'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'

interface RecentTaskRowProps {
  task: Task
}

export function RecentTaskRow({ task }: RecentTaskRowProps) {

  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY])

  return (
    <Animated.View style={[styles.row, { opacity, transform: [{ translateY }] }]}>
      <Animated.View style={styles.left}>
        <Text style={styles.month}>{task.title}</Text>
        <Text style={styles.label}>{task.description}</Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  left: {
    flex: 1,
  },
  month: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  amountPositive: {
    color: '#22c55e',
  },
  amountNegative: {
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
})
