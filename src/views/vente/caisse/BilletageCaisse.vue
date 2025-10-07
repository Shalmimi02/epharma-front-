<template>
    <div class="d-flex justify-content-between mx-auto" style="padding-left:10%;padding-right:10%; align-items: center;">
         <div class="d-flex">
                <button class="text-white mt-3" style="font-size:30px; background-color: #323232;">N°</button>
                <i class="fa-solid fa-caret-left pt-4 pl-3"></i>
          </div>
        <div class="d-flex">
                <i class="fa-solid fa-caret-right pt-4 pr-3"></i>
                <div><i class="fa-solid fa-rotate  pt-3" style="font-size:27px;color: #323232;"></i></div>
                <div><i class="fas fa-sign-in-alt pt-3 pl-5 text-danger" style="font-size: 25px;"></i></div>
        </div>
    </div><br><br>
    <div class="d-flex flex-column mx-auto" style="width: 8%;">
        <button class="pt-1 pb-1 text-white" style="background-color: #323232; border-radius: 5px" @click="openCreateModalEditCaisse()">Billetage</button><br>
        <button class="text-white" style="background-color: #323232; border-radius: 5px">
            <p>TTC</p>
            <p style="font-size: 25px;">00 FCFA</p>
        </button>
    </div>
</template>
<script>
    import { defineComponent, defineAsyncComponent } from 'vue';
    const EditCaisse = defineAsyncComponent(() => import('./EditCaisse.vue'));
    export default defineComponent({
        methods:{
                 openCreateModalEditCaisse() {
                    this.$dialog.open(EditCaisse, {
                    props: {
                         header: "Enregistrement de billetage pour la caisse",
                         style: {
                         width: '60vw',
                         },
                         modal: true
                     }
            });
        }
    }
    })
</script>