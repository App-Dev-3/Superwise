<template>
    <div>
        <p class="skeleton mb-2 ml-4 text-lg font-bold"/>
        <div class="card shadow-xl border border-base-300">
            <slot/>
            <!-- Action button at the bottom -->
            <div class="px-16 py-4 border-t border-base-300">
                <CustomButton
                    class="skeleton"
                    block
                    color="default"
                    variant="ghost"
                    text=" "
                />
            </div>
        </div>
    </div>
</template>