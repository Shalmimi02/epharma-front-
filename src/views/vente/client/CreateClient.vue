<template>
    <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button class="nav-link active" id="nav-home-tab" data-toggle="tab" data-target="#nav-home" type="button"
                role="tab" aria-controls="nav-home" aria-selected="true">Compte principal</button>
            <button class="nav-link" id="nav-profile-tab" data-toggle="tab" data-target="#nav-profile" type="button"
                role="tab" aria-controls="nav-profile" aria-selected="false">Compte tier</button>
        </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
        <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
            <FormClientBase></FormClientBase>
        </div>
        <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
            <FormClientTier></FormClientTier>
        </div>
    </div>
</template>

<script>
import $ from 'jquery'
import { defineComponent } from 'vue';
import FormClientBase from './FormClientBase.vue'
import FormClientTier from './FormClientTier.vue'
export default defineComponent({
    name: 'CreateClient',
    inject: ['dialogRef'],
    components: { FormClientBase, FormClientTier },
})
</script>
