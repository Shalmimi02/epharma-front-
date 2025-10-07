<template>
    <div class="card mx-auto border-bleugain mb-3">
        <div class="card-body row pt-2 pb-0 px-3">
            <div class="card-gain col text-center" v-for="(compteur, index) in this.compteurs" :key="index">
                <p class="border-bottom  font-weight-bold">{{compteur.label }}</p>
                <h5 class="text-bleugain">{{compteur.value }}</h5>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name:"StatCounter",
        props: [ 'compteurs' ],
        methods: {
            moneyFormat(varMoney) {
                if (varMoney) {
                    // Arrondir d'abord la valeur à l'entier le plus proche
                    const roundedValue = Math.round(varMoney);
                    // Formater sans décimales
                    return new Intl.NumberFormat('de-DE', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(roundedValue) + ' FCFA';
                }
                return '0 FCFA';
            },
        },
    }
</script>