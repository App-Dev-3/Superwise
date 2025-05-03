<template>
  <div>
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
  </div>
</template>
