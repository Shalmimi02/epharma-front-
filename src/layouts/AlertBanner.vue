<template>
  <div class="alert-banner">
    <p>{{ message }} <a href="https://votre-site.com/update" target="_blank" v-if="showUpdateLink">Mettez à jour ici</a></p>
    <button @click="closeBanner" v-if="closable">X</button>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    showUpdateLink: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    closeBanner() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.alert-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #b21616;
  color: #fff;
  padding: 40px;
  border-radius: 4px;
  margin: 40px;
  position: relative;
}


.alert-banner a {
  color: #4f94d9;
  text-decoration: underline;
  font-weight: bold;
  font-size: 1.2em;
  margin-left: 10px;
}

.alert-banner button {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
}

.alert-banner button:hover {
  color: #ccc;
}
</style>





