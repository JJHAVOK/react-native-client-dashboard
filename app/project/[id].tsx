import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../lib/api';
import * as Haptics from 'expo-haptics';

// SKELETON
const SkeletonProject = () => (
  <View style={styles.container}>
    <View style={{ height: 60, backgroundColor: '#18181b', margin: 20, borderRadius: 8, opacity: 0.5 }} />
    <View style={{ height: 200, backgroundColor: '#18181b', marginHorizontal: 20, borderRadius: 8, opacity: 0.5 }} />
  </View>
);

export default function MobileProjectDetail() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProject = () => {
    api.get('/customer/portal/projects')
      .then(res => setProject(res.data.find((p: any) => p.id === id)))
      .catch(() => {})
      .finally(() => { 
        setLoading(false); 
        setRefreshing(false); 
      });
  };

  useEffect(() => { 
    fetchProject(); 
  }, [id]);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    fetchProject();
  }, [id]);

  if (loading) return <SkeletonProject />;
  
  if (!project) {
      return (
          <View style={styles.container}>
              <Text style={styles.errorText}>Project not found.</Text>
          </View>
      );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#0ea5e9" 
          colors={['#0ea5e9']} 
          title="Refreshing..." 
          titleColor="#0ea5e9" 
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{project.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{project.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline & Updates</Text>
        {project.updates?.filter((u: any) => u.isPublic).length > 0 ? (
          project.updates.filter((u: any) => u.isPublic).map((update: any) => (
            <View key={update.id} style={styles.updateCard}>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateDate}>{new Date(update.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.updateDesc}>{update.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No updates posted yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.boardHeader}>
          <Text style={styles.sectionTitle}>Progress Board</Text>
          <Text style={styles.swipeHint}>Swipe ↔️</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ paddingBottom: 20 }}>
          {project.columns?.filter((col: any) => col.isPublic).map((col: any) => (
            <View key={col.id} style={styles.column}>
              <Text style={styles.columnTitle}>{col.name}</Text>
              {col.tasks?.filter((t: any) => t.isPublic).map((task: any) => (
                <View key={task.id} style={styles.taskCard}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskPriority}>{task.priority}</Text>
                </View>
              ))}
            </View>
          ))}
          {(!project.columns || project.columns.filter((col: any) => col.isPublic).length === 0) && (
            <Text style={styles.emptyText}>No board setup yet.</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#09090b' }, 
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#27272a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, 
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', flex: 1 }, 
  badge: { backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10 }, 
  badgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' }, 
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#27272a' }, 
  boardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 15 }, 
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }, 
  swipeHint: { color: '#71717a', fontSize: 12, fontWeight: 'bold' }, 
  emptyText: { color: '#71717a' }, 
  updateCard: { backgroundColor: '#18181b', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#27272a' }, 
  updateTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }, 
  updateDate: { color: '#0ea5e9', fontSize: 12, marginBottom: 5 }, 
  updateDesc: { color: '#a1a1aa', fontSize: 14 }, 
  column: { backgroundColor: '#18181b', padding: 10, borderRadius: 8, width: 280, marginRight: 15, borderWidth: 1, borderColor: '#27272a' }, 
  columnTitle: { color: '#ffffff', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }, 
  taskCard: { backgroundColor: '#27272a', padding: 10, borderRadius: 6, marginBottom: 8 }, 
  taskTitle: { color: '#ffffff', fontSize: 14, fontWeight: '500' }, 
  taskPriority: { color: '#a1a1aa', fontSize: 10, marginTop: 4 }, 
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 50 } 
});