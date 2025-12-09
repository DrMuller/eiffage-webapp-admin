export default defineNuxtRouteMiddleware(async () => {
    const { user, isAuthenticated, initAuth } = useAuth()

    // Initialize auth first
    await initAuth()

    // Check if user is authenticated
    if (!isAuthenticated.value) {
        return navigateTo('/auth/signin')
    }

    // Check if user has admin or manager role
    const isAdminOrManager = user.value?.roles?.some(role => ['ADMIN', 'MANAGER'].includes(role))

    if (!isAdminOrManager) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Accès refusé. Privilèges administrateur ou manager requis.'
        })
    }
})
