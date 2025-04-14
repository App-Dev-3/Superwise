<script setup>
const counter = useCounterStore()
</script>


<template>
  <div>
    <div>
      <button>en</button>
      <button>fr</button>
      <p> $t("welcome") </p>
      <p> count: {{ counter.count }}</p>
    </div>
  </div>
</template>