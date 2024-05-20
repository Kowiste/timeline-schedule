<template>
  <div>
    <div class="calendar-container">
      <div class="header">
        <div v-for="(hour, index) in hours" :key="index" class="header-hour">
          {{ hour }}
        </div>
      </div>
      <div ref="calendar" class="day-calendar" @dragover="dragOver">
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
          @dragstart="dragStart($event, box)"
          @dragend="dragEnd"
        >
          <div
            class="circle-left"
            @click="resizeStart(box, 'left')"
          ></div>
          <div
            class="circle-rigth"
            @click="resizeStart(box, 'right')"
          ></div>
          <slot :data="box"></slot>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
// imports
import { ref, onMounted, onUnmounted } from 'vue'
import { type IPosition, type Position } from '@/components/model'

// props
const model = defineModel({
  default: [],
  required: true,
  type: Array<Position>,
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

// data
const calendar = ref<HTMLElement | null>(null)
const currentDraggingBox = ref({} as IPosition)
const resizingBox = ref<{ box: IPosition; direction: 'left' | 'right' } | null>(null)
const dragOffset = ref(0)

const totalHours = Math.abs(props.to.getTime() - props.from.getTime()) / 36e5

// Generate the hours array based on the total duration
const hours = Array.from({ length: totalHours }, (_, i) => {
  const date = new Date(props.from.getTime() + i * 60 * 60 * 1000)
  return `${String(date.getHours()).padStart(2, '0')}:00`
})

// methods
function dragStart(event: DragEvent, box: IPosition) {
  const target = event.target as HTMLElement
  const boxRect = target.getBoundingClientRect()
  dragOffset.value = event.clientX - boxRect.left
  currentDraggingBox.value = box
}

function dragEnd() {
  currentDraggingBox.value = {} as IPosition
}

function resizeStart(box: IPosition, direction: 'left' | 'right') {
  resizingBox.value = { box, direction }
  document.addEventListener('mousemove', resizing)
  document.addEventListener('mouseup', resizeEnd)
}

function dragOver(event: DragEvent) {
  event.preventDefault()
  if (currentDraggingBox.value && calendar.value) {
    const parent = calendar.value
    const offsetX = event.clientX - parent.getBoundingClientRect().left - dragOffset.value
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

    // Update box position
    currentDraggingBox.value.position = nearestHourPosition
  }
}

function resizing(event: MouseEvent) {
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

function resizeEnd() {
  resizingBox.value = null
  document.removeEventListener('mousemove', resizing)
  document.removeEventListener('mouseup', resizeEnd)
}

// hooks
onMounted(() => {
  document.addEventListener('mouseup', resizeEnd)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', resizeEnd)
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
