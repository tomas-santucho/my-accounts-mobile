import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';

export default function SettingsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* User Profile Section */}
            <View style={styles.section}>
                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={40} color="#FFF" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Tomas Santucho</Text>
                        <Text style={styles.profileEmail}>voidsynths@proton.me</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="pencil-outline" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Data & Sync Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data & Sync</Text>
                <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                    <View style={styles.settingIconContainer}>
                        <Ionicons name="cloud-upload-outline" size={22} color="#4A90E2" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingLabel}>Sync with Database</Text>
                        <Text style={styles.settingSubLabel}>Backup your data to the cloud</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
            </View>

            {/* Preferences Section (Placeholder for future) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                    <View style={[styles.settingIconContainer, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="moon-outline" size={22} color="#4CAF50" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingLabel}>Dark Mode</Text>
                        <Text style={styles.settingSubLabel}>System Default</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                    <View style={[styles.settingIconContainer, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="notifications-outline" size={22} color="#FF9800" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingLabel}>Notifications</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
            </View>

            {/* Debug Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Debug</Text>
                <TouchableOpacity
                    style={styles.settingItem}
                    activeOpacity={0.7}
                    onPress={() => {
                        Sentry.captureMessage("Manual Test Message from Settings");
                        alert("Sent test message to Sentry");
                    }}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="paper-plane-outline" size={22} color="#2196F3" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingLabel}>Send Test Message</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingItem}
                    activeOpacity={0.7}
                    onPress={() => {
                        throw new Error("Test Sentry Crash from Settings");
                    }}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: '#FFEBEE' }]}>
                        <Ionicons name="bug-outline" size={22} color="#D32F2F" />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingLabel}>Force Crash</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FC',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF7F50', // Coral to match brand
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    profileEmail: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    editButton: {
        padding: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    settingSubLabel: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: '#FFF0F0',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 16
    }
});
