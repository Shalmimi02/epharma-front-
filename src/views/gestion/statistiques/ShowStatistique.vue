<template>
    <EpharmaTemplate>
        <template #page_title>STATISTIQUES</template>
        <template #page_counter>
            <i class="fa-solid fa-chart-simple" style="font-size: 25px;"></i>
        </template>
        <template #content>
            <p class="text-center h4">Evolution du chiffre d'affaire</p><br>
            <form class="mb-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mx-auto">
                            <label for="">Périodicité</label>
                            <select class="form-control" v-model="TypePeriode" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                                <option value="MENSUEL">MENSUEL</option>
                                <option value="JOURNALIERE">JOURNALIERE</option>
                                <option value="HEBDOMADAIRE">HEBDOMADAIRE</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>
            <div class="shadow">
                <p class="font-weight-bold text-center" style="color: #0b508c;">CHIFFRE D'AFFAIRE {{ TypePeriode }}</p>
                <form class="mt-4  p-3">
                    <div class="container">
                        <div class="row">
                            <div class="mx-auto d-flex justify-content-between">
                                <div class="col-md-4">
                                    <input type="number" value="2024" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                                </div>
                                <div class="col-md-4">
                                    <button class="text-white p-1"
                                        style="background-color: #153b82; border: none;">Appliquer</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
                <Chart type="bar" :data="chartData" :options="chartOptions" class="h-30rem" />
            </div>
            <p class="text-center h4" style="margin-top: 5%;">Statistique sur les produits</p><br>
            <div class="row shadow-sm">
                <div class="form-group col-4">
                    <div>

                        <div>

                            <input class="form-control form-control-sm" type="date" v-model="filterForm" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                        </div>
                    </div>
                </div>
                <div class="form-group col-4">
                    <div>

                        <div>

                            <input class="form-control form-control-sm" type="date" v-model="filterForm.fin" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                        </div>
                    </div>
                </div>
                <button>Appliquer</button>
            </div>
            <div class="row justify-content-center">
                <div class="">
                    <div class="col">
                        <div class="w-20 h-50">

                            <div class="card flex justify-content-center" style="margin-top: 2%;">
                                <small class="text-center mt-4"> Structure de revenu</small>
                                <Chart type="pie" :data="chartData" class="w-full md:w-10rem" />

                            </div>
                        </div>
                    </div>
                </div>

                <div class="">
                    <div class="col">
                        <div class="w-20 h-50">

                            <div class="card flex justify-content-center" style="margin-top: 2%;">
                                <small class="text-center mt-4"> Produits les plus vendus</small>
                                <Chart type="bar" :data="chartData" :options="chartOptions" class="h-30rem" />

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </template>
    </EpharmaTemplate>

</template>

<script>

import Chart from 'primevue/chart';

export default {
    components: { Chart },
    data() {
        return {
            chartData: null,
            chartOptions: null,
            TypePeriode: 'MENSUEL',
            filterForm: {}
        };

    },
    mounted() {
        this.chartData = this.setChartData();
        this.chartOptions = this.setChartOptions();
    },
    methods: {
        checkUrlFormat(link) {
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'
            return link
        },
        periodFilter() {
            let newUrl = this.defaultUrl

            if (this.filterForm.debut) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_debut=' + this.filterForm.debut
            }

            if (this.filterForm.fin) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_fin=' + this.filterForm.fin
            }

            this.url = newUrl
            this.key++
        },
        setChartData() {
            const documentStyle = getComputedStyle(document.documentElement);

            return {
                labels: ['TVA', 'CSS', 'Achat', 'Benefice'],
                datasets: [
                    {
                        label: "Premier chiffre d'affaire",
                        data: [540, 325, 702],
                        hoverBackgroundColor: [documentStyle.getPropertyValue('--cyan-400'), documentStyle.getPropertyValue('--orange-400'), documentStyle.getPropertyValue('--gray-400')],
                        backgroundColor: documentStyle.getPropertyValue('--cyan-500'),
                        borderColor: documentStyle.getPropertyValue('--cyan-500'),
                        data: [65, 59, 80, 81, 56, 55, 40]
                    },
                    {
                        label: "Second chifre d'affaire",
                        backgroundColor: documentStyle.getPropertyValue('--gray-500'),
                        borderColor: documentStyle.getPropertyValue('--gray-500'),
                        data: [28, 48, 40, 19, 86, 27, 90]
                    }
                ]
            };
        },
        setChartOptions() {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
            const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

            return {
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: {
                                weight: 500
                            }
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false
                        }
                    }
                }
            };
        }
    }
};
</script>
