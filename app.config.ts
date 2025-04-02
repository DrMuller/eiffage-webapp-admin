export default defineAppConfig({
    colorMode: {
        preference: 'light'
    },
    toaster: {
        position: 'top-center' as const,
        expand: true,
        duration: 2000
    },
    ui: {
        inputNumber: {
            slots: {
                root: '*:pe-2.5',
                increment: 'hidden',
                decrement: 'hidden'
            },
        },
        tooltip: {
            slots: {
                content: 'flex items-center gap-1 bg-black text-white shadow-sm rounded-md px-4 py-3 text-sm select-none data-[state=delayed-open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] pointer-events-auto max-w-96 h-full',
                arrow: 'fill-black',
                text: 'h-full whitespace-normal overflow-hidden break-words',
            }
        },
        table: {
            slots: {
                root: 'relative overflow-auto',
                base: 'min-w-full overflow-clip',
                caption: 'sr-only',
                thead: 'relative [&>tr]:after:absolute [&>tr]:after:inset-x-0 [&>tr]:after:bottom-0 [&>tr]:after:h-px [&>tr]:after:bg-(--ui-border-accented)',
                tbody: 'divide-y divide-(--ui-border) [&>tr]:data-[selectable=true]:hover:bg-(--ui-bg-elevated)/50 [&>tr]:data-[selectable=true]:focus-visible:outline-(--ui-primary)',
                tr: 'data-[selected=true]:bg-(--ui-bg-elevated)/50',
                th: 'px-4 py-4 text-xs text-(--ui-text-highlighted) text-left rtl:text-right font-semibold [&:has([role=checkbox])]:pe-0 first:pl-4 last:pr-4',
                td: 'px-2 py-2 text-sm text-(--ui-text-muted) whitespace-nowrap [&:has([role=checkbox])]:pe-0 first:pl-4 last:pr-4',
                empty: 'py-6 text-center text-sm text-(--ui-text-muted)',
                loading: 'py-6 text-center'
            },
            variants: {
                pinned: {
                    true: {
                        th: 'sticky bg-(--ui-bg)/75 data-[pinned=left]:left-0 data-[pinned=right]:right-0',
                        td: 'sticky bg-(--ui-bg)/75 data-[pinned=left]:left-0 data-[pinned=right]:right-0'
                    }
                },
                sticky: {
                    true: {
                        thead: 'sticky top-0 inset-x-0 bg-(--ui-bg)/75 z-[1] backdrop-blur'
                    }
                },
                loading: {
                    true: {
                        thead: 'after:absolute after:bottom-0 after:inset-x-0 after:h-px'
                    }
                },
                loadingAnimation: {
                    carousel: '',
                    'carousel-inverse': '',
                    swing: '',
                    elastic: ''
                },
                loadingColor: {
                    primary: '',
                    secondary: '',
                    success: '',
                    info: '',
                    warning: '',
                    error: '',
                    neutral: '',
                    danger: ''
                }
            },
            compoundVariants: [
                {
                    loading: true,
                    loadingColor: 'primary',
                    class: {
                        thead: 'after:bg-(--ui-primary)'
                    }
                },
                {
                    loading: true,
                    loadingColor: 'neutral',
                    class: {
                        thead: 'after:bg-(--ui-bg-inverted)'
                    }
                },
                {
                    loading: true,
                    loadingAnimation: 'carousel',
                    class: {
                        thead: 'after:animate-[carousel_2s_ease-in-out_infinite] rtl:after:animate-[carousel-rtl_2s_ease-in-out_infinite]'
                    }
                },
                {
                    loading: true,
                    loadingAnimation: 'carousel-inverse',
                    class: {
                        thead: 'after:animate-[carousel-inverse_2s_ease-in-out_infinite] rtl:after:animate-[carousel-inverse-rtl_2s_ease-in-out_infinite]'
                    }
                },
                {
                    loading: true,
                    loadingAnimation: 'swing',
                    class: {
                        thead: 'after:animate-[swing_2s_ease-in-out_infinite]'
                    }
                },
                {
                    loading: true,
                    loadingAnimation: 'elastic',
                    class: {
                        thead: 'after:animate-[elastic_2s_ease-in-out_infinite]'
                    }
                }
            ],
            defaultVariants: {
                loadingColor: 'primary',
                loadingAnimation: 'carousel'
            }
        },
        card: {
            slots: {
                root: 'rounded-[calc(var(--ui-radius)*2)]',
                header: 'p-4 sm:px-6 bg-gray-50 rounded-t-[calc(var(--ui-radius)*2)]',
                body: 'sm:p-0 p-0 [&>div.body]:p-4',
                footer: 'p-4 sm:px-6 bg-gray-50 rounded-b-[calc(var(--ui-radius)*2)]'
            }
        }
    }
})
