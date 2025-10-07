<template>
    <EpharmaTemplate>
        <template #page_title> DEVIS</template>
        <template #page_counter>
            <i class="fas fa-receipt"></i> {{ lines }}
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                </template>
                <template #action_btns=slotProps>
                    <div class="d-flex">
                        <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </div>
                </template>
                <template #status=slotProps>
                    
                    <span :class="slotProps.data.est_valide ? 'termine' : 'encours'">
                        {{ slotProps.data.est_valide ? 'Validé' : 'En attente' }}
                    </span>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import ShowDevis from "./ShowDevis.vue";
export default {
    data() {
        return {
            lines: 0,
            table: 'factures',
            columns: [
                {
                    key: 'id',
                    label: 'NUMÉRO',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'DATE',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'client',
                    label: 'CLIENTS',
                    exportable: true
                },
                {
                    key: 'reservation.montant',
                    label: 'NET A PAYER',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'UTILISATEUR',
                    exportable: true
                },
                {
                    key: 'status',
                    label: 'STATUT',
                    format: 'slot',
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
        openShowModal(objData) {
            this.$dialog.open(ShowDevis, {
                props: {
                    header: "Détails du devis N°" + objData.id,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
    }
}
</script>

<style>

/* .statut {
    border: 1px solid red;
    color: red;
    background: rgb(255, 250, 250);
    padding: .2rem 1rem;
    border-radius: 100px;
} */
.encours {
    border: 1px solid darkblue;
    color: #00008b;
    background: rgb(236, 236, 255);
    font-weight: 500;
    padding: .2rem 1rem;
    border-radius: 100px;
    text-transform: uppercase; /* Le texte sera en majuscules */
}

.termine {
    border: 1px solid green;
    color: green;
    background: rgb(249, 255, 249);
    font-weight: 700;
    padding: .2rem 1rem;
    border-radius: 100px;
    text-transform: uppercase; /* Le texte sera en majuscules */
}

</style>