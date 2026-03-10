import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import api from '../../lib/api';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/portal/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.log('Error fetching projects:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Projects</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No active projects found.</Text>
          ) : (
            projects.map((p) => (
              <Link href={`/project/${p.id}`} key={p.id} asChild>
                <TouchableOpacity style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.projectTitle}>{p.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.description}>{p.description}</Text>
                  
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      Tap to view board & timeline <Text style={{ fontSize: 16 }}>→</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, 
  },
  badge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 12,
  },
  footerText: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600'
  },
});