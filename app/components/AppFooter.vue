<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <footer class="w-full max-w-2xl mx-auto mt-12 mb-6 px-4">
    <div class="border-t border-zinc-800/50 pt-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Left: branding -->
        <div class="flex items-center gap-2 text-zinc-500 text-xs">
          <span class="text-zinc-400 font-medium">GremMigrate</span>
          <span class="text-zinc-700">|</span>
          <span>{{ t('footerFree') }}</span>
        </div>

        <!-- Center: links -->
        <div class="flex items-center gap-4 text-xs">
          <NuxtLink to="/privacy" class="text-zinc-500 hover:text-zinc-300 transition-colors">
            {{ t('footerPrivacy') }}
          </NuxtLink>
          <a href="https://github.com/drrakendu78/GremMigrate" target="_blank" rel="noopener" class="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>

        <!-- Right: credit -->
        <div class="text-zinc-600 text-xs">
          {{ t('footerMadeBy') }}
          <a href="https://github.com/Drrakendu78" target="_blank" rel="noopener" class="text-zinc-400 hover:text-emerald-400 transition-colors font-medium">
            Drrakendu78
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
