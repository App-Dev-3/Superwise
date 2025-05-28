<script setup lang="ts"></script>

<template>
  <div>
    <h1>Hello</h1>

    <h2>Action Card</h2>
    <ActionCard
      button-text="Button Text"
      card-type="primary"
      header-text="Header Text"
    />
    <!-- <h2>ThemeToggle:</h2>
  <ThemeToggle></ThemeToggle> -->
    <h2>AppHeader:</h2>
    <AppHeader first-name="Testus" last-name="Tester" image="''" />
    <h2>Avatar:</h2>
    <Avatar first-name="Testus" last-name="Tester" />
    <!-- <h2>BottomNav:</h2>
  <BottomNav
    :bottom-nav-buttons="[
      { label: 'Dashboard', icon: 'house', route: '/student/dashboard' },
      { label: 'Matching', icon: 'user-group', route: '/student/matching' },
      { label: 'Chat', icon: 'message', route: '/student/chat' },
    ]"
    :always-show-labels="true"
  /> -->
    <h2>CardStack:</h2>
    <CardStack />
    <!-- <h2>ConfirmationExport:</h2>
  <ConfirmationExport></ConfirmationExport> -->
    <!-- <h2>ConfirmationModal:</h2>
  <ConfirmationModal></ConfirmationModal> -->
    <h2>CustomButton</h2>
    <CustomButton text="Text" color="default" variant="outline" />
    <h2>CustomSelect:</h2>
    <CustomSelect /> <CustomTag />
    <h2>CustomToggle:</h2>
    <CustomToggle /> <inputField />
    <h2>MiniCard:</h2>
    <MiniCard
      preview-text="previewText"
      first-name="Testus"
      last-name="Tester"
      image="''"
    />
    <h2>MultiStepForm:</h2>
    <MultiStepForm :total-steps="5" />
    <h2>ProfileDescription:</h2>
    <ProfileDescription headline="Headline" content="Content" />
    <h2>SearchBar:</h2>
    <SearchBar />
    <h2>SideDrawer:</h2>
    <SideDrawer
      preview-text="previewText"
      first-name="Testus"
      last-name="Tester"
      image="''"
    />
    <!-- <h2>StatusBar:</h2>
  <StatusBar :step="1" class="mt-4" /> -->
    <h2>SupervisorCard:</h2>
    <SupervisorCard
      first-name="Testus"
      last-name="Tester"
      image="''"
      :similarity-score="15"
      :max-capacity="5"
      :current-capacity="3"
    />
    <!-- <h2>StudentCard:</h2>
  <StudentCard></StudentCard> -->
    <!-- <h2>StudentSupervisorList:</h2>
  <StudentSupervisorList></StudentSupervisorList> -->
    <!-- <h2>ValidatedMailInput:</h2>
  <ValidatedMailInput></ValidatedMailInput> -->
    <!-- <h2>SwipeContainer:</h2>
  <SwipeContainer></SwipeContainer> -->
    <h2>TagPriority:</h2>
    <TagPriority />
    <h2>TagSelector:</h2>
    <TagSelector />
    <h2>Toast:</h2>
    <Toast />
    <h2>UnsafeFileInput:</h2>
    <UnsafeFileInput />
  </div>
</template>
