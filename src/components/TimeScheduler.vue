<template>
  <div class="calendar-container">
    <div class="header">
      <div v-for="(date, index) in filteredHours" :key="index" class="header-hour">
        <slot name="header" :date="date"></slot>
      </div>
    </div>
    <div ref="calendar" class="day-calendar" @dragover="dragOver">
      <div
        v-for="(hour, index) in filteredHours"
        :key="index"
        class="hour-line"
        :style="{ left: `${index * (100 / filteredHours.length)}%` }"
      ></div>
      <div
        v-for="box in model"
        :key="box.id"
        class="event"
        :style="{
          backgroundColor: box.color,
          left: `${calculatePosition(box.from)}px`,
          width: `${calculateDuration(box.from, box.to)}px`,
        }"
        draggable="true"
        @dragstart="dragStart($event, box)"
        @dragend="dragEnd"
      >
        <div
          v-if="resize"
          class="circle-left"
          @click="resizeStart(box, EDirection.Left)"
        ></div>
        <div
          v-if="resize"
          class="circle-right"
          @click="resizeStart(box, EDirection.Right)"
        ></div>
        <slot :event="box"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EDirection, type IPosition, type Position, type IDate } from './model'
import { millInHour, millInMin, minInHour } from './const'

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
  resize: {
    type: Boolean,
    default: true,
  },
  move: {
    type: Boolean,
    default: true,
  },
  change: {
    type: Function,
    default: function () {},
  },
  stepHour: {
    type: Number,
    default: 1,
  },
})

const calendar = ref<HTMLElement | null>(null)
const currentDraggingBox = ref({} as IPosition)
const resizingBox = ref<{ box: IPosition; direction: EDirection } | null>(null)
const dragOffset = ref(0)
const stepWidth = ref(0)
const stepPerHour = ref(0)
const minToPixel = ref(0)

const totalHours = ref(
  Math.abs(props.to.getTime() - props.from.getTime()) / millInHour
)

const hours = Array.from({ length: totalHours.value }, (_, i) => {
  const date = new Date(props.from.getTime() + i * millInHour)
  return {
    hour: `${String(date.getHours()).padStart(2, '0')}:00`,
    value: date,
  } as IDate
})
const filteredHours = hours.filter((_, index) => index % props.stepHour === 0)
function calculatePosition(fromEvent: Date) {
  if (!calendar.value) return 0
  const fromMinutes = (fromEvent.getTime() - props.from.getTime()) / millInMin
  return fromMinutes * minToPixel.value
}

function calculateDuration(from: Date, to: Date): number {
  if (!calendar.value) return 0
  const durationMinutes = (to.getTime() - from.getTime()) / millInMin
  return durationMinutes * minToPixel.value
}

function dragStart(event: DragEvent, box: IPosition) {
  if (!props.move) return
  const target = event.target as HTMLElement
  const boxRect = target.getBoundingClientRect()
  dragOffset.value = event.clientX - boxRect.left
  currentDraggingBox.value = box

  //remove drag image
  const empty = new Image()
  empty.src = ''
  event.dataTransfer?.setDragImage(empty, 0, 0)
}

function dragEnd() {
  if (currentDraggingBox.value) props.change()
  currentDraggingBox.value = {} as IPosition
}

function resizeStart(box: IPosition, direction: EDirection) {
  resizingBox.value = { box, direction }
  document.addEventListener('mousemove', resizing)
  document.addEventListener('mouseup', resizeEnd)
}

function dragOver(event: DragEvent) {
  event.preventDefault()
  if (!props.move) return
  if (currentDraggingBox.value && calendar.value) {
    const setX =
      event.clientX -
      calendar.value.getBoundingClientRect().left -
      dragOffset.value

    const roundedsetX = Math.round(setX / stepWidth.value) * stepWidth.value

    const newFrom = new Date(
      props.from.getTime() +
        (roundedsetX / stepWidth.value) * props.step * millInMin
    )
    const duration =
      currentDraggingBox.value.to.getTime() -
      currentDraggingBox.value.from.getTime()
    const newTo = new Date(newFrom.getTime() + duration)

    currentDraggingBox.value.from = newFrom
    currentDraggingBox.value.to = newTo
  }
}

function resizing(event: MouseEvent) {
  if (resizingBox.value && calendar.value) {
    const parent = calendar.value
    const { box, direction } = resizingBox.value
    const setX = event.clientX - parent.getBoundingClientRect().left
    const roundedsetX = Math.round(setX / stepWidth.value) * stepWidth.value
    const roundMin = (roundedsetX / stepWidth.value) * props.step * millInMin
    if (direction === EDirection.Left) {
      const newFrom = new Date(props.from.getTime() + roundMin)

      if (newFrom < box.to) {
        box.from = newFrom
      }
      return
    }
    if (direction === EDirection.Right) {
      const newTo = new Date(props.from.getTime() + roundMin)
      if (newTo > box.from) {
        box.to = newTo
      }
    }
  }
}

function resizeEnd() {
  if (resizingBox.value) props.change()
  resizingBox.value = null
  document.removeEventListener('mousemove', resizing)
  document.removeEventListener('mouseup', resizeEnd)
}
function updateDimensions() {
  if (!calendar.value) return
  stepPerHour.value = minInHour / props.step
  totalHours.value =
    Math.abs(props.to.getTime() - props.from.getTime()) / millInHour
  stepWidth.value =
    (calendar.value.offsetWidth * props.step) / (totalHours.value * minInHour)
  minToPixel.value = calendar.value.offsetWidth / (minInHour * totalHours.value)
}
onMounted(() => {
  document.addEventListener('mouseup', resizeEnd)
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', resizeEnd)
  window.removeEventListener('resize', updateDimensions)
})

watch(
  () => [props.step, props.from, props.to, calendar.value],
  () => {
    if (!calendar.value) return
    stepPerHour.value = minInHour / props.step
    totalHours.value =
      Math.abs(props.to.getTime() - props.from.getTime()) / millInHour
    stepWidth.value =
      (calendar.value.offsetWidth * props.step) / (totalHours.value * minInHour)
    minToPixel.value =
      calendar.value.offsetWidth / (minInHour * totalHours.value)
  }
)
</script>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
}

.header {
  display: flex;
  width: 100%;
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
  height: 100%;
  border: 1px solid #ccc;
  overflow: hidden;
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
  height: 100%;
  cursor: move;
  border-radius: 0.2rem;
  border: 1px solid black;
  box-sizing: border-box;
}

.circle-left,
.circle-right {
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

.circle-right {
  right: -0.3rem;
}
</style>
