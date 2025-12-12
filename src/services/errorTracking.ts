import { usePostHog } from 'posthog-react-native';

/**
 * Error tracking service using PostHog
 * This replaces Sentry for error monitoring
 */
class ErrorTrackingService {
    private posthog: ReturnType<typeof usePostHog> | null = null;

    setPostHog(posthog: ReturnType<typeof usePostHog>) {
        this.posthog = posthog;
    }

    /**
     * Capture an exception and send it to PostHog
     */
    captureException(error: Error | unknown, context?: Record<string, any>) {
        if (!this.posthog) {
            console.error('PostHog not initialized. Error:', error);
            return;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.posthog.capture('$exception', {
            $exception_message: errorMessage,
            $exception_type: error instanceof Error ? error.name : 'Unknown',
            ...(errorStack ? { $exception_stack_trace_raw: errorStack } : {}),
            ...context,
        });

        // Also log to console for development
        console.error('Error captured:', error);
    }

    /**
     * Capture a message for debugging
     */
    captureMessage(message: string, context?: Record<string, any>) {
        if (!this.posthog) {
            console.warn('PostHog not initialized. Message:', message);
            return;
        }

        this.posthog.capture('debug_message', {
            message,
            ...context,
        });

        console.log('Message captured:', message);
    }
}

export const errorTracking = new ErrorTrackingService();
