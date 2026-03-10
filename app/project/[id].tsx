import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../lib/api';

export default function MobileProjectDetail() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/portal/projects')
      .then(res => {
         const found = res.data.find((p: any) => p.id === id);
         setProject(found);
      })
      .catch(err => console.log('Error fetching project:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.container}><ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 50 }} /></View>;
  if (!project) return <View style={styles.container}><Text style={styles.errorText}>Project not found.</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{project.name}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{project.status}</Text></View>
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
        {/* Added a flex row to put the swipe hint next to the title */}
        <View style={styles.boardHeader}>
            <Text style={styles.sectionTitle}>Progress Board</Text>
            <Text style={styles.swipeHint}>Swipe ↔️</Text>
        </View>
        
        {/* Turned on the horizontal scroll indicator */}
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
             <Text style={styles.emptyText}>No board columns setup yet.</Text>
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
  
  // Widened the column to 280 so the next card peeks onto the screen
  column: { backgroundColor: '#18181b', padding: 10, borderRadius: 8, width: 280, marginRight: 15, borderWidth: 1, borderColor: '#27272a' },
  
  columnTitle: { color: '#ffffff', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  taskCard: { backgroundColor: '#27272a', padding: 10, borderRadius: 6, marginBottom: 8 },
  taskTitle: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  taskPriority: { color: '#a1a1aa', fontSize: 10, marginTop: 4 },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 50 },
});