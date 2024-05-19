<template>
  <div>
    <h1>HEY</h1>
    <div class="row">
      <TimeScheduler
        v-model="events"
        :from="new Date('1990-10-19T06:00:00')"
        :to="new Date('1990-10-19T13:00:00')"
        :step="15"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import TimeScheduler from '@/components/TimeScheduler.vue'
import { ref } from 'vue'
import type { IPosition } from './components/model'
const events = ref([
  { id: 1, color: '#ffc107', position: 50, duration: 200 },
  { id: 2, color: '#ffc107', position: 300, duration: 50 },
] as IPosition[])
</script>
<style scoped>
.row {
  width: 100%;
}
</style>
