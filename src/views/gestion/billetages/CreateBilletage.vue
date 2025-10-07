<template>
    <form @submit.prevent="closeBilletage()">
        <h5 class="mb-3">Periode de billetage</h5>
        <div class="form-row mb-3">
            <div class="form-group col-md-3">
                <label>Date de debut</label>
                <input type="date" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.date_debut" required>
            </div>
            <div class="form-group col-md-2">
                <label>Heure de debut</label>
                <input type="time" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.heure_debut" required>
            </div>
            <div class="form-group col-md-3">
                <label>Date de fin</label>
                <input type="date" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.date_fin" required>
            </div>
            <div class="form-group col-md-2">
                <label>Heure de fin</label>
                <input type="time" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.heure_fin" required>
            </div>
        </div>
        <div class="d-flex">
            <div class="text-center m-3">
                <span class="bg-primary text-white  px-3 py-2">Total billetage {{ moneyFormat(totalBilletage) }}</span>
            </div>

            <button type="button" class="btn btn-success btn-sm  px-3 py-2"  @click.prevent="printSolde()" >
                <i class='fas fa-print'></i> Imprimer
            </button>
        </div>

        <h5 class="mb-3">Comptage</h5>
        <div class="form-inline mb-3 p-2 border border-primary">
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 5 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.cinq_franc">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 10 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.dix_franc">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 25 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.vingt_cinq_franc">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 50 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.cinquante_franc">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 100 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.cent_franc">
                <span>Piece(s)</span>
            </div>
        </div>

        <div class="form-inline mb-3 p-2 border border-primary">
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 500 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.cinq_cent_franc">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 1 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.mil_franc">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 2 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.deux_mil_franc">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 5 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.cinq_mil_franc">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 10 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]" min="0"
                    v-model="form.dix_mil_franc">
                <span>Billet(s)</span>
            </div>
        </div>

        <h5 class="mb-3">Commentaire</h5>
        <textarea class="form-control border border-dark px-[4rem]" rows="5" v-model="form.description"></textarea>

        <div class="d-flex justify-content-end mt-3">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Fermer</button>
            <button type="submit" class="btn btn-light mr-2">
                Cloturer le billetage sur la periode
                <span v-if="BilletageIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </div>

        <section ref="Billetage" v-show="false">
            <div class="invoice-box" id="Billetage">
            <div class="invoice">
                
                <div class="infoPharma">
                <p>
                    Nom: {{ this.$store.state.pharmacie.nom_pharmacie }}<br />
                    Adresse: {{ this.$store.state.pharmacie.adresse }}<br />
                    Tel1: {{ this.$store.state.pharmacie.telephone1 }}<br />
                    Tel2: {{ this.$store.state.pharmacie.telephone2 }}
                </p>
                </div>
                <div class="logo">
                    <img src="../../../../public/img/epharma-sf.png" alt="Logo" height="20px" width="50px"/>
                </div>
                <div class="date">
                {{ new Date().toLocaleDateString() }} {{ new Date().toLocaleTimeString() }}
                </div>
            </div>

            <div class="invoice-b">
                <h2>BILLETAGE N° {{ this.dialogRef.data.id }}</h2>
            </div>

            <div>
                <h3>Période du billetage</h3>
                <p>
                <strong>Date : {{ dateFormat(this.form.date_debut) }} -
                    {{ dateFormat(this.form.date_fin) }}</strong><br />
                <strong>Heure : {{ this.form.heure_debut }} -
                    {{ this.form.heure_fin }}</strong><br />
                <strong>Caissière : {{ this.form.ended_with }}</strong>
                </p>
            </div>

            <p><strong>COMPTAGE</strong></p>
            <table class="table table-bordered">
                <thead>
                <tr class="iconBillet">
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2c0 0 0 0 0 0s0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4l0 3.4 0 5.7 0 26.3zm32 0l0-32 0-25.9c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 44.2-86 80-192 80S0 476.2 0 432l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2c0 0 0 0 0 0s0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4l0 3.4 0 5.7 0 26.3zm32 0l0-32 0-25.9c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 44.2-86 80-192 80S0 476.2 0 432l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2c0 0 0 0 0 0s0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4l0 3.4 0 5.7 0 26.3zm32 0l0-32 0-25.9c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 44.2-86 80-192 80S0 476.2 0 432l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2c0 0 0 0 0 0s0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4l0 3.4 0 5.7 0 26.3zm32 0l0-32 0-25.9c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 44.2-86 80-192 80S0 476.2 0 432l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2c0 0 0 0 0 0s0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4l0 3.4 0 5.7 0 26.3zm32 0l0-32 0-25.9c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5l0 35.4c0 44.2-86 80-192 80S0 476.2 0 432l0-35.4c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z"/></svg>
                    </th>
                    <th>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z"/></svg>
                    </th>
                </tr>
                <tr class="valeurMoney">
                    <th>5 FCFA</th>
                    <th>10 FCFA</th>
                    <th>25 FCFA</th>
                    <th>50 FCFA</th>
                    <th>100 FCFA</th>
                    <th>500 FCFA</th>
                    <th>1000 FCFA</th>
                    <th>2000 FCFA</th>
                    <th>5000 FCFA</th>
                    <th>10 000 FCFA</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{{ this.form.cinq_franc }}</td>
                    <td>{{ this.form.dix_franc }}</td>
                    <td>{{ this.form.vingt_cinq_franc }}</td>
                    <td>{{ this.form.cinquante_franc }}</td>
                    <td>{{ this.form.cent_franc }}</td>
                    <td>{{ this.form.cinq_cent_franc }}</td>
                    <td>{{ this.form.mil_franc }}</td>
                    <td>{{ this.form.deux_mil_franc }}</td>
                    <td>{{ this.form.cinq_mil_franc }}</td>
                    <td>{{ this.form.dix_mil_franc }}</td>
                </tr>
                </tbody>
                <tfoot>
                <tr>
                    <td colspan="8">TOTAL :</td>
                    <td colspan="2">{{ moneyFormat(totalBilletage) }}</td>
                </tr>
                </tfoot>
            </table>

            <div>
                <p>
                <strong>Commentaire de validation :</strong><br />
                {{ this.form.description }}
                </p>
            </div>
            </div>


        <div class="footer">
            <strong>{{ this.$store.getters.pharmacie.nom_pharmacie }}.</strong><br>
            {{ this.$store.getters.pharmacie.adresse }} | BP: <br>
            TEL: {{ this.$store.getters.pharmacie.telephone1 }} / {{ this.$store.getters.pharmacie.telephone2 }} |
            Email: {{ this.$store.getters.pharmacie.email }}<br>
            {{ this.$store.getters.pharmacie.rccm }} | {{ this.$store.getters.pharmacie.nif }}
        </div>

    </section>
    </form>
