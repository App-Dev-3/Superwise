<template>
  <div>
    <SignedOut>
      <div>
        <SignInButton />
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

<template>
  <div>
    <SignedOut>
      <div>
        <SignInButton />
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
