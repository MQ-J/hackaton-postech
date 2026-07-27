import { PrimaryButton } from '@/components/PrimaryButton'
import { ColorContrastPreset, useAccessibility } from '@/contexts/AccessibilityContext'
import { useAccount } from '@/contexts/AccountContext'
import {
  type TaskFormValues,
  taskSchema
} from '@/lib/task-schema'
import type { Task } from '@/lib/types'
import { theme } from '@/theme/colors'
import {
  Ionicons,
} from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSubmitEditingEvent,
  View
} from 'react-native'

import Toast from 'react-native-toast-message'

interface TaskFormProps {
  /** When provided the form operates in edit mode */
  task?: Task
  onSuccess?: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { scaleFont, colorContrast, interfaceMode } = useAccessibility()
  const { account, addTask, updateTask } = useAccount()
  const isEditMode = Boolean(task)

  const styles = useMemo(() => createTaskFormStyles(scaleFont, colorContrast), [scaleFont, colorContrast])

  const placeholderTextColor = colorContrast === 'normal' ? '#999' : '#333'

  const {
    control,
    watch,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      items: task?.items?.map((item) => ({
        description: item.description,
        checked: item.checked,
      })) || [{ description: '', checked: false }],
    },
  })

  const watchedItems = watch('items') ?? []

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title ?? '',
        description: task.description ?? '',
        items: task.items?.map((item) => ({
          description: item.description,
          checked: item.checked,
        })) ?? [],
      })
    } else {
      reset({
        title: '',
        description: '',
        items: [{ description: '', checked: false }],
      })
    }
  }, [task, reset])

  // Small timeout ensures the modal native transition finishes rendering the input
  useEffect(() => {
    if (!task) {
      const timer = setTimeout(() => {
        setFocus('items.0.description');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [task, setFocus]);

  const onSubmit = async (values: TaskFormValues) => {
    if (!account) {
      Toast.show({
        type: 'error',
        text1: 'Sessão indisponível',
        text2: 'Faça login novamente para salvar a tarefa.',
      })
      return
    }

    const presetId = isEditMode && task ? task.id : Date.now().toString()

    const itemsPayload: Task['items'] = (values.items ?? []).filter(item => !!item.description).map((item, index) => ({
      id: item.id ?? `${Date.now()}-${index}`,
      description: item.description.trim(),
      checked: item.checked,
    }))

    const basePayload: Omit<Task, 'id'> = {
      title: values.title?.trim() || undefined,
      description: values.description?.trim() || undefined,
      items: itemsPayload,
    }

    if (isEditMode && task) {
      updateTask(task.id, basePayload)
    } else {
      const newTask: Omit<Task, 'id'> = {
        ...basePayload,
      }
      addTask(newTask, presetId)
    }

    reset()
    onSuccess?.()
  }

  const handleAction = (e: TextInputSubmitEditingEvent) => {
    const submittedText = e.nativeEvent.text;

    if (!submittedText.trim()) return;

    append({ description: '', checked: false });

  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      {/* Title */}
      {
        interfaceMode === 'advanced' && (
          <>
            <Text style={styles.fieldLabel}>Título (opcional)</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Título da tarefa"
                  placeholderTextColor={placeholderTextColor}
                  maxLength={120}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}
          </>
        )
      }

      {/* Description */}
      {
        interfaceMode === 'advanced' && (
          <>
            <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[styles.input, errors.description && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Descrição da tarefa"
                  placeholderTextColor={placeholderTextColor}
                  maxLength={120}
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}
          </>
        )
      }


      <Text style={styles.fieldLabel}>Itens da lista</Text>
      {fields.map((field, index) => (
        <View key={field.id} style={styles.itemRow}>
          {interfaceMode === 'advanced' && (
            <Controller
              control={control}
              name={`items.${index}.checked`}
              render={({ field: { value, onChange } }) => (
                <Pressable
                  onPress={() => onChange(!value)}
                  style={[styles.checkbox, value && styles.checkboxChecked]}
                >
                  {value ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                </Pressable>
              )}
            />
          )}

          <Controller
            control={control}
            name={`items.${index}.description`}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <TextInput
                ref={ref}
                style={[
                  styles.input,
                  styles.itemInput,
                  interfaceMode === 'advanced' && watchedItems[index]?.checked && styles.itemCompleted,
                  errors.items?.[index]?.description && styles.inputError,
                ]}
                value={value}
                onChangeText={onChange}
                onSubmitEditing={handleAction}
                submitBehavior="submit"
                onBlur={onBlur}
                placeholder={`Item ${index + 1}`}
                placeholderTextColor={placeholderTextColor}
                maxLength={120}
              />
            )}
          />
          {
            fields.length === (index + 1) ? (
              <Pressable onPress={() => append({ description: '', checked: false })} style={styles.addButton}>
                <Text style={styles.addButtonText}>Adicionar</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => remove(index)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remover</Text>
              </Pressable>
            )
          }

        </View>
      ))}
      {errors.items?.message ? (
        <Text style={styles.errorText}>{errors.items.message}</Text>
      ) : null}

      <PrimaryButton
        label={isEditMode ? 'Salvar alterações' : 'Salvar lista'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={styles.submitButton}
      />
    </ScrollView>
  )
}

function createTaskFormStyles(scaleFont: (baseSize: number) => number, colorContrast: ColorContrastPreset) {
  return StyleSheet.create({
    fieldLabel: {
      fontSize: 14,
      fontWeight: colorContrast === 'normal' ? '500' : 'bold',
      color: '#333',
      marginBottom: 4,
      marginTop: 8,
    },
    typeTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: '#fff',
    },
    typeTriggerText: {
      fontSize: 16,
      color: '#333',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: '#333',
    },
    modalOption: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    modalOptionSelected: {
      backgroundColor: theme.primary,
    },
    modalOptionText: {
      fontSize: 16,
      color: '#333',
    },
    modalOptionTextSelected: {
      color: theme.primaryForeground,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      backgroundColor: '#fff',
      paddingLeft: 12,
    },
    currencyPrefix: {
      fontSize: 16,
      color: '#666',
      marginRight: 4,
    },
    amountInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      paddingRight: 12,
      color: '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: colorContrast === 'normal' ? '#ddd' : '#333',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#fff',
      color: '#333',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemInput: {
      flex: 1,
    },
    itemCompleted: {
      textDecorationLine: 'line-through',
      color: '#666',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    checkboxChecked: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    addButton: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderColor: colorContrast === 'normal' ? '#ddd' : '#333',
      borderWidth: 1,
      borderRadius: 8,
    },
    removeButton: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderColor: colorContrast === 'normal' ? '#dc2626' : '#9A1919',
      borderWidth: 1,
      borderRadius: 8,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    removeButtonText: {
      color: '#dc2626',
      fontSize: 14,
      fontWeight: '600',
    },
    inputError: {
      borderColor: '#dc2626',
    },
    errorText: {
      fontSize: 12,
      color: '#dc2626',
      marginTop: 2,
    },
    receiptRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    receiptButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#fff',
    },
    receiptButtonText: {
      fontSize: 14,
      color: '#333',
    },
    receiptPreview: {
      width: '100%',
      height: 160,
      borderRadius: 8,
      marginTop: 4,
    },
    receiptFilePreview: {
      width: '100%',
      minHeight: 120,
      borderRadius: 8,
      marginTop: 4,
      borderWidth: 1,
      borderColor: '#ddd',
      backgroundColor: '#f9fafb',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 8,
    },
    receiptFilePreviewText: {
      fontSize: 14,
      color: '#444',
      textAlign: 'center',
    },
    uploadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    uploadingText: {
      fontSize: 14,
      color: '#666',
    },
    scroll: {
      flex: 1,
    },
    container: {
      gap: 6,
      paddingBottom: 32,
    },
    addItemButton: {
      marginTop: 4,
    },
    submitButton: {
      marginTop: 16,
      backgroundColor: '#ffd33d',
      borderColor: colorContrast === 'normal' ? undefined : '#333',
    },
  })
}
