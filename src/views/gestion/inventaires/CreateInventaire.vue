<template>
            <!-- <form @submit.prevent="closeModal()">
                <p>Choisissez le type d'inventaire</p>
                <div class="d-flex">
                    <button class="text-vert border-vert bg-white rounded" type="button" @click=" ShowInventaireTotal()">Inventaire Total</button>
                    <button class="ml-4 text-vert border-vert bg-white rounded" type="button" @click=" ShowInventairePartiel()">Inventaire partiel</button>
                </div>
                <p v-if=" inventairetotal" class="mt-3">L'inventaire sera effectue sur tout les rayons de la pharmacie</p>
                 <div v-if="modalrayon">
                  <MoneyCounter :left_val="10" left_label="TOTAL CRÉDIT" :right_val="10" right_label="TOTAL DETTE"></MoneyCounter><br>
                  <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines"/>
                   <AsdecodeTable :key="key" :newKeyWord="keyWord"  v-on:set-total-records="updateLines">
                        <template #header_action_btns>
                            <button class="btn btn-light mr-2" @click="openCreateModal()">
                                
                            </button>
                        </template>
                        <template #action_btns=slotProps>
                            <div class="d-flex">
                                <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>
                        </template>
                    </AsdecodeTable>
                   </div>
                  
            </form> -->
  
    
</template>

<script>
    import MoneyCounter from '@/components/MoneyCounter.vue';
    import SearchByKeyword from '@/components/searchByKeyword.vue';
    import { defineComponent} from 'vue';
    export default defineComponent({
        name:'CreateInventaire',
        components:{MoneyCounter,SearchByKeyword},
  
        methods:{
            ShowInventaireTotal(){
                this. inventairepartiel=false;
                this. inventairetotal=true;
            },
           

        closeModal(){
            this.dialogRef.close();
            this.modalrayon=true;
        }            
        }
    })
 
</script>
