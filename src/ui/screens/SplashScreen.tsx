import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../lib/Logo';
import { categoryService } from '../../services/categoryService';

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check if we've already seeded categories
                const hasSeeded = await AsyncStorage.getItem('hasSeededCategories');

                if (!hasSeeded) {
                    // Seed default categories
                    await categoryService.seedDefaultCategories();
                    await AsyncStorage.setItem('hasSeededCategories', 'true');
                }
            } catch (error) {
                console.error('Failed to initialize app:', error);
                // Continue anyway - don't block app startup
            }
        };

        initializeApp();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Simulate loading time (e.g., fetching user data, checking auth)
        const timer = setTimeout(() => {
            // Animate out
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.5,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onFinish();
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Logo width={150} height={150} />
                <Text style={styles.appName}>MyAccounts</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FC', // Match app background or use a brand color
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        marginTop: 20,
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        letterSpacing: 1,
    },
});
