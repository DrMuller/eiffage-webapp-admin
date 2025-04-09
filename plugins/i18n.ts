import { createI18n } from 'vue-i18n'

const numberFormats = {
    'fr-FR': {
        currency: {
            style: 'currency' as const,
            currency: 'EUR',
            notation: 'standard' as const
        },
        decimal: {
            style: 'decimal' as const,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        percent: {
            style: 'percent' as const,
            useGrouping: false
        },
        bigNumber: {
            style: 'decimal' as const,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
        }
    },
    'en-US': {
        currency: {
            style: 'currency' as const,
            currency: 'USD',
            notation: 'standard' as const
        },
        decimal: {
            style: 'decimal' as const,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        percent: {
            style: 'percent' as const,
            useGrouping: false
        },
        bigNumber: {
            style: 'decimal' as const,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
        }
    },
}

const dateFormats = {
    'fr-FR': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        },
        medium: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        },
    },
    'en-US': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        },
        medium: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        },
    }
}
export default defineNuxtPlugin(({ vueApp }) => {
    const i18n = createI18n({
        numberFormats,
        dateFormats,
        legacy: false,
        globalInjection: true,
        locale: 'fr-FR',
        messages: {
            en: {
                hello: 'Hello, {name}!'
            }
        }
    })

    vueApp.use(i18n)
})