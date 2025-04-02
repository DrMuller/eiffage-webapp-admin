export default defineNuxtRouteMiddleware(async () => {
    const { user, isAuthenticated, initAuth } = useAuth()

    // Initialize auth first
    await initAuth()

    // Check if user is authenticated
    if (!isAuthenticated.value) {
        return navigateTo('/auth/signin')
    }

    // Check if user has admin role
    const isAdmin = user.value?.roles?.includes('ADMIN')

    if (!isAdmin) {
        // Rediriger vers la page d'accueil ou afficher un message d'accès refusé
        throw createError({
            statusCode: 403,
            statusMessage: 'Accès refusé. Privilèges administrateur requis.'
        })
    }
})
