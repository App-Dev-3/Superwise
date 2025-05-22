<script lang="ts" setup>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

interface SupervisorStatisticsProps {
  currentlySupervising: number;
  slots: number;
  pending: number;
  compatability: number;
  firstName: string;
  lastName: string;
  pending: number;
}

// TODO: add pending

const props = defineProps<SupervisorStatisticsProps>();

</script>

<template>
  <div class="w-full flex justify-center flex-col p-4 gap-3">
    <div class="flex flex-row gap-2 items-center">
      <FontAwesomeIcon
        class="opacity-75"
        icon="user"
      />
      <p class="text-small">
            <span class="text-primary text-body">
              {{ props.currentlySupervising }}
            </span>
        <span class="opacity-50">
              out of
            </span>
        <span class="text-primary text-body">
              {{ props.slots }}
            </span>
        <span class="opacity-50">
              slots are already filled.
            </span>
      </p>
    </div>

    <div class="flex flex-row gap-2 items-center">
      <FontAwesomeIcon
        class="opacity-75"
        icon="hourglass"
      />
      <p class="text-small">
            <span class="text-primary text-body">
              {{ props.pending }}
            </span>
        <span class="opacity-50">
            supervision requests are pending.
            </span>
      </p>
    </div>

    <p class="text-x-small opacity-50">
      You and
      <span class="font-bold">
            {{ props.firstName }} {{ props.lastName }}
          </span>
      have a
      <span class="font-bold">
            {{ compatability }}%
          </span>
      compatibility based on your tags!
    </p>
  </div>
</template>