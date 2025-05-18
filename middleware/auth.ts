
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, initAuth } = useAuth()
  await initAuth()
  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated.value && to.meta.requiresAuth) {
    // Redirect to login page with the returnUrl
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath }
    })
  }

  // If user is authenticated and trying to access login page
  if (isAuthenticated.value && to.path === '/auth/signin') {
    // Redirect to home page
    return navigateTo('/')
  }
})