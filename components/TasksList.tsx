import { ColorContrastPreset, useAccessibility } from '@/contexts/AccessibilityContext'
import { useAccount } from '@/contexts/AccountContext'
import type { Task } from '@/lib/types'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

/** Itens por página na lista (≤ este número: sem barra de paginação). */
const TRANSACTIONS_PAGE_SIZE = 10

interface TasksListProps {
  onEdit: (task: Task) => void
}

export default function TasksList({ onEdit }: TasksListProps) {
  const { account, deleteTask } = useAccount()
  const { scaleFont, colorContrast } = useAccessibility()

  const styles = useMemo(() => createTasksListStyles(scaleFont, colorContrast), [scaleFont, colorContrast])

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const deleteModalClearWebTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const listRef = useRef<FlatList<Task>>(null)

  useEffect(() => {
    return () => {
      if (deleteModalClearWebTimerRef.current) {
        clearTimeout(deleteModalClearWebTimerRef.current)
      }
    }
  }, [])

  const localFiltered = useMemo(() => {
    if (!account) return []
    let list = account.tasks

    return list
  }, [account])

  const totalPages = Math.max(
    1,
    Math.ceil(localFiltered.length / TRANSACTIONS_PAGE_SIZE),
  )
  const showPagination = localFiltered.length > TRANSACTIONS_PAGE_SIZE

  const paginatedTasks = useMemo(() => {
    if (!showPagination) {
      return localFiltered
    }
    const start = (currentPage - 1) * TRANSACTIONS_PAGE_SIZE
    return localFiltered.slice(start, start + TRANSACTIONS_PAGE_SIZE)
  }, [localFiltered, currentPage, showPagination])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (showPagination) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true })
    }
  }, [currentPage, showPagination])

  const goPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const goNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1))
  }, [totalPages])

  /** Só esconde o modal; mantém `deleteTarget` até o fim da animação (evita sumir o resumo antes do overlay). */
  const closeDeleteModal = () => {
    setDeleteModalVisible(false)
    // react-native-web nem sempre chama onDismiss; limpa o alvo após o fade (~300ms).
    if (Platform.OS === 'web') {
      if (deleteModalClearWebTimerRef.current) {
        clearTimeout(deleteModalClearWebTimerRef.current)
      }
      deleteModalClearWebTimerRef.current = setTimeout(() => {
        deleteModalClearWebTimerRef.current = null
        setDeleteTarget(null)
      }, 320)
    }
  }

  const clearDeleteTargetAfterDismiss = () => {
    if (Platform.OS !== 'web') {
      setDeleteTarget(null)
    }
  }

  const handleDeletePress = useCallback((task: Task) => {
    if (Platform.OS === 'web' && deleteModalClearWebTimerRef.current) {
      clearTimeout(deleteModalClearWebTimerRef.current)
      deleteModalClearWebTimerRef.current = null
    }
    setDeleteTarget(task)
    setDeleteModalVisible(true)
  }, [])

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id)
    }
    closeDeleteModal()
  }

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Pressable
            onPress={() => onEdit(item)}
          >
            {
              item.title && (
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
              )
            }
            {
              item.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              )
            }
            {
              !!item.items.length && (
                <View>
                  {item.items.map((subitem, index) => (
                    <Text key={index} style={styles.description} numberOfLines={1}>
                      • {subitem.description}
                    </Text>
                  ))}
                </View>
              )
            }
          </Pressable>
        </View>
        <View style={styles.itemRight}>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.deleteButton]}
              onPress={() => handleDeletePress(item)}
            >
              <Ionicons name="trash-outline" style={styles.deleteButtonIcon} color="#dc2626" />
            </Pressable>
          </View>
        </View>
      </View>
    ),
    [styles, onEdit, handleDeletePress],
  )

  return (
    <View style={styles.container}>
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
        onDismiss={clearDeleteTargetAfterDismiss}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Excluir lista</Text>
            <Text style={styles.deleteModalMessage}>
              Tem certeza que deseja excluir esta lista? Esta ação não pode ser
              desfeita.
            </Text>
            {deleteTarget ? (
              <View style={styles.deleteModalSummary}>
                {
                  deleteTarget.title && (
                    <Text style={styles.deleteModalSummaryLabel}>
                      {deleteTarget.title}
                    </Text>
                  )
                }
                {
                  deleteTarget.description && (
                    <Text style={styles.deleteModalSummaryLabel}>
                      {deleteTarget.description}
                    </Text>
                  )
                }

                <Text style={styles.deleteModalSummaryLabel}>
                  {deleteTarget.items.map(item => item.description).join(', ')}
                </Text>
              </View>
            ) : null}
            <View style={styles.deleteModalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteCancelButton,
                  pressed && styles.deleteCancelButtonPressed,
                ]}
                onPress={closeDeleteModal}
              >
                <Text style={styles.deleteCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteConfirmButton,
                  pressed && styles.deleteConfirmButtonPressed,
                ]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.listWrapper}>
        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          data={paginatedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-outline" size={40} color="#555" />
              <Text style={styles.emptyText}>Nenhuma lista encontrada</Text>
            </View>
          }
        />
        {showPagination ? (
          <View style={styles.paginationBar}>
            <Pressable
              style={({ pressed }) => [
                styles.paginationButton,
                currentPage <= 1 && styles.paginationButtonDisabled,
                pressed && currentPage > 1 && styles.paginationButtonPressed,
              ]}
              onPress={goPrevPage}
              disabled={currentPage <= 1}
              accessibilityRole="button"
              accessibilityLabel="Página anterior"
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={currentPage <= 1 ? '#555' : '#ffd33d'}
              />
            </Pressable>
            <Text style={styles.paginationLabel}>
              Página {currentPage} de {totalPages}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.paginationButton,
                currentPage >= totalPages && styles.paginationButtonDisabled,
                pressed && currentPage < totalPages && styles.paginationButtonPressed,
              ]}
              onPress={goNextPage}
              disabled={currentPage >= totalPages}
              accessibilityRole="button"
              accessibilityLabel="Próxima página"
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentPage >= totalPages ? '#555' : '#ffd33d'}
              />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function createTasksListStyles(scaleFont: (baseSize: number) => number, colorContrast: ColorContrastPreset) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    listWrapper: {
      marginTop: 24,
      flex: 1,
    },
    list: {
      flex: 1,
    },
    paginationBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: '#333',
      backgroundColor: '#15181c',
    },
    paginationButton: {
      padding: 8,
      borderRadius: 8,
    },
    paginationButtonDisabled: {
      opacity: 0.5,
    },
    paginationButtonPressed: {
      opacity: 0.75,
    },
    paginationLabel: {
      fontSize: scaleFont(14),
      color: '#aaa',
      minWidth: 120,
      textAlign: 'center',
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },
    chipsScroll: {
      flexGrow: 0,
      marginBottom: 4,
    },
    chipsContent: {
      paddingHorizontal: 16,
      gap: 8,
      paddingVertical: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#555',
      backgroundColor: 'transparent',
    },
    chipSelected: {
      backgroundColor: '#ffd33d',
      borderColor: '#ffd33d',
    },
    chipText: {
      color: '#ccc',
      fontSize: 13,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: '#25292e',
      fontWeight: '600',
    },
    dateToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    dateToggleText: {
      fontSize: 13,
      color: '#aaa',
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    dateField: {
      flex: 1,
    },
    dateLabel: {
      fontSize: 12,
      color: '#aaa',
      marginBottom: 4,
    },
    dateInput: {
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 14,
      color: '#eee',
    },
    dateInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#444',
      borderRadius: 8,
      backgroundColor: '#1a1e23',
      paddingRight: 6,
    },
    dateClear: {
      padding: 4,
    },
    resultCount: {
      fontSize: scaleFont(12),
      color: '#666',
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    clearButtonText: {
      fontSize: 12,
      color: '#ffd33d',
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginVertical: 4,
      marginHorizontal: 16,
      borderRadius: 10,
      backgroundColor: colorContrast === 'normal' ? '#1e2329' : '#0B0B0E',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    itemLeft: {
      flex: 1,
      marginRight: 8,
    },
    title: {
      color: '#fff',
      fontWeight: '600',
      fontSize: scaleFont(15),
      marginBottom: 2,
    },
    typeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#2d333b',
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginBottom: 4,
    },
    typeBadgeText: {
      fontSize: 11,
      color: '#aaa',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    description: {
      color: '#ddd',
      fontWeight: '500',
      fontSize: scaleFont(14),
    },
    date: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 2,
    },
    itemRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    amount: {
      fontWeight: '700',
      fontSize: 15,
    },
    income: {
      color: '#16a34a',
    },
    expense: {
      color: '#ef4444',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 6,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: scaleFont(40),
      height: scaleFont(40),
      padding: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#dc2626',
      backgroundColor: 'rgba(220,38,38,0.1)',
    },
    deleteButtonIcon: {
      fontSize: scaleFont(14),
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 60,
      gap: 12,
    },
    emptyText: {
      color: '#555',
      fontSize: scaleFont(15),
    },
    footer: {
      marginVertical: 16,
    },
    deleteModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    deleteModalCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
    },
    deleteModalTitle: {
      fontSize: scaleFont(18),
      fontWeight: '700',
      marginBottom: 8,
      color: '#111',
    },
    deleteModalMessage: {
      fontSize: scaleFont(14),
      color: '#444',
      lineHeight: scaleFont(20),
      marginBottom: 16,
    },
    deleteModalSummary: {
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      gap: 4,
    },
    deleteModalSummaryLabel: {
      fontSize: scaleFont(13),
      color: '#374151',
    },
    deleteModalSummaryAmount: {
      fontSize: 16,
      fontWeight: '700',
    },
    deleteModalAmountPositive: {
      color: '#16a34a',
    },
    deleteModalAmountNegative: {
      color: '#dc2626',
    },
    deleteModalActions: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
    deleteCancelButton: {
      minWidth: 120,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteCancelButtonPressed: {
      opacity: 0.85,
    },
    deleteCancelButtonText: {
      fontSize: scaleFont(14),
      fontWeight: '600',
      color: theme.primary,
    },
    deleteConfirmButton: {
      minWidth: 120,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: '#dc2626',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#dc2626',
    },
    deleteConfirmButtonPressed: {
      opacity: 0.85,
    },
    deleteConfirmButtonText: {
      fontSize: scaleFont(14),
      fontWeight: '600',
      color: '#fff',
    },
  })
}

