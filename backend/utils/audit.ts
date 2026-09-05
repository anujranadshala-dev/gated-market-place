export function logAudit(action: string, userId: string, userRole: string, details: Record<string, any> = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId,
        userRole,
        ...details,
    };
    console.log('[AUDIT]', JSON.stringify(logEntry));
}
