<template>
  <div class="min-h-screen flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
    <!-- Background -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-[#0a0a0f]" />
      <!-- Subtle blue radial behind content -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[160px]" style="background: radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" />
      <!-- Grid -->
      <div class="absolute inset-0 bg-grid opacity-[0.035]" />
    </div>

    <!-- Language switcher -->
    <div class="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
      <LangSwitcher />
    </div>

    <div class="flex-1 flex items-center justify-center w-full pointer-events-none">
      <div class="pointer-events-auto">
        <NuxtPage />
      </div>
    </div>

    <AppFooter />
  </div>
</template>