</template>

<script>
import { defineComponent } from 'vue';
import $ from 'jquery';
import moment from 'moment'
export default defineComponent({
    inject: ['dialogRef'],
    data() {
        return {
            table: 'billetages',
            billetages: null,
            BilletageIsLoading: false,
            form: {
                caisse_libelle: this.dialogRef.data.libelle,
                ended_with: this.$store.getters.user.fullname,
                cinq_franc: 0,
                dix_franc: 0,
                vingt_cinq_franc: 0,
                cinquante_franc: 0,
                cent_franc: 0,
                cinq_cent_franc: 0,
                mil_franc: 0,
                deux_mil_franc: 0,
                cinq_mil_franc: 0,
                dix_mil_franc: 0,
            }
        }
    },
    computed: {
        totalBilletage() {
            let total = 0
            let total_cinqf = this.form.cinq_franc * 5
            let total_dixf = this.form.dix_franc * 10
            let total_vingtf = this.form.vingt_cinq_franc * 25
            let total_cinquantef = this.form.cinquante_franc * 50
            let total_centf = this.form.cent_franc * 100
            let total_cinqcf = this.form.cinq_cent_franc * 500
            let total_millef = this.form.mil_franc * 1000
            let total_deuxMf = this.form.deux_mil_franc * 2000
            let total_cinqMf = this.form.cinq_mil_franc * 5000
            let total_dixMf = this.form.dix_mil_franc * 10000
            total = total_cinqf + total_dixf + total_vingtf + total_cinquantef + total_centf + total_cinqcf + total_millef + total_deuxMf + total_cinqMf + total_dixMf
            return total
        }
    },
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
        dateFormat(varDate) {
            if (varDate != '') {
                const newDate = new Date(varDate)
                if (newDate) return moment(newDate).format('DD/MM/YYYY')
            }
        },
        closeBilletage() {
            if (this.totalBilletage < 1) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'Vous ne pouvez pas enregistrer un billetage sans compter',
                    life: 7000
                });
                return
            }
            this.BilletageIsLoading = true
            this.form.total_billetage = this.totalBilletage

            this.axios.post( '/api/billetages', this.form).then(response => {
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()

                    this.resetForm()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    
                    // Émettre un événement global pour notifier les autres composants
                    window.dispatchEvent(new CustomEvent('billetage:created'));
                    
                    // Puis fermer le dialogue
                    this.dialogRef.close()
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });

                }
                this.BilletageIsLoading = false
            }).catch(() => {
                this.BilletageIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });

            })

        },
        printSolde() {
            const receiptContent = this.$refs.Billetage.innerHTML;
            const printWindow = window.open("", "", "width=1000,height=900");

            // Charger le contenu et les styles dans la nouvelle fenêtre
            printWindow.document.write(`
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <style>
                body {
                font-family: 'Roboto', 'Helvetica', Arial, sans-serif;
               
                }

                .invoice-box {
                font-size: 16px;
                line-height: 24px;
                color: #555;
                width: 100%;
                }

                .invoice {
                display: flex;
                justify-content: space-between;
                font-size: 16px;
                line-height: 24px;
                }
                .logo img {
                height: 50px; 
                }
                .infoPharma p {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                }

                .date {
                text-align: right;
                font-size: 14px;
                }

                .invoice-b {
                text-align: center;
                margin: 20px 0;
                }

                h2 {
                font-weight: bold;
                font-size: 24px;
                margin-bottom: 10px;
                }

                h3 {
                font-size: 18px;
                margin-bottom: 10px;
                }

                .table {
                border-collapse: collapse;
                width: 100%;
                margin-top: 20px;
                }

                .table th,
                .table td {
                border: 1px solid black;
                text-align: center;
                padding: 8px;
                }

                .iconBillet {
                    background-color: #343a40; /* Couleur sombre pour les icônes */
                    color: #fff; /* Texte et icônes en blanc */
                }
                .iconBillet svg {
                    color: #fff;
                    height:15px;
                }
                .valeurMoney {
                    background-color: #f0f0f0; /* Couleur grise claire pour les valeurs monétaires */
                    font-weight: bold;
                    color: #000; /* Texte en noir */
                }

                .valeurMoney th, .iconBillet th {
                    padding: 10px; /* Ajoutez de l'espace pour une meilleure lisibilité */
                }

                tfoot td {
                font-weight: bold;
                background-color: #f9f9f9;
                }

                p strong {
                font-size: 16px;
                }


                .print-button {
                display: block;
                width: 100px;
                margin: 20px auto;
                padding: 10px;
                background-color: #007bff;
                color: white;
                text-align: center;
                cursor: pointer;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                }
                .print-logo {
                width: 150px;
                }

                .print-button:hover {
                background-color: #0056b3;
                }
                .footer {
                background-color: #f1f1f1; /* Light gray background */
                text-align: center;
                padding: 10px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
                width: 100%;
                position: fixed;
                bottom: 0;
                left: 0;
                }

                .footer strong {
                color: #333;
                }
            </style>
            </head>
            <body>
            ${receiptContent}
            </body>
            </html>
        `); 
        
            // Attendre que le contenu soit chargé avant d'imprimer
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close(); 
    },
    resetForm() {
            this.form = {
                caisse_libelle: this.dialogRef.data.libelle,
                ended_with: this.$store.getters.user.fullname,
                cinq_franc: 0,
                dix_franc: 0,
                vingt_cinq_franc: 0,
                cinquante_franc: 0,
                cent_franc: 0,
                cinq_cent_franc: 0,
                mil_franc: 0,
                deux_mil_franc: 0,
                cinq_mil_franc: 0,
                dix_mil_franc: 0,
            }
        }
     }
})
</script>
