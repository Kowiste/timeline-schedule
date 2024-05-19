<template>
  <div>
    <div class="calendar-container">
      <div class="header">
        <div v-for="(hour, index) in hours" :key="index" class="header-hour">
          {{ hour }}
        </div>
      </div>
      <div ref="calendar" class="day-calendar" @dragover="handleDragOver">
        <div
          v-for="(hour, index) in hours"
          :key="index"
          class="hour-line"
          :style="{ left: `${index * (100 / hours.length)}%` }"
        ></div>
        <div
          v-for="box in model"
          :key="box.id"
          class="event"
          :style="{
            backgroundColor: box.color,
            left: `${box.position}px`,
            width: `${box.duration}px`,
          }"
          draggable="true"
          @dragstart="handleDragStart(box)"
          @dragend="handleDragEnd"
        >
          <div
            class="circle-left"
            @click="handleResizeStart(box, 'left')"
          ></div>
          <div
            class="circle-rigth"
            @click="handleResizeStart(box, 'right')"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//imports
import { ref, onMounted, onUnmounted } from 'vue'
import { type IPosition } from '@/components/model'

//props
const model = defineModel({
  default: [],
  required: true,
  type: Array<IPosition>,
})
const props = defineProps({
  step: {
    type: Number,
    default: 15,
  },
  from: {
    type: Date,
    default: new Date('1990-10-19T00:00:00'),
  },
  to: {
    type: Date,
    default: new Date('1990-10-20T00:00:00'),
  },
})

//data
const calendar = ref<HTMLElement | null>(null)
const currentDraggingBox = ref({} as IPosition)
const resizingBox = ref<{ box: IPosition; direction: 'left' | 'right' } | null>(
  null
)

const totalHours = Math.abs(props.to.getTime() - props.from.getTime()) / 36e5

// Generate the hours array based on the total duration
const hours = Array.from({ length: totalHours }, (_, i) => {
  const date = new Date(props.from.getTime() + i * 60 * 60 * 1000)
  return `${String(date.getHours()).padStart(2, '0')}:00`
})

//methods
function handleDragStart(box: IPosition) {
  currentDraggingBox.value = box
}

function handleDragEnd() {
  currentDraggingBox.value = {} as IPosition
}

function handleResizeStart(box: IPosition, direction: 'left' | 'right') {
  resizingBox.value = { box, direction }
  document.addEventListener('mousemove', handleResizing)
  document.addEventListener('mouseup', handleResizeEnd)
}

function handleDragOver(event: any) {
  event.preventDefault()
  if (currentDraggingBox.value && calendar.value) {
    const parent = calendar.value
    const offsetX = event.clientX - parent.getBoundingClientRect().left
    const stepWidth = parent.offsetWidth / ((24 * 60) / props.step)
    const roundedOffsetX = Math.round(offsetX / stepWidth) * stepWidth

    const totalWidth = parent.offsetWidth
    const blockPosition =
      totalWidth - (roundedOffsetX + currentDraggingBox.value.duration) >= 0
        ? roundedOffsetX
        : totalWidth - currentDraggingBox.value.duration

    // Find the nearest hour
    const nearestHourIndex = Math.floor(blockPosition / stepWidth)
    const nearestHourPosition = nearestHourIndex * stepWidth

    // Update box position and duration
    currentDraggingBox.value.position = nearestHourPosition
  }
}

function handleResizing(event: MouseEvent) {
  if (resizingBox.value && calendar.value) {
    const parent = calendar.value
    const { box, direction } = resizingBox.value
    const offsetX = event.clientX - parent.getBoundingClientRect().left
    const stepWidth = (parent.offsetWidth / (24 * 60)) * props.step
    const roundedOffsetX = Math.round(offsetX / stepWidth) * stepWidth

    // Find the nearest hour
    const nearestHourIndex = Math.floor(roundedOffsetX / stepWidth)
    const nearestHourPosition = nearestHourIndex * stepWidth

    if (direction === 'left') {
      const newWidth = box.position + box.duration - nearestHourPosition
      if (newWidth > 0) {
        box.duration = newWidth
        box.position = nearestHourPosition
      }
      return
    }
    if (direction === 'right') {
      const newWidth = nearestHourPosition - box.position
      if (newWidth > 0) {
        box.duration = newWidth
      }
    }
  }
}

function handleResizeEnd() {
  resizingBox.value = null
  document.removeEventListener('mousemove', handleResizing)
  document.removeEventListener('mouseup', handleResizeEnd)
}

//hooks
onMounted(() => {
  document.addEventListener('mouseup', handleResizeEnd)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleResizeEnd)
})
</script>

<style scoped>
.calendar-container {
  width: 600px;
  height: 150px;
}

.header {
  display: flex;
  width: 100%;
  height: 2rem;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-top-left-radius: 0.2rem;
  border-top-right-radius: 0.2rem;
}

.header-hour {
  flex: 1;
  text-align: left;
  align-self: center;
  font-size: 0.75rem;
  color: #666;
  padding-inline-start: 0.2rem;
}

.day-calendar {
  position: relative;
  width: 100%;
  height: 100px;
  border: 1px solid #ccc;
  overflow-x: hidden;
  box-sizing: border-box;
  border-bottom-left-radius: 0.2rem;
  border-bottom-right-radius: 0.2rem;
  padding: 0.1rem;
}

.hour-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #ddd;
}

.event {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  min-height: 90%;
  max-height: 100%;
  cursor: move;
  border-radius: 0.2rem;
  border: 1px solid black;
}

.circle-left,
.circle-rigth {
  position: absolute;
  height: 0.6rem;
  width: 0.6rem;
  top: 50%;
  transform: translate(0, -50%);
  background-color: white;
  border: 1px solid black;
  border-radius: 50%;
  cursor: col-resize;
}

.circle-left {
  left: -0.3rem;
}

.circle-rigth {
  right: -0.3rem;
}
</style>
