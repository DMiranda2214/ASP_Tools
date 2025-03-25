<template>
<v-container fluid class="fill-height">
    <v-row class="login-container">
        <v-col cols="12" md="6" class="left-section">
            <v-card class="login-card" elevation="10">
                <v-card-title class="text-h5 font-weight-bold"> Bienvenido </v-card-title>
                <v-card-subtitle class="mb-4"> Conectate a tu base de datos </v-card-subtitle>
                <v-form @submit.prevent="submitAuth">
                    <v-text-field
                        label="URL del servidor"
                        v-model="authForm.server"
                        prepend-inner-icon="mdi-email"
                        type="text"
                        variant="outlined"
                        required
                    ></v-text-field>

                    <v-text-field
                        label="Puerto"
                        v-model="authForm.port"
                        prepend-inner-icon="mdi-lock"
                        type="number"
                        variant="outlined"
                        required
                    ></v-text-field>

                    <v-text-field
                        label="Usuario"
                        v-model="authForm.username"
                        prepend-inner-icon="mdi-lock"
                        type="text"
                        variant="outlined"
                        required
                    ></v-text-field>

                    <v-text-field
                        label="Contraseña"
                        v-model="authForm.password"
                        prepend-inner-icon="mdi-lock"
                        type="password"
                        variant="outlined"
                        required
                    ></v-text-field>

                    <v-text-field
                        label="Base de datos"
                        v-model="authForm.dataBase"
                        prepend-inner-icon="mdi-lock"
                        type="text"
                        variant="outlined"
                        required
                    ></v-text-field>

                    <v-btn block color="primary" :loading="loading" type="submit" class="mt-4">
                    Conectar
                    </v-btn>
                </v-form>
            </v-card>
        </v-col>

        <v-col cols="12" md="6" class="right-section">
            <div class="info-container">
                <h2 class="text-h4 font-weight-bold">¡Descubre nuestra plataforma!</h2>
                <p class="text-body-1">
                Gestiona tus procesos de manera eficiente y accede a todas las funcionalidades en un solo lugar.
                </p>
            </div>
        </v-col>
    </v-row>
</v-container>
</template>
<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    const router = useRouter()
    const loading = ref(false)
    const authForm = ref({
        server: 'localhost',
        port: '',
        username: 'postgres',
        password: '1234567890',
        dataBase: 'Prueba'
    })

    const submitAuth = async () => {
        loading.value = true
        try {
            const response = await fetch('http://localhost:3080/api/v1/pgServer/connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authForm.value)
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || 'Error durante la autenticación')
            }
            sessionStorage.setItem('sessionToken', JSON.stringify(data.sessionToken))
            successAlert()
        } catch (error) {
            errorAlert(error.message)
        } finally {
            loading.value = false
        }
    }

    const successAlert = () => {
        Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            text: 'Autenticación exitosa',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            router.push('/Procedures')
        })
    }

    const errorAlert = (error) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error
        })
    }
</script>

<style scoped>
    /* Fondo y disposición */
    .fill-height {
        background: linear-gradient(to right, #1b3b6f, #4682b4, #87ceeb);
    }

    /* Contenedor principal */
    .login-container {
        display: flex;
        align-items: center;
        min-height: 100vh;
    }

    /* Sección izquierda */
    .left-section {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .login-card {
        width: 100%;
        max-width: 400px;
        padding: 20px;
        border-radius: 12px;
        background: white;
    }

    /* Sección derecha */
    .right-section {
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        text-align: center;
        padding: 30px;
    }

    .info-container {
        max-width: 500px;
    }
</style>