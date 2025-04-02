<template>
    <div class="p-6 space-y-4">
        <h2 class="text-2xl font-bold mb-4">Custom Brand Colors Usage Examples</h2>

        <!-- Primary Color (Brand Red) Examples -->
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Primary Color (Brand Red - Default)</h3>
            <p class="text-sm text-gray-600">These components use the primary color without specifying a color prop:</p>

            <!-- Default primary buttons -->
            <div class="flex gap-2 flex-wrap">
                <UButton variant="solid">Primary Button</UButton>
                <UButton variant="outline">Outline Button</UButton>
                <UButton variant="soft">Soft Button</UButton>
                <UButton variant="ghost">Ghost Button</UButton>
            </div>

            <!-- Default primary elements -->
            <div class="flex gap-2">
                <UBadge>Primary Badge</UBadge>
                <UInput placeholder="Primary focus input" />
            </div>
        </div>

        <!-- Brand Red Examples -->
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Brand Red (#EB0000)</h3>

            <!-- Buttons -->
            <div class="flex gap-2 flex-wrap">
                <UButton color="brandRed" variant="solid">Solid Button</UButton>
                <UButton color="brandRed" variant="outline">Outline Button</UButton>
                <UButton color="brandRed" variant="soft">Soft Button</UButton>
                <UButton color="brandRed" variant="ghost">Ghost Button</UButton>
            </div>

            <!-- Badge -->
            <div class="flex gap-2">
                <UBadge color="brandRed" variant="solid">Solid Badge</UBadge>
                <UBadge color="brandRed" variant="outline">Outline Badge</UBadge>
                <UBadge color="brandRed" variant="soft">Soft Badge</UBadge>
            </div>

            <!-- Alert -->
            <UAlert color="brandRed" title="Brand Red Alert"
                description="This is an alert using the brand red color." />

            <!-- Input -->
            <UInput color="brandRed" placeholder="Input with brand red focus" />
        </div>

        <!-- Brand Dark Examples -->
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Brand Dark (#232323)</h3>

            <!-- Buttons -->
            <div class="flex gap-2 flex-wrap">
                <UButton color="brandDark" variant="solid">Solid Button</UButton>
                <UButton color="brandDark" variant="outline">Outline Button</UButton>
                <UButton color="brandDark" variant="soft">Soft Button</UButton>
                <UButton color="brandDark" variant="ghost">Ghost Button</UButton>
            </div>

            <!-- Badge -->
            <div class="flex gap-2">
                <UBadge color="brandDark" variant="solid">Solid Badge</UBadge>
                <UBadge color="brandDark" variant="outline">Outline Badge</UBadge>
                <UBadge color="brandDark" variant="soft">Soft Badge</UBadge>
            </div>

            <!-- Alert -->
            <UAlert color="brandDark" title="Brand Dark Alert"
                description="This is an alert using the brand dark color." />

            <!-- Input -->
            <UInput color="brandDark" placeholder="Input with brand dark focus" />
        </div>

        <!-- CSS Custom Properties Examples -->
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Using CSS Custom Properties</h3>

            <div class="flex gap-4">
                <div class="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold"
                    style="background-color: var(--ui-color-brand-red-500)">
                    Red
                </div>
                <div class="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold"
                    style="background-color: var(--ui-color-brand-dark-500)">
                    Dark
                </div>
            </div>
        </div>

        <!-- Tailwind Classes Examples -->
        <div class="space-y-2">
            <h3 class="text-lg font-semibold">Using as Tailwind Classes</h3>

            <div class="flex gap-4">
                <div class="bg-brand-red-500 text-white p-4 rounded-lg">
                    bg-brand-red-500
                </div>
                <div class="bg-brand-dark-500 text-white p-4 rounded-lg">
                    bg-brand-dark-500
                </div>
            </div>

            <div class="flex gap-4">
                <div class="text-brand-red-500 font-bold">
                    text-brand-red-500
                </div>
                <div class="text-brand-dark-500 font-bold">
                    text-brand-dark-500
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// No script needed for this example component
</script>
