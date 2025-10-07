<template>
    <EpharmaTemplate>
        
        <template #page_title>RAYONS</template>
        <template #page_counter>
          <i class="fas fa-database"></i> {{ lines }} 
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key"  :url="'/api/' + table" :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2"  @click="openCreateModal()">
                        Nouveau rayon
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fas fa-edit"></i>
                    </button>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
  </template>
  
  <script>
   
    import { defineComponent, defineAsyncComponent } from 'vue';
    const FormRayon = defineAsyncComponent(() => import('./FormRayon.vue'));
    const ShowRayon = defineAsyncComponent(() => import('./ShowRayon.vue'));
    export default defineComponent({
   
        data() {
        return {
            lines: 0,
            table: 'rayons',
            columns: [
                {
                    key: 'libelle',
                    label: 'NOM',
                    exportable: true
                },
                // {
                //     key: 'description',
                //     label: 'DESCRIPTION',
                //     exportable: true
                // },
                {
                    key: 'nb_produits',
                    label: 'QTE PRODUIT',
                    exportable: true
                },
                {
                    key: 'total_achat',
                    label: 'VALEUR',
                    format: 'money',
                    exportable: true
                },
                
                {
                    key: 'created_at',
                    label: 'Ajouté le',
                    format: 'date',
                    exportable: true
                }
            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
          openCreateModal() {
              this.$dialog.open(FormRayon, {
                  props: {
                      header: "Nouveau rayon",
                      style: {
                          width: '30vw',
                      },
                      modal: true
                  }
              });
          },
          openShowModal(objData) {
            this.$dialog.open(ShowRayon, {
                props: {
                    header: "Rayon N°"+objData.id,
                    style: {
                        width: '30vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        }
      }
    })
  </script>