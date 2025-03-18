<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { shallowRef, watch, computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Date,
        default: () => new Date()
    },
    placeholder: {
        type: String,
        default: 'Select a date'
    },
    dateFormat: {
        type: String as () => 'full' | 'long' | 'medium' | 'short',
        default: 'medium'
    },
    locale: {
        type: String,
        default: 'fr-FR'
    }
})

const emit = defineEmits(['update:modelValue'])

// Convert Date to CalendarDate
const dateToCalendarDate = (date: Date): CalendarDate => {
    return new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    )
}

// Convert CalendarDate to Date
const calendarDateToDate = (calendarDate: CalendarDate): Date => {
    return new Date(
        calendarDate.year,
        calendarDate.month - 1,
        calendarDate.day
    )
}

// Initialize internal CalendarDate from the provided Date
const internalCalendarDate = shallowRef<CalendarDate>(dateToCalendarDate(props.modelValue))

const df = new DateFormatter(props.locale, {
    dateStyle: props.dateFormat
})

// Watch for external changes to the Date model
watch(() => props.modelValue, (newDate) => {
    // Prevent recursive updates by comparing date values
    const newCalendarDate = dateToCalendarDate(newDate)
    if (newCalendarDate.year !== internalCalendarDate.value.year ||
        newCalendarDate.month !== internalCalendarDate.value.month ||
        newCalendarDate.day !== internalCalendarDate.value.day) {
        internalCalendarDate.value = newCalendarDate
    }
}, { deep: true })

// When internal CalendarDate changes, emit the corresponding Date
const isInternalUpdate = shallowRef(false)
watch(internalCalendarDate, (newCalendarDate) => {
    if (isInternalUpdate.value) {
        isInternalUpdate.value = false
        return
    }

    const newDate = calendarDateToDate(newCalendarDate)
    const currentDate = props.modelValue

    // Only emit update if dates are actually different
    if (newDate.getFullYear() !== currentDate.getFullYear() ||
        newDate.getMonth() !== currentDate.getMonth() ||
        newDate.getDate() !== currentDate.getDate()) {
        isInternalUpdate.value = true
        emit('update:modelValue', newDate)
    }
}, { deep: true })

const formattedDate = computed(() => {
    return internalCalendarDate.value
        ? df.format(internalCalendarDate.value.toDate(getLocalTimeZone()))
        : props.placeholder
})
</script>

<template>
    <UPopover>
        <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
            {{ formattedDate }}
        </UButton>

        <template #content>
            <UCalendar v-model="internalCalendarDate" class="p-2" />
        </template>
    </UPopover>
</template>
