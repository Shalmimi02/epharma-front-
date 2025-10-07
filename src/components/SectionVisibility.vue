<template>
    <button type="button" class="ml-auto btn " @click="toggleCardStatus">
        <i :class="sectionIsOpen ? 'fa-solid fa-circle-chevron-down' : 'fa-solid fa-circle-chevron-right'"></i>
        {{ cardStatus }} <span class="ml-1 text-success font-weight-bold">{{ this.libelleSection }}</span> 
    </button>
    <hr v-if="sectionIsOpen == false" class="text-primary">
    <div v-show="sectionIsOpen">
        <slot name="section_content"></slot>
    </div>
</template>

<script>
    export default {
        props: ['libelleSection', 'isOpen'],
        data() {
            return {
                sectionIsOpen: false,
                cardStatus: 'Afficher',
            }
        },
        mounted() {
            if (this.isOpen == true) {
                this.toggleCardStatus()
            }
        },
        methods: {
            toggleCardStatus() {
                this.sectionIsOpen = !this.sectionIsOpen; // Alterner l'état ouvert/fermé
                if (this.cardStatus == 'Masquer') {
                    this.cardStatus = 'Afficher'
                }
                else this.cardStatus = 'Masquer'
            }
        },
    }
</script>