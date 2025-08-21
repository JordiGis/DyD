<template>
    <div class="combat-view" :style="{ backgroundColor: currentStateData.color + '20' }">
        <div class="container py-4">
            <!-- Header del personaje -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card shadow-lg border-0" :style="{ borderLeft: `5px solid ${currentStateData.color}` }">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2 text-center">
                                    <img :src="getImageUrl(currentStateData.image)" :alt="character.name" 
                                         class="character-image rounded-circle shadow" width="80" height="80">
                                </div>
                                <div class="col-md-6">
                                    <h2 class="mb-1" :style="{ color: currentStateData.color }">{{ character.name }}</h2>
                                    <h5 class="text-muted mb-0">{{ currentStateData.name }}</h5>
                                    <small class="text-muted">{{ currentStateData.description }}</small>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button class="btn btn-outline-secondary btn-sm" @click="gameStore.resetCharacter()">
                                        <i class="bi bi-arrow-clockwise"></i> Reset Completo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vida y Estado Principal -->
            <div class="row mb-4">
                <div class="col-lg-8">
                    <!-- Barra de Vida -->
                    <div class="card shadow">
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0"><i class="bi bi-heart-fill"></i> Puntos de Vida</h5>
                        </div>
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <div class="progress mb-3" style="height: 25px;">
                                        <div class="progress-bar" 
                                             :class="`bg-${hpBarColor}`"
                                             :style="{ width: hpPercentage + '%' }"
                                             role="progressbar">
                                            {{ character.currentHp }} / {{ character.maxHp }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="input-group">
                                        <input type="number" 
                                               class="form-control" 
                                               v-model.number="tempHp"
                                               :min="0" 
                                               :max="character.maxHp"
                                               placeholder="HP">
                                        <button class="btn btn-primary" @click="setHp">
                                            <i class="bi bi-check2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <button class="btn btn-danger w-100" @click="takeDamage">
                                        <i class="bi bi-dash-circle"></i> Recibir Daño
                                    </button>
                                </div>
                                <div class="col-6">
                                    <button class="btn btn-success w-100" @click="healCharacter">
                                        <i class="bi bi-plus-circle"></i> Curar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estados del Personaje -->
                <div class="col-lg-4">
                    <div class="card shadow">
                        <div class="card-header" :style="{ backgroundColor: currentStateData.color, color: 'white' }">
                            <h5 class="mb-0"><i class="bi bi-sun"></i> Estado Actual</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button v-for="(state, key) in characterStates" 
                                        :key="key"
                                        class="btn btn-sm"
                                        :class="character.currentState === key ? 'btn-primary' : 'btn-outline-secondary'"
                                        @click="gameStore.changeState(key)">
                                    {{ state.name }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Furia y Resistencias -->
            <div class="row mb-4">
                <div class="col-lg-6">
                    <div class="card shadow">
                        <div class="card-header bg-danger text-white">
                            <h5 class="mb-0"><i class="bi bi-fire"></i> Gestión de Furia</h5>
                        </div>
                        <div class="card-body">
                            <!-- Contador de Furia -->
                            <div class="text-center mb-3">
                                <h3 class="mb-2">Cargas de Furia: {{ furyCountDisplay }}</h3>
                                <div class="btn-group mb-3" role="group">
                                    <button class="btn btn-outline-danger" 
                                            @click="gameStore.removeFury()"
                                            :disabled="character.furyCount === 0">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <button class="btn btn-outline-primary" @click="gameStore.resetFury()">
                                        <i class="bi bi-arrow-clockwise"></i> Reset
                                    </button>
                                    <button class="btn btn-outline-success" 
                                            @click="gameStore.addFury()"
                                            :disabled="character.furyCount >= character.maxFury">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Estado de Furia -->
                            <div class="text-center">
                                <div v-if="character.isFuryActive" class="alert alert-danger">
                                    <i class="bi bi-fire"></i> <strong>¡FURIA ACTIVA!</strong>
                                </div>
                                <div v-else class="alert alert-secondary">
                                    <i class="bi bi-moon"></i> Furia Inactiva
                                </div>

                                <div class="d-grid gap-2">
                                    <button v-if="!character.isFuryActive && canActivateFury" 
                                            class="btn btn-danger" 
                                            @click="gameStore.activateFury()">
                                        <i class="bi bi-lightning-charge"></i> Activar Furia
                                    </button>
                                    <button v-if="character.isFuryActive" 
                                            class="btn btn-outline-danger" 
                                            @click="gameStore.deactivateFury()">
                                        <i class="bi bi-stop-circle"></i> Desactivar Furia
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resistencias -->
                <div class="col-lg-6">
                    <div class="card shadow">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="mb-0"><i class="bi bi-shield-check"></i> Resistencias</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="character.isFuryActive">
                                <div class="alert alert-success">
                                    <h6><i class="bi bi-shield-fill-check"></i> Resistencias Activas:</h6>
                                    <ul class="mb-0">
                                        <li v-for="resistance in furyResistances" :key="resistance">
                                            {{ formatResistance(resistance) }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div v-else>
                                <div class="alert alert-secondary">
                                    <i class="bi bi-info-circle"></i> Sin resistencias activas. Activa la furia para obtener resistencias.
                                </div>
                            </div>

                            <!-- Info adicional -->
                            <small class="text-muted">
                                <strong>Nota:</strong> Las resistencias solo están activas cuando la furia está activada.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de Acciones Rápidas -->
            <div class="row">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0"><i class="bi bi-gear"></i> Acciones Rápidas</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-2">
                                    <div class="input-group">
                                        <input type="number" v-model.number="quickDamage" class="form-control" placeholder="Daño">
                                        <button class="btn btn-danger" @click="quickTakeDamage">
                                            <i class="bi bi-sword"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <div class="input-group">
                                        <input type="number" v-model.number="quickHeal" class="form-control" placeholder="Curación">
                                        <button class="btn btn-success" @click="quickHealCharacter">
                                            <i class="bi bi-heart-pulse"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <button class="btn btn-warning w-100" @click="restLong">
                                        <i class="bi bi-moon-stars"></i> Descanso Largo
                                    </button>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <button class="btn btn-primary w-100" @click="restShort">
                                        <i class="bi bi-cup-hot"></i> Descanso Corto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import { getImageUrl } from '../utils/imageHelper'

const gameStore = useGameStore()

// Referencias reactivas
const tempHp = ref(gameStore.character.currentHp)
const quickDamage = ref(0)
const quickHeal = ref(0)

// Computed properties desde el store
const character = computed(() => gameStore.character)
const currentStateData = computed(() => gameStore.currentStateData)
const hpPercentage = computed(() => gameStore.hpPercentage)
const hpBarColor = computed(() => gameStore.hpBarColor)
const furyCountDisplay = computed(() => gameStore.furyCountDisplay)
const canActivateFury = computed(() => gameStore.canActivateFury)
const furyResistances = computed(() => gameStore.furyResistances)
const characterStates = computed(() => gameStore.characterStates)

// Métodos
const setHp = () => {
    gameStore.setHp(tempHp.value)
}

const takeDamage = () => {
    const damage = prompt('¿Cuánto daño has recibido?')
    if (damage && !isNaN(damage)) {
        gameStore.takeDamage(parseInt(damage))
    }
}

const healCharacter = () => {
    const heal = prompt('¿Cuántos puntos de vida recuperas?')
    if (heal && !isNaN(heal)) {
        gameStore.heal(parseInt(heal))
    }
}

const quickTakeDamage = () => {
    if (quickDamage.value > 0) {
        gameStore.takeDamage(quickDamage.value)
        quickDamage.value = 0
    }
}

const quickHealCharacter = () => {
    if (quickHeal.value > 0) {
        gameStore.heal(quickHeal.value)
        quickHeal.value = 0
    }
}

const restLong = () => {
    gameStore.character.currentHp = gameStore.character.maxHp
    gameStore.resetFury()
    gameStore.character.isFuryActive = false
}

const restShort = () => {
    // En un descanso corto, puedes recuperar algo de vida y furia
    const heal = Math.floor(gameStore.character.maxHp * 0.25) // 25% de vida
    gameStore.heal(heal)
    gameStore.addFury()
}

const formatResistance = (resistance) => {
    const translations = {
        'bludgeoning': 'Contundente',
        'piercing': 'Perforante',
        'slashing': 'Cortante'
    }
    return translations[resistance] || resistance
}
</script>

<style scoped>
.combat-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.character-image {
    border: 3px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.card {
    border-radius: 15px;
    overflow: hidden;
}

.progress {
    border-radius: 12px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.btn {
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.alert {
    border-radius: 10px;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.input-group .form-control {
    border-radius: 8px 0 0 8px;
}

.input-group .btn {
    border-radius: 0 8px 8px 0;
}
</style>