<template>
  <SignedOut>
    <div>
      <slot />
    </div>
  </SignedOut>

  <SignedIn>
    <div>
      <UserButton />
      <slot />
    </div>
  </SignedIn>
</template>
