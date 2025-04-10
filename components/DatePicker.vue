<script setup lang="ts">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { shallowRef, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    modelValue: {
        type: Date,
        required: false,
        default: undefined
    },
    placeholder: {
        type: String,
        default: 'Select a date'
    },
    dateFormat: {
        type: String as () => 'full' | 'long' | 'medium' | 'short',
        default: 'medium'
    },
    required: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        default: ''
    }
})

const { locale } = useI18n()
const emit = defineEmits(['update:modelValue'])

// Convert Date to CalendarDate
const dateToCalendarDate = (date: Date | undefined): CalendarDate | undefined => {
    return date ? new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ) : undefined
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
const internalCalendarDate = shallowRef<CalendarDate | undefined>(props.modelValue ? dateToCalendarDate(props.modelValue) : undefined)

// Watch for external changes to the Date model
watch(() => props.modelValue, (newDate) => {
    if (newDate === undefined) {
        internalCalendarDate.value = undefined
        return
    }

    // Prevent recursive updates by comparing date values
    const newCalendarDate = dateToCalendarDate(newDate)
    if (newCalendarDate?.year !== internalCalendarDate?.value?.year ||
        newCalendarDate?.month !== internalCalendarDate?.value?.month ||
        newCalendarDate?.day !== internalCalendarDate?.value?.day) {
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

    const newDate = newCalendarDate ? calendarDateToDate(newCalendarDate) : undefined

    if (newDate === undefined && props.modelValue === undefined) {
        return
    }

    if (newDate === undefined) {
        isInternalUpdate.value = true
        emit('update:modelValue', undefined)
        return
    }

    const currentDate = props.modelValue

    // Only emit update if dates are actually different
    if (!currentDate || (newDate.getFullYear() !== currentDate.getFullYear() ||
        newDate.getMonth() !== currentDate.getMonth() ||
        newDate.getDate() !== currentDate.getDate())) {
        isInternalUpdate.value = true
        emit('update:modelValue', newDate)
    }
}, { deep: true })

const formattedDate = computed(() => {
    if (!internalCalendarDate.value) {
        return props.placeholder
    }

    const date = internalCalendarDate.value.toDate(getLocalTimeZone())
    const formatter = new Intl.DateTimeFormat(locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
    return formatter.format(date)
})
</script>

<template>
    <div class="relative">
        <UPopover>
            <UButton class="bg-white border border-gray-300 text-gray-600 min-w-40" variant="ghost"
                icon="i-lucide-calendar">
                {{ formattedDate }}
            </UButton>

            <template #content>
                <UCalendar v-model="internalCalendarDate" :locale="locale" class="p-2" :required="required" />
            </template>
        </UPopover>
        <UInputNumber type="text" :name="name" required :value="internalCalendarDate ? 'valid' : ''"
            class="absolute opacity-0 top-4 left-16 h-0 w-0 pointer-events-none" tabindex="-1" aria-hidden="true" />
    </div>
</template>
