<template>
  <div class="layout-default">
    <aside>
      <div class="aside-container bg-gray-50">
        <AppNavBar class="" />
      </div>
    </aside>
    <main>
      <slot />
    </main>
  </div>
</template>


<style lang="css" scoped>
.layout-default {
  position: relative;
  display: grid;
  grid-template-columns: 220px calc(100vw - 235px);
}

.layout-default>aside .logo {
  display: block;
  box-sizing: content-box;
  height: 2rem;
  margin: 0 auto;
}

.aside-container {
  position: fixed;
}
</style>