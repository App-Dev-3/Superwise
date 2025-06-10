<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

interface SupervisorStatisticsProps {
  currentlySupervising: number;
  slots: number;
  pending: number;
  compatibility: number;
  firstName: string;
  lastName: string;
}

const props = defineProps<SupervisorStatisticsProps>();

</script>

<template>
  <div class="w-full flex justify-center flex-col p-4 gap-3">
    <div class="flex flex-row gap-2 items-center">
      <FontAwesomeIcon
          class="opacity-75"
          icon="user"
      />
      <p class="text-small opacity-75">
        <i18n-t
            keypath="profile.availableSlots"
            tag="label"
        >
          <span class="text-primary text-body">
              {{ props.currentlySupervising }}
          </span>
          <span class="text-primary text-body">
              {{ props.slots }}
          </span>
        </i18n-t>
      </p>
    </div>

    <div class="flex flex-row gap-2 items-center">
      <FontAwesomeIcon
          class="opacity-75"
          icon="hourglass"
      />
      <p class="text-small opacity-75">
        <i18n-t
            keypath="profile.pendingRequests"
            tag="label"
        >
            <span class="text-primary text-body">
              {{ props.pending }}
            </span>
        </i18n-t>
      </p>
    </div>

    <!--        This will maybe get added in the future, but we need another endpoint for that from the backend-->
    <!--        <p class="text-small opacity-50">-->
    <!--            You and-->
    <!--            <span class="font-bold">-->
    <!--            {{ props.firstName }} {{ props.lastName }}-->
    <!--          </span>-->
    <!--            have a-->
    <!--            <span class="font-bold">-->
    <!--            {{ compatibility }}%-->
    <!--          </span>-->
    <!--            compatibility based on your tags!-->
    <!--        </p>-->
  </div>
</template>