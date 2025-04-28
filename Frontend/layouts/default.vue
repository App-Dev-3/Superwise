<template>
<<<<<<< HEAD
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
=======
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
>>>>>>> bc702a0 (added auth and onboarding middleware)
</template>
