<script setup lang="ts">
import { useConverter } from '~/composables/useConverter'
import { useI18n } from '~/composables/useI18n'

const { status, fileName, result, error, copied, handleFile, download, copyXml, reset } = useConverter()
const { t } = useI18n()

const isDragging = ref(false)

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.name.endsWith('.xml')) {
    handleFile(file)
  }
}

function onFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
  target.value = ''
}

const fileInput = ref<HTMLInputElement | null>(null)
</script>

<template>
  <div class="w-full max-w-xl">
    <!-- Header -->
    <div class="text-center mb-10">
      <div class="mx-auto w-[420px] sm:w-[560px] logo-glow mb-4">
        <img
          src="/og-image.png"
          alt="GremMigrate"
          class="w-full mix-blend-lighten"
        />
      </div>
      <div class="mt-2 inline-flex items-center gap-2 version-badge rounded-full px-3 py-1">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-emerald-400/80 text-xs font-medium">{{ t('tagline') }}</span>
      </div>
      <p class="text-zinc-600 text-xs mt-3">{{ t('subtitle') }}</p>
    </div>

    <!-- Card -->
    <div class="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-blue-500/15" style="background: rgba(9,9,11,0.95); box-shadow: 0 0 25px 3px rgba(59,130,246,0.08), 0 0 60px 10px rgba(59,130,246,0.04)">
      <Transition name="fade" mode="out-in">
        <!-- Upload state -->
        <div v-if="status === 'idle'" key="idle">
          <div
            class="drop-zone-border rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/[0.02]"
            :class="[
              isDragging ? 'dragging !border-blue-500/40 !bg-blue-500/[0.03]' : '',
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInput?.click()"
          >
            <div class="mb-4">
              <svg v-if="isDragging" class="w-12 h-12 mx-auto text-emerald-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <svg v-else class="w-12 h-12 mx-auto text-zinc-500 animate-bounce" style="animation-duration: 3s" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p class="text-zinc-200 font-medium text-base">
              {{ t('dropTitle') }}
            </p>
            <p class="text-zinc-500 text-sm mt-1.5">
              {{ t('dropOr') }}
            </p>
            <p class="text-zinc-600 text-xs mt-4">
              {{ t('dropAccepts') }}
            </p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".xml"
            class="hidden"
            @change="onFileInput"
          >
          <div class="mt-5 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-blue-300 text-sm font-semibold mb-1">{{ t('noteTitle') }}</p>
              <p class="text-zinc-400 text-xs leading-relaxed">{{ t('noteText') }} <span class="text-blue-300/80 font-medium">{{ t('noteSkipped') }}</span> {{ t('noteSuffix') }}</p>
            </div>
          </div>
        </div>

        <!-- Processing state -->
        <div v-else-if="status === 'parsing' || status === 'converting'" key="processing" class="text-center py-10">
          <div class="inline-block rounded-full h-12 w-12 border-2 border-zinc-700 border-t-emerald-500 animate-spin mb-5 pulse-glow" />
          <p class="text-zinc-200 font-medium text-base">
            {{ status === 'parsing' ? t('parsing') : t('converting') }}
          </p>
          <p class="text-zinc-500 text-sm mt-2 truncate max-w-xs mx-auto">
            {{ fileName }}
          </p>
        </div>

        <!-- Error state -->
        <div v-else-if="status === 'error'" key="error" class="text-center py-8">
          <div class="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-red-400 font-semibold text-lg">
            {{ t('errorTitle') }}
          </p>
          <p class="text-zinc-400 text-sm mt-4 bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 text-left">
            {{ error }}
          </p>
          <button
            class="mt-6 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            @click="reset"
          >
            {{ t('errorRetry') }}
          </button>
        </div>

        <!-- Done state -->
        <div v-else-if="status === 'done' && result" key="done" class="py-2">
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-emerald-400 font-semibold text-lg">
              {{ t('doneTitle') }}
            </p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div class="stat-card bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-white">{{ result.stats.devicesCount }}</div>
              <div class="text-zinc-500 text-xs mt-0.5">{{ t('devices') }}</div>
            </div>
            <div class="stat-card bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-white">{{ result.stats.modesCount }}</div>
              <div class="text-zinc-500 text-xs mt-0.5">{{ t('modes') }}</div>
            </div>
            <div class="stat-card bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-white">{{ result.stats.actionsCount }}</div>
              <div class="text-zinc-500 text-xs mt-0.5">{{ t('actions') }}</div>
            </div>
            <div class="stat-card bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-white">{{ result.stats.inputsCount }}</div>
              <div class="text-zinc-500 text-xs mt-0.5">{{ t('inputs') }}</div>
            </div>
          </div>

          <!-- Device details -->
          <details v-if="result.stats.devices && result.stats.devices.length > 0" class="mb-6">
            <summary class="text-zinc-400 text-sm cursor-pointer hover:text-zinc-300 transition-colors select-none">
              {{ t('viewDetails') }}
            </summary>
            <div class="mt-2 space-y-2">
              <div v-for="dev in result.stats.devices" :key="dev.guid" class="bg-zinc-800/30 border border-zinc-700/20 rounded-lg p-3">
                <p class="text-zinc-200 text-sm font-medium">{{ dev.name }}</p>
                <div v-for="mode in dev.modes" :key="mode.name" class="flex justify-between text-xs text-zinc-400 mt-1 ml-3">
                  <span>{{ mode.name }}</span>
                  <span>{{ mode.inputCount }} {{ t('inputs').toLowerCase() }}, {{ mode.actionCount }} {{ t('actions').toLowerCase() }}</span>
                </div>
              </div>
            </div>
          </details>

          <!-- Warnings -->
          <div v-if="result.warnings.length > 0" class="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p class="text-amber-400 text-sm font-semibold">
                {{ result.warnings.length }} {{ result.warnings.length > 1 ? t('warnings') : t('warning') }}
              </p>
            </div>
            <ul class="text-zinc-300 text-xs space-y-1.5 max-h-40 overflow-y-auto">
              <li v-for="(w, i) in result.warnings" :key="i" class="flex items-start gap-2">
                <span class="text-amber-500 mt-0.5 shrink-0">&bull;</span>
                <span>{{ w }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-all duration-150 font-semibold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              @click="download"
            >
              {{ t('download') }}
            </button>
            <button
              class="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all duration-150 text-sm border border-zinc-700/50 hover:border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
              title="Copy XML to clipboard"
              @click="copyXml"
            >
              {{ copied ? t('copied') : t('copy') }}
            </button>
            <button
              class="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all duration-150 text-sm border border-zinc-700/50 hover:border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
              @click="reset"
            >
              {{ t('new') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- FAQ -->
    <details class="mt-6 card-glass rounded-xl overflow-hidden w-full">
      <summary class="px-6 py-4 cursor-pointer text-zinc-400 font-medium text-sm hover:text-zinc-300 transition-colors select-none">
        {{ t('faqTitle') }}
      </summary>
      <div class="px-6 pb-5 text-zinc-400 text-sm space-y-3 border-t border-zinc-700/30 pt-4">
        <p><strong class="text-zinc-200">{{ t('faqStep1Title') }}</strong> — {{ t('faqStep1') }}</p>
        <p><strong class="text-zinc-200">{{ t('faqStep2Title') }}</strong> — {{ t('faqStep2') }}</p>
        <p><strong class="text-zinc-200">{{ t('faqStep3Title') }}</strong> — {{ t('faqStep3') }}</p>
        <p class="text-zinc-600 text-xs pt-2">{{ t('faqNote') }}</p>
      </div>
    </details>

  </div>
</template>
