<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

useHead({ title: 'Privacy Policy — GremMigrate' })
</script>

<template>
  <div class="w-full max-w-2xl">
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t('privacyBack') }}
    </NuxtLink>

    <div class="card-glass rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/20">
      <h1 class="text-2xl font-bold text-white mb-2">{{ t('privacyTitle') }}</h1>
      <p class="text-zinc-500 text-sm mb-8">{{ t('privacyUpdated') }}</p>

      <div class="space-y-6 text-zinc-400 text-sm leading-relaxed">
        <section>
          <h2 class="text-lg font-semibold text-zinc-200 mb-2">{{ t('privacyNoDataTitle') }}</h2>
          <p>{{ t('privacyNoData') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-zinc-200 mb-2">{{ t('privacyNoCookiesTitle') }}</h2>
          <p>{{ t('privacyNoCookies') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-zinc-200 mb-2">{{ t('privacyNoNetworkTitle') }}</h2>
          <p>{{ t('privacyNoNetwork') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-zinc-200 mb-2">{{ t('privacyFileTitle') }}</h2>
          <p>{{ t('privacyFile') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-zinc-200 mb-2">{{ t('privacyOpenSourceTitle') }}</h2>
          <p>{{ t('privacyOpenSource') }}</p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-zinc-200 mb-2">{{ t('privacyContactTitle') }}</h2>
          <p>
            {{ t('privacyContact') }}
            <a href="https://github.com/Drrakendu78" target="_blank" rel="noopener" class="text-emerald-400 hover:text-emerald-300 transition-colors">@Drrakendu78</a>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
