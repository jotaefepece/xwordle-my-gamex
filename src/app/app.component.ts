import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DICCIONARIO_ES } from './data/diccionario';

interface Resultado {
  palabra: string;
  tiempo: number;
  acertada: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly FILAS = 6;
  readonly COLUMNAS = 5;
  readonly MAX_PALABRAS = 29;
  readonly DEFAULT_PALABRAS = 10;

  // Sesión
  palabrasSesion: string[] = [];
  indicePalabra = 0;
  palabraSecreta = '';

  // Juego
  tablero: string[][] = [];
  colores: string[][] = [];
  intentoActual = 0;
  entradaActual = '';
  juegoTerminado = false;

  // Tiempo y resultados
  inicioTiempo = 0;
  inicioSesionTiempo = 0;
  ranking: Resultado[] = [];
  tiempoTotal = 0;
  palabrasDescubiertas = 0;

  // UI
  mensaje = '';
  mostrarManual = false;
  mostrarEditor = false;
  nuevoTextoPalabras = '';

  constructor() {
    this.iniciarSesionPorDefecto();
  }

  // ===== SESIÓN POR DEFECTO =====
  iniciarSesionPorDefecto() {
    const copia = [...DICCIONARIO_ES].sort(() => Math.random() - 0.5);
    this.palabrasSesion = copia.slice(0, this.DEFAULT_PALABRAS);
    this.iniciarSesion();
  }

  iniciarSesion() {
    this.indicePalabra = 0;
    this.ranking = [];
    this.juegoTerminado = false;
    this.inicioSesionTiempo = Date.now();
    this.tiempoTotal = 0;
    this.palabrasDescubiertas = 0;
    this.cargarPalabra();
  }

  cargarPalabra() {
    this.palabraSecreta = this.palabrasSesion[this.indicePalabra];
    this.inicioTiempo = Date.now();
    this.reiniciarTablero();
  }

  reiniciarTablero() {
    this.tablero = Array.from({ length: this.FILAS }, () =>
      Array(this.COLUMNAS).fill('')
    );
    this.colores = Array.from({ length: this.FILAS }, () =>
      Array(this.COLUMNAS).fill('')
    );
    this.intentoActual = 0;
    this.entradaActual = '';
    this.mensaje = '';
  }

  // ===== INPUT JUEGO =====
  actualizarEntrada(valor: string) {
    valor = valor.toLowerCase().replace(/[^a-zñ]/g, '').slice(0, 5);
    this.entradaActual = valor;
    for (let i = 0; i < this.COLUMNAS; i++) {
      this.tablero[this.intentoActual][i] = valor[i] || '';
    }
  }

  validarFila() {
    const secretoContador: { [key: string]: number } = {};
    for (const letra of this.palabraSecreta) {
      secretoContador[letra] = (secretoContador[letra] || 0) + 1;
    }

    const coloresTemp: string[] = Array(this.COLUMNAS).fill('ausente');

    // marcar correctos
    for (let i = 0; i < this.COLUMNAS; i++) {
      if (this.entradaActual[i] === this.palabraSecreta[i]) {
        coloresTemp[i] = 'correcto';
        secretoContador[this.entradaActual[i]]--;
      }
    }

    // marcar presentes
    for (let i = 0; i < this.COLUMNAS; i++) {
      if (coloresTemp[i] !== 'correcto') {
        const letra = this.entradaActual[i];
        if (secretoContador[letra] > 0) {
          coloresTemp[i] = 'presente';
          secretoContador[letra]--;
        }
      }
    }

    this.colores[this.intentoActual] = coloresTemp;

    if (this.entradaActual === this.palabraSecreta) {
      this.finalizarPalabra(true);
      return;
    }

    this.intentoActual++;
    this.entradaActual = '';
    if (this.intentoActual === this.FILAS) {
      this.finalizarPalabra(false);
    }
  }

  finalizarPalabra(acertada: boolean) {
    const tiempo = Math.floor((Date.now() - this.inicioTiempo) / 1000);
    this.ranking.push({
      palabra: this.palabraSecreta,
      tiempo,
      acertada
    });
    this.tiempoTotal += tiempo;
    if (acertada) {
      this.palabrasDescubiertas++;
    }
    this.indicePalabra++;
    if (this.indicePalabra < this.palabrasSesion.length) {
      this.cargarPalabra();
    } else {
		this.indicePalabra--;
      this.juegoTerminado = true;
      this.mensaje = '🍏 🍏 🍏 Sesión finalizada 🍏 🍏 🍏 ️';
    }
  }

  // ===== EDITOR =====
  actualizarTextoPalabras(valor: string) {
    this.nuevoTextoPalabras = valor;
  }

  aplicarPalabras() {
    const nuevas = this.nuevoTextoPalabras
      .toLowerCase()
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length === this.COLUMNAS);
    if (nuevas.length === 0) {
      this.mensaje = '*** Se debe ingresar al menos una palabra válida ***';
      return;
    }
    this.palabrasSesion = nuevas.slice(0, this.MAX_PALABRAS);
    this.nuevoTextoPalabras = '';
    this.mostrarEditor = false;
    this.iniciarSesion();
  }
}
