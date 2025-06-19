<script setup>
import {computed, onMounted, ref} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const props = defineProps({
  autoFocus: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
  leftIcon: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  note: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  rightIcon: {
    type: String,
    default: "",
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  }
});
const isClearIcon = computed(() => props.rightIcon === "xmark");

onMounted(() => {
  if (props.autoFocus) {
    if (inputFieldRef.value) {
      inputFieldRef.value.focus();
    }
  }
});

const inputFieldRef = ref(null);

const emit = defineEmits(["update:modelValue", "blur"]);

function handleInput(event) {
  emit("update:modelValue", event.target.value);
}

function handleBlur(event) {
  emit("blur", event);
}

// removed clearSearch helper; use direct input clear in handler

function handleRightIconClick() {
  if (!isClearIcon.value) return;
  const el = inputFieldRef.value;
  if (el) {
    el.value = '';
    el.focus();
    // dispatch native input event to trigger handleInput and update v-model
    el.dispatchEvent(new Event('input', {bubbles: true}));
  }
}
</script>

<template>
  <fieldset class="fieldset">
    <legend
        v-if="props.label.length > 0"
        class="fieldset-legend text-sm font-semibold mb-1 opacity-50 my-0 py-1"
    >
      {{ label + (required ? '*' : '') }}
    </legend>

    <div class="input-container">
      <FontAwesomeIcon
          v-if="leftIcon"
          :icon="leftIcon"
          class="input-container__leftIcon"
      />
      <input
          ref="inputFieldRef"
          :class="{
          'input-container__input--left': leftIcon,
          'input-container__input--right': rightIcon,
        }"
          :placeholder="placeholder"
          :value="modelValue"
          class="input input-bordered w-full rounded-full"
          type="text"
          @blur="handleBlur"
          @input="handleInput"
      >
      <FontAwesomeIcon
          v-if="rightIcon"
          :class="{ 'input-container__rightIcon--clickable': isClearIcon }"
          :icon="rightIcon"
          class="input-container__rightIcon cursor-pointer"
          @click="handleRightIconClick"
      />
    </div>

    <p v-if="note" class="text-xs opacity-50">
      {{ note }}
    </p>
  </fieldset>
</template>

<style lang="scss" scoped>
.input-container {
  position: relative;

  &__leftIcon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 10;
    color: #888;
  }

  &__input--left {
    padding-left: 2.5rem;
  }

  &__input--right {
    padding-right: 2.5rem;
  }

  &__rightIcon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 10;
    color: #888;

    &--clickable {
      pointer-events: auto;
    }
  }
}
</style>
