import { PrimaryButton } from '@/components/PrimaryButton'
import { useAccount } from '@/contexts/AccountContext'
import { auth } from '@/firebase/config'
import {
  type TaskFormValues,
  taskSchema
} from '@/lib/task-schema'
import type { Task } from '@/lib/types'
import { theme } from '@/theme/colors'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native'
import Toast from 'react-native-toast-message'

interface TaskFormProps {
  /** When provided the form operates in edit mode */
  task?: Task
  onSuccess?: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { account, addTask, updateTask } = useAccount()
  const isEditMode = Boolean(task)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title ?? '',
        description: task.description ?? '',
      })
    } else {
      reset({
        title: '',
        description: '',
      })
    }
  }, [task, reset])

  const onSubmit = async (values: TaskFormValues) => {
    if (!account) {
      Toast.show({
        type: 'error',
        text1: 'Sessão indisponível',
        text2: 'Faça login novamente para salvar a tarefa.',
      })
      return
    }

    const uid = account.uid ?? auth.currentUser?.uid
    if (!uid) {
      Toast.show({
        type: 'error',
        text1: 'Sessão inválida',
        text2: 'Não foi possível identificar o usuário para enviar o arquivo.',
      })
      return
    }

    const presetId = isEditMode && task ? task.id : Date.now().toString()

    const basePayload = {
      title: values.title?.trim(),
      description:
        (values.description?.trim()),
    }

    if (isEditMode && task) {

      updateTask(task.id, basePayload)
    } else {
      const newTask: Omit<Task, 'id'> = {
        ...basePayload,
        items: [],
      }
      addTask(newTask, presetId)
    }

    reset()
    onSuccess?.()
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
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
            placeholderTextColor="#999"
            maxLength={120}
          />
        )}
      />
      {errors.title && (
        <Text style={styles.errorText}>{errors.title.message}</Text>
      )}

      {/* Description */}
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
            placeholderTextColor="#999"
            maxLength={120}
          />
        )}
      />
      {errors.description && (
        <Text style={styles.errorText}>{errors.description.message}</Text>
      )}

      <PrimaryButton
        label={isEditMode ? 'Salvar alterações' : 'Concluir tarefa'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={styles.submitButton}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
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
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
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
  submitButton: {
    marginTop: 16,
  },
})
