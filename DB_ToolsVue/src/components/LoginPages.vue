<template>
  <v-container class="fill-height d-flex align-center justify-center" >
    <v-row justify="center" align="center" style="height: 100vh;">
      <v-col cols="6" sm="6" md="6" lg="6">
        <v-card class="w-100" max-width="400">
          <v-card-title class="text-h5">ASP TOOLS</v-card-title>
          <v-card-subtitle>Ingresa tus datos para realizar la conexion</v-card-subtitle>
          <v-form  @submit.prevent="handleSubmit">
            <v-card-text>
              <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>

              <v-text-field  v-model="loginForm.urlServer" label="Server URL" required></v-text-field>
              <v-text-field  v-model="loginForm.portServer" label="Port" required></v-text-field>
              <v-text-field  v-model="loginForm.username" label="Username" required></v-text-field>
              <v-text-field  v-model="loginForm.password" label="Password" type="password" required></v-text-field>
              <v-text-field  v-model="loginForm.database" label="Database" required></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn :loading="isLoading" color="primary" type="submit" block>
                {{ isLoading ? "Conectando..." : "Conectar" }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
      <v-col>
        <h2 class="text-h2">ASP TOOLS</h2>
        <p class="text-body-1">Aprende, prueba, aplica y replica</p>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter()

const isLoading = ref(false);
const error = ref("");
const loginForm= ref({
  urlServer:'localhost',
  portServer:'5432',
  username:'postgres',
  password:'1234567890',
  database:'ASPTool',
})

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("http://localhost:3000/api/v1/pgServer/connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm.value)
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Authentication failed");
    }
    localStorage.setItem("token", data.sessionToken);
    router.push("/tables");
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>