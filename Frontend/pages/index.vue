<template>
  <div>
    <nav>
    </nav>
  </div>
</template>

<script setup>
$fetch('http://localhost:3000/')
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error("err")
  })
</script>  