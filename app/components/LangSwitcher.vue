<script setup lang="ts">
import { useI18n, availableLocales } from '~/composables/useI18n'

const { locale, setLocale } = useI18n()
const open = ref(false)

const current = computed(() =>
  availableLocales.find(l => l.code === locale.value) ?? availableLocales[0]
)

function select(code: string) {
  setLocale(code)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('.lang-switcher')
  if (!el) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div class="lang-switcher relative">
    <button
      class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300 transition-all duration-150 text-sm"
      @click="open = !open"
    >
      <img :src="current.flag" :alt="current.label" class="w-5 h-auto rounded-sm" />
      <span class="font-medium">{{ current.code.toUpperCase() }}</span>
      <svg class="w-3.5 h-3.5 text-zinc-500 transition-transform" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="fade">
      <div
        v-if="open"
        class="absolute top-full mt-2 right-0 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/40 py-2 min-w-[170px] z-50 max-h-[320px] overflow-y-auto"
      >
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          class="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
          :class="loc.code === locale ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'"
          @click="select(loc.code)"
        >
          <img :src="loc.flag" :alt="loc.label" class="w-5 h-auto rounded-sm" />
          <span>{{ loc.label }}</span>
          <svg v-if="loc.code === locale" class="w-4 h-4 ml-auto text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>
