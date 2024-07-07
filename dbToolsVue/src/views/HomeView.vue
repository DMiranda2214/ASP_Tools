<template>
  <v-container fluid class="fill-height">
    <v-sheet class="mx-auto" width="600">
      <h1 aling="center">Postgres Tools</h1>
      <br>
      <v-form fast-fail @submit.prevent>
        <v-text-field label="URL Server"></v-text-field>
        <v-text-field label="Port" type="number"></v-text-field>
        <v-text-field label="DataBase"></v-text-field>
        <v-text-field label="Username"></v-text-field>
        <v-text-field label="Password" type="password"></v-text-field>
        <v-btn width="200" class="mt-4" type="submit" block>Ingresar</v-btn>
      </v-form>
    </v-sheet>
  </v-container>
</template>
<script setup>


</script>