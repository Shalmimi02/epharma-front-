<template>
    <nav-bar></nav-bar>
    <div v-if="this.withHeader !== false" class="margin-topmenu border-bottom mb-2" >
        <div class="container-fluid d-flex justify-content-between align-items-center text-primary py-2 px-3 ">
            <div>
                <h3 class="font-weight-bold">
                    <slot name="page_title"></slot>
                </h3>
            </div>
            <div>
                <h2 class="font-weight-bold">
                    <slot name="page_counter"></slot>
                </h2>
            </div>
        </div>
    </div>

    <div class="container-fluid pb-5" :class="{'margin-topmenu': this.withHeader == false}">
        <slot name="content"></slot>
    </div>
    <footer-bar></footer-bar>
</template>


<script>
import NavBar from './NavBar.vue';
import FooterBar from './FooterBar.vue';

export default {
    props: ['withHeader'],
    name: 'DropdownNavCard',
    components: { NavBar, FooterBar },
};
</script>

<style>
.margin-topmenu {
    margin-top: 60px;
}
</style>