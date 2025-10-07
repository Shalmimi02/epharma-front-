<template>
    <form @submit.prevent="" autocomplete="off">
        <input type="search" class="form-control form-control-sm m-0 search-form" placeholder="Tapez le mot clé à rechercher" v-model="keyWord" @input="onInputChange"  autocomplete="off">
    </form>
</template>

<script>
    export default {
        name:"InputRecherche",
        data() {
            return {
                keyWord: ''
            }
        },
        methods: {
            onInputChange() {
                this.$emit('set-keyword-filter', this.keyWord)
            }
        },
    }
</script>
