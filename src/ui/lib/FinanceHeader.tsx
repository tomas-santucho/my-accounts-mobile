import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FinanceHeader() {
    const [currency, setCurrency] = useState('USD');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Finances</Text>
                    <Text style={styles.subtitle}>
                        Track your expenses and income to reach your financial goals
                    </Text>
                </View>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            currency === 'USD' && styles.activeToggle
                        ]}
                        onPress={() => setCurrency('USD')}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                currency === 'USD' && styles.activeText
                            ]}
                        >
                            USD
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            currency === 'ARS' && styles.activeToggle
                        ]}
                        onPress={() => setCurrency('ARS')}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                currency === 'ARS' && styles.activeText
                            ]}
                        >
                            ARS
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addText}>+ Add Transaction</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A2343', // deep navy like the one in your screenshot
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    subtitle: {
        color: '#B0B6D1',
        fontSize: 12,
        marginTop: 4,
        width: 220
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#2B3258',
        borderRadius: 20,
        overflow: 'hidden'
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 15
    },
    toggleText: {
        color: '#999',
        fontWeight: '600'
    },
    activeToggle: {
        backgroundColor: '#fff'
    },
    activeText: {
        color: '#1A2343'
    },
    addButton: {
        backgroundColor: '#FF5B00',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    addText: {
        color: '#fff',
        fontWeight: '600'
    }
});
