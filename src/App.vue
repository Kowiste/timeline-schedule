<template>
  <div>
    <div class="control">
      <div>Select an interval</div>
      <select v-model="stepSelected">
        <option
          v-for="option in timeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.text }}
        </option>
      </select>
      <label>Resize</label>
      <input type="checkbox" v-model="allowResize" />
      <label>Move</label>
      <input type="checkbox" v-model="allowMove" />
    </div>

    <hr style="margin-bottom: 2rem" />
    <div class="row">
      <TimeScheduler
        v-model="events"
        :from="new Date('2024-05-24T06:00:00')"
        :to="new Date('2024-05-24T16:00:00')"
        :step="stepSelected"
        :resize="allowResize"
        :move="allowMove"
      >
        <template #header="{ date }">
          {{ date.hour }}
        </template>
        <template #default="{ data }">
          <div>{{ data.id }}</div>
        </template>
      </TimeScheduler>
    </div>
    <div v-for="event in events" style="margin-top: 1rem">
      id:{{ event.id }} color:{{ event.color }} from:{{
        event.from.toLocaleString()
      }}
      to:{{ event.to.toLocaleString() }}
    </div>
  </div>
</template>
<script setup lang="ts">
import TimeScheduler from '@/components/TimeScheduler.vue'
import { ref } from 'vue'
import type { IPosition, Position } from './components/model'
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
] as Position[])
let stepSelected = ref(5)
let allowResize = ref(true)
let allowMove = ref(true)
const timeOptions = [
  { value: 5, text: '5 min' },
  { value: 15, text: '15 min' },
  { value: 30, text: '30 min' },
  { value: 60, text: '1 hour' },
]
</script>
<style scoped>
.control {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.row {
  resize: vertical;
  overflow: hidden; /* something other than visible */
}
</style>
