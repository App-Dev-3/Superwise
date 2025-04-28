<template>
  <header>
    <SignedOut>
      <SignInButton />
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </header>
  <div>
    <h1>Hello</h1>
  </div>
  <NuxtLink to="/dashboard">Dashboard</NuxtLink>
</template>

<script setup></script>
