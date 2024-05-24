<template>
  <div>
    <h1>HEY</h1>
    <select v-model="stepSelected">
      <option
        v-for="option in timeOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
    {{ stepSelected }}
    <div class="row">
      <TimeScheduler
        v-model="events"
        :from="new Date('2024-05-24T06:00:00')"
        :to="new Date('2024-05-24T16:00:00')"
        :step="stepSelected"
      >
        <template #default="{ data }">
          <div>{{ data.id }}</div>
        </template>
      </TimeScheduler>
    </div>
    <div class="row" v-for="event in events">{{ event }}</div>
  </div>
</template>
<script setup lang="ts">
import TimeScheduler from '@/components/TimeScheduler.vue'
import { ref } from 'vue'
import type { IPosition } from './components/model'
const events = ref([
  {
    id: 1,
    color: '#11c107',
    from: new Date('2024-05-24T06:30:00'),
    to: new Date('2024-05-24T08:00:00'),
  },
  {
    id: 2,
    color: '#ffc107',
    from: new Date('2024-05-24T12:00:00'),
    to: new Date('2024-05-24T14:00:00'),
  },
] as IPosition[])
let stepSelected = ref(0)
const timeOptions = [
  { value: 5, text: '5 min' },
  { value: 15, text: '15 min' },
  { value: 30, text: '30 min' },
  { value: 60, text: '1 hour' },
]
</script>
<style scoped>
.row {
  width: 100%;
}
</style>
