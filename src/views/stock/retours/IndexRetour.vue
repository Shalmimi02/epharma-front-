<template>
    <EpharmaTemplate>
        <template #page_title>LISTE DES RETOURS AUX FOURNISSEURS</template>
            <template #page_counter>
            <i class="fas fa-database">{{ lines }}</i> 
            </template> 
            <template #content>
                <div class="col-md-4 ml-auto mb-3">
                    <searchByKeyword v-on:set-keyword-filter="searchLines" />
                </div>
                <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                   
                    <template #action_btns=slotProps>
                        <button class="btn btn-sm btn-light m-1" @click="openEditModal(slotProps.data)">
                            <i class="fas fa-edit"></i>
                        </button>
                    </template>
                </AsdecodeTable>
            </template>
    </EpharmaTemplate>
</template>
<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const EditRetour = defineAsyncComponent(() => import('./EditRetour.vue'));

export default defineComponent({
    data() {
        return {
            key: 0,
            table: 'retours',
            lines: 0,
            keyWord: '',
            columns: [
                {
                    key: 'libelle',
                    label: 'PRODUIT',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QTE PRODUIT',
                    exportable: true
                },
                 {
                    key: 'valeur',
                    label: 'VALEUR',
                    format: 'money',
                    exportable: true
                },
               
                {
                    key: 'created_at',
                    label: 'DATE',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'nom_fournisseur',
                    label: 'FOURNISSEUR',
                    exportable: true
                },
               
                {
                    key: 'statut',
                    label: 'SRATUT',
                    exportable: true
                }
            ]
        };
    },
    methods: {
        searchLines(keyword) {
            this.keyWord = keyword;
        },
        updateLines(total) {
            this.lines = total;
        },
       openCreateModal() {
              this.$dialog.open(FormRetour, {
                  props: {
                      header: "Nouveau rayon",
                      style: {
                          width: '60vw',
                      },
                      modal: true
                  }
              });
          },
       openEditModal(objData) {
            this.$dialog.open(EditRetour, {
                props: {
                    header: "Modifier le statut",
                    style: {
                        width: '50vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
    }
});
</script>