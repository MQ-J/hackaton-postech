import { TaskForm } from '@/components/TaskForm';
import TasksList from '@/components/TasksList';
import { useAnimate } from '@/hooks/useAnimate';
import type { Task } from '@/lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);

  const { opacity, translateY } = useAnimate()

  const openAdd = () => {
    setHasOpenedModal(true);
    setEditingTask(null);
    setModalVisible(true);
  };

  const openEdit = (task: Task) => {
    setHasOpenedModal(true);
    setEditingTask(task);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTask(null);
  };

  return (
    <SafeAreaView style={styles.safeRoot} edges={['top']}>
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <TasksList onEdit={openEdit} />
      </Animated.View>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#25292e" /> <Text>Nova lista</Text>
      </Pressable>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Editar lista' : 'Nova lista'}
            </Text>
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            {hasOpenedModal && (
              <TaskForm
                task={editingTask ?? undefined}
                onSuccess={closeModal}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 105,
    height: 45,
    borderRadius: 28,
    backgroundColor: '#ffd33d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
});
