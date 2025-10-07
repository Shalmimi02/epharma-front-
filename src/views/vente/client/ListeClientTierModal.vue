<template>
    <!-- <MoneyCounter :left_val="10" left_label="TOTAL CRÉDIT" :right_val="10" right_label="TOTAL DETTE"></MoneyCounter><br> -->
    <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" />
    <AsdecodeTable :key="key" :url=" '/api/clients?client_id=' + this.dialogRef.data.id" :columns="columns" :table="table"
        :newKeyWord="keyWord">
        <template #action_btns=slotProps>
            <div class="d-flex">
                <!-- <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button> -->
            </div>
        </template>
    </AsdecodeTable>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'ClientTierModal',
    inject: ['dialogRef'],
    data() {
        return {
            key: 1,
            lines: 0,
            table: 'clients',
            isLoading: false,
            columns: [
                {
                    key: 'nom',
                    label: 'NOM DU CLIENT',
                    exportable: true
                },
                {
                    key: 'telephone',
                    label: 'TELEPHONE',
                    exportable: true
                },
                {
                    key: 'email',
                    label: 'EMAIL',
                    exportable: true
                },
                {
                    key: 'ville',
                    label: 'VILLE',
                    exportable: true
                }

            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
    },
})
</script>