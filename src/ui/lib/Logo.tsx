import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
    width?: number;
    height?: number;
}

export default function Logo({ width = 120, height = 120 }: LogoProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <Defs>
                <LinearGradient id="grad1" x1="0" y1="0" x2="120" y2="120">
                    <Stop offset="0" stopColor="#FF7F50" />
                    <Stop offset="1" stopColor="#FF4500" />
                </LinearGradient>
                <LinearGradient id="grad2" x1="120" y1="0" x2="0" y2="120">
                    <Stop offset="0" stopColor="#4A90E2" />
                    <Stop offset="1" stopColor="#0056b3" />
                </LinearGradient>
            </Defs>

            {/* Outer Ring / Coin Shape */}
            <Circle cx="60" cy="60" r="50" stroke="url(#grad1)" strokeWidth="8" strokeOpacity="0.2" />

            {/* Abstract Chart / Graph Lines */}
            <Path
                d="M35 75 L55 55 L70 70 L90 40"
                stroke="url(#grad1)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dot at the peak */}
            <Circle cx="90" cy="40" r="6" fill="url(#grad2)" />
        </Svg>
    );
}
