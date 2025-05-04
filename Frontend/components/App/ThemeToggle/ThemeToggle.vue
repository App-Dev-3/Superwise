<script setup>
  const colorMode = useColorMode();

  const isDark = computed({
    get() {
      return colorMode.value === "dark";
    },
    set(value) {
      colorMode.preference = value ? "dark" : "light";
    },

  });
</script>

<template>

  <label class="swap swap-rotate">
    <input v-model="isDark" type="checkbox">

    <font-awesome-icon
      icon="sun"
      class="swap-on fa-lg"
    />

    <font-awesome-icon
      icon="moon"
      class="swap-off fa-lg"
    />
  </label>

</template>