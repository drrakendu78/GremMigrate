<template>
  <div class="min-h-screen flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
    <!-- Background effects -->
    <div class="fixed inset-0 -z-10">
      <!-- Base gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900" />
      <!-- Blue glow top -->
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/[0.07] rounded-full blur-[120px]" />
      <!-- Subtle purple glow bottom-right -->
      <div class="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-grid opacity-[0.03]" />
    </div>

    <!-- Language switcher top-right -->
    <div class="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
      <LangSwitcher />
    </div>

    <div class="flex-1 flex items-center justify-center w-full">
      <NuxtPage />
    </div>

    <AppFooter />
  </div>
</template>
