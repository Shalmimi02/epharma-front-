<template>
    <EpharmaTemplate :withHeader="false">
        <template #content>
            <div class="container">
                <DefaultView></DefaultView>
            </div>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent } from 'vue';
import DefaultView from "@/components/DefaultView";
export default defineComponent({
    components: { DefaultView },
})
</script>
