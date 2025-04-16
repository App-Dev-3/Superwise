<template>
    <div>
      <h1 class="text-3xl text-red-500 font-bold underline">
        Hello world!
      </h1>
        <h1> {{ $t("hello") }}</h1>
    <nav>
      <NuxtLink to="/Temp">i8ln test</NuxtLink>
    </nav>
    <h2>Tailwind and daisyUI Test</h2>
    <div class="bg-base-200">
      <div class="bg-base-100 border-base-300 text-base-content">
        This is dark text on a light background,
        which switches to light text on a dark background in dark mode.
      </div>
    </div>
    <button class="btn btn-primary" @click="increment">Button</button>
    <input type="checkbox" class="checkbox checkbox-secondary" />
    </div>
</template>

<script setup>
const counter = useCounterStore()

function increment() {
  counter.increment()
}

$fetch('http://localhost:3000/')
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error("err")
  })
</script>  