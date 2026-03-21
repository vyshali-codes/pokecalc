/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, Minus, Plus, X, Divide, Equal, Beaker, Swords, History as HistoryIcon, Trash2, Percent } from 'lucide-react';

interface Spark {
  id: number;
  x: number;
  y: number;
  isBurst?: boolean;
}

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  timestamp: string;
}

type BattleStatus = 'idle' | 'success' | 'error';

interface PokemonSprite {
  name: string;
  id: number;
  type: string[];
  total?: number;
  hp?: number;
  attack?: number;
  defense?: number;
  spAtk?: number;
  spDef?: number;
  speed?: number;
}

const POKEMON_SPRITES: PokemonSprite[] = [
  { name: 'Bulbasaur', id: 1, type: ['grass', 'poison'], total: 318, hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
  { name: 'Ivysaur', id: 2, type: ['grass', 'poison'], total: 405, hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60 },
  { name: 'Venusaur', id: 3, type: ['grass', 'poison'], total: 525, hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 },
  { name: 'Charmander', id: 4, type: ['fire'], total: 309, hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
  { name: 'Charmeleon', id: 5, type: ['fire'], total: 405, hp: 58, attack: 64, defense: 58, spAtk: 80, spDef: 65, speed: 80 },
  { name: 'Charizard', id: 6, type: ['fire', 'flying'], total: 534, hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
  { name: 'Squirtle', id: 7, type: ['water'], total: 314, hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
  { name: 'Wartortle', id: 8, type: ['water'], total: 405, hp: 59, attack: 63, defense: 80, spAtk: 65, spDef: 80, speed: 58 },
  { name: 'Blastoise', id: 9, type: ['water'], total: 530, hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 },
  { name: 'Caterpie', id: 10, type: ['bug'], total: 195, hp: 45, attack: 30, defense: 35, spAtk: 20, spDef: 20, speed: 45 },
  { name: 'Metapod', id: 11, type: ['bug'], total: 205, hp: 50, attack: 20, defense: 55, spAtk: 25, spDef: 25, speed: 30 },
  { name: 'Butterfree', id: 12, type: ['bug', 'flying'], total: 395, hp: 60, attack: 45, defense: 50, spAtk: 90, spDef: 80, speed: 70 },
  { name: 'Weedle', id: 13, type: ['bug', 'poison'], total: 195, hp: 40, attack: 35, defense: 30, spAtk: 20, spDef: 20, speed: 50 },
  { name: 'Kakuna', id: 14, type: ['bug', 'poison'], total: 205, hp: 45, attack: 25, defense: 50, spAtk: 25, spDef: 25, speed: 35 },
  { name: 'Beedrill', id: 15, type: ['bug', 'poison'], total: 395, hp: 65, attack: 90, defense: 40, spAtk: 45, spDef: 80, speed: 75 },
  { name: 'Pidgey', id: 16, type: ['normal', 'flying'], total: 251, hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 },
  { name: 'Pidgeotto', id: 17, type: ['normal', 'flying'], total: 349, hp: 63, attack: 60, defense: 55, spAtk: 50, spDef: 50, speed: 71 },
  { name: 'Pidgeot', id: 18, type: ['normal', 'flying'], total: 479, hp: 83, attack: 80, defense: 75, spAtk: 70, spDef: 70, speed: 101 },
  { name: 'Rattata', id: 19, type: ['normal'], total: 253, hp: 30, attack: 56, defense: 35, spAtk: 25, spDef: 35, speed: 72 },
  { name: 'Raticate', id: 20, type: ['normal'], total: 413, hp: 55, attack: 81, defense: 60, spAtk: 50, spDef: 70, speed: 97 },
  { name: 'Spearow', id: 21, type: ['normal', 'flying'], total: 262, hp: 40, attack: 60, defense: 30, spAtk: 31, spDef: 31, speed: 70 },
  { name: 'Fearow', id: 22, type: ['normal', 'flying'], total: 442, hp: 65, attack: 90, defense: 65, spAtk: 61, spDef: 61, speed: 100 },
  { name: 'Ekans', id: 23, type: ['poison'], total: 288, hp: 35, attack: 60, defense: 44, spAtk: 40, spDef: 54, speed: 55 },
  { name: 'Arbok', id: 24, type: ['poison'], total: 448, hp: 60, attack: 95, defense: 69, spAtk: 65, spDef: 79, speed: 80 },
  { name: 'Pikachu', id: 25, type: ['electric'], total: 320, hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
  { name: 'Raichu', id: 26, type: ['electric'], total: 485, hp: 60, attack: 90, defense: 55, spAtk: 90, spDef: 80, speed: 110 },
  { name: 'Sandshrew', id: 27, type: ['ground'], total: 300, hp: 50, attack: 75, defense: 85, spAtk: 20, spDef: 30, speed: 40 },
  { name: 'Sandslash', id: 28, type: ['ground'], total: 450, hp: 75, attack: 100, defense: 110, spAtk: 45, spDef: 55, speed: 65 },
  { name: 'Nidoran♀', id: 29, type: ['poison'], total: 273, hp: 55, attack: 47, defense: 52, spAtk: 40, spDef: 40, speed: 41 },
  { name: 'Nidorina', id: 30, type: ['poison'], total: 365, hp: 70, attack: 62, defense: 67, spAtk: 55, spDef: 55, speed: 56 },
  { name: 'Nidoqueen', id: 31, type: ['poison', 'ground'], total: 505, hp: 90, attack: 92, defense: 87, spAtk: 75, spDef: 85, speed: 76 },
  { name: 'Nidoran♂', id: 32, type: ['poison'], total: 273, hp: 46, attack: 57, defense: 40, spAtk: 40, spDef: 40, speed: 50 },
  { name: 'Nidorino', id: 33, type: ['poison'], total: 365, hp: 61, attack: 72, defense: 57, spAtk: 55, spDef: 55, speed: 65 },
  { name: 'Nidoking', id: 34, type: ['poison', 'ground'], total: 505, hp: 81, attack: 102, defense: 77, spAtk: 85, spDef: 75, speed: 85 },
  { name: 'Clefairy', id: 35, type: ['fairy'], total: 323, hp: 70, attack: 45, defense: 48, spAtk: 60, spDef: 65, speed: 35 },
  { name: 'Clefable', id: 36, type: ['fairy'], total: 483, hp: 95, attack: 70, defense: 73, spAtk: 95, spDef: 90, speed: 60 },
  { name: 'Vulpix', id: 37, type: ['fire'], total: 299, hp: 38, attack: 41, defense: 40, spAtk: 50, spDef: 65, speed: 65 },
  { name: 'Ninetales', id: 38, type: ['fire'], total: 505, hp: 73, attack: 76, defense: 75, spAtk: 81, spDef: 100, speed: 100 },
  { name: 'Jigglypuff', id: 39, type: ['normal', 'fairy'], total: 270, hp: 115, attack: 45, defense: 20, spAtk: 45, spDef: 25, speed: 20 },
  { name: 'Wigglytuff', id: 40, type: ['normal', 'fairy'], total: 435, hp: 140, attack: 70, defense: 45, spAtk: 85, spDef: 50, speed: 45 },
  { name: 'Zubat', id: 41, type: ['poison', 'flying'], total: 245, hp: 40, attack: 45, defense: 35, spAtk: 30, spDef: 40, speed: 55 },
  { name: 'Golbat', id: 42, type: ['poison', 'flying'], total: 455, hp: 75, attack: 80, defense: 70, spAtk: 65, spDef: 75, speed: 90 },
  { name: 'Oddish', id: 43, type: ['grass', 'poison'], total: 320, hp: 45, attack: 50, defense: 55, spAtk: 75, spDef: 65, speed: 30 },
  { name: 'Gloom', id: 44, type: ['grass', 'poison'], total: 395, hp: 60, attack: 65, defense: 70, spAtk: 85, spDef: 75, speed: 40 },
  { name: 'Vileplume', id: 45, type: ['grass', 'poison'], total: 490, hp: 75, attack: 80, defense: 85, spAtk: 110, spDef: 90, speed: 50 },
  { name: 'Paras', id: 46, type: ['bug', 'grass'], total: 285, hp: 35, attack: 70, defense: 55, spAtk: 45, spDef: 55, speed: 25 },
  { name: 'Parasect', id: 47, type: ['bug', 'grass'], total: 405, hp: 60, attack: 95, defense: 80, spAtk: 60, spDef: 80, speed: 30 },
  { name: 'Venonat', id: 48, type: ['bug', 'poison'], total: 305, hp: 60, attack: 55, defense: 50, spAtk: 40, spDef: 55, speed: 45 },
  { name: 'Venomoth', id: 49, type: ['bug', 'poison'], total: 450, hp: 70, attack: 65, defense: 60, spAtk: 90, spDef: 75, speed: 90 },
  { name: 'Diglett', id: 50, type: ['ground'], total: 265, hp: 10, attack: 55, defense: 25, spAtk: 35, spDef: 45, speed: 95 },
  { name: 'Dugtrio', id: 51, type: ['ground'], total: 425, hp: 35, attack: 100, defense: 50, spAtk: 50, spDef: 70, speed: 120 },
  { name: 'Meowth', id: 52, type: ['normal'], total: 290, hp: 40, attack: 45, defense: 35, spAtk: 40, spDef: 40, speed: 90 },
  { name: 'Persian', id: 53, type: ['normal'], total: 440, hp: 65, attack: 70, defense: 60, spAtk: 65, spDef: 65, speed: 115 },
  { name: 'Psyduck', id: 54, type: ['water'], total: 320, hp: 50, attack: 52, defense: 48, spAtk: 65, spDef: 50, speed: 55 },
  { name: 'Golduck', id: 55, type: ['water'], total: 500, hp: 80, attack: 82, defense: 78, spAtk: 95, spDef: 80, speed: 85 },
  { name: 'Mankey', id: 56, type: ['fighting'], total: 305, hp: 40, attack: 80, defense: 35, spAtk: 35, spDef: 45, speed: 70 },
  { name: 'Primeape', id: 57, type: ['fighting'], total: 455, hp: 65, attack: 105, defense: 60, spAtk: 60, spDef: 70, speed: 95 },
  { name: 'Growlithe', id: 58, type: ['fire'], total: 350, hp: 55, attack: 70, defense: 45, spAtk: 70, spDef: 50, speed: 60 },
  { name: 'Arcanine', id: 59, type: ['fire'], total: 555, hp: 90, attack: 110, defense: 80, spAtk: 100, spDef: 80, speed: 95 },
  { name: 'Poliwag', id: 60, type: ['water'], total: 300, hp: 40, attack: 50, defense: 40, spAtk: 40, spDef: 40, speed: 90 },
  { name: 'Poliwhirl', id: 61, type: ['water'], total: 385, hp: 65, attack: 65, defense: 65, spAtk: 50, spDef: 50, speed: 90 },
  { name: 'Poliwrath', id: 62, type: ['water', 'fighting'], total: 510, hp: 90, attack: 95, defense: 95, spAtk: 70, spDef: 90, speed: 70 },
  { name: 'Abra', id: 63, type: ['psychic'], total: 310, hp: 25, attack: 20, defense: 15, spAtk: 105, spDef: 55, speed: 90 },
  { name: 'Kadabra', id: 64, type: ['psychic'], total: 400, hp: 40, attack: 35, defense: 30, spAtk: 120, spDef: 70, speed: 105 },
  { name: 'Alakazam', id: 65, type: ['psychic'], total: 500, hp: 55, attack: 50, defense: 45, spAtk: 135, spDef: 95, speed: 120 },
  { name: 'Machop', id: 66, type: ['fighting'], total: 305, hp: 70, attack: 80, defense: 50, spAtk: 35, spDef: 35, speed: 35 },
  { name: 'Machoke', id: 67, type: ['fighting'], total: 405, hp: 80, attack: 100, defense: 70, spAtk: 50, spDef: 60, speed: 45 },
  { name: 'Machamp', id: 68, type: ['fighting'], total: 505, hp: 90, attack: 130, defense: 80, spAtk: 65, spDef: 85, speed: 55 },
  { name: 'Bellsprout', id: 69, type: ['grass', 'poison'], total: 300, hp: 50, attack: 75, defense: 35, spAtk: 70, spDef: 30, speed: 40 },
  { name: 'Weepinbell', id: 70, type: ['grass', 'poison'], total: 390, hp: 65, attack: 90, defense: 50, spAtk: 85, spDef: 45, speed: 55 },
  { name: 'Victreebel', id: 71, type: ['grass', 'poison'], total: 490, hp: 80, attack: 105, defense: 65, spAtk: 100, spDef: 70, speed: 70 },
  { name: 'Tentacool', id: 72, type: ['water', 'poison'], total: 335, hp: 40, attack: 40, defense: 35, spAtk: 50, spDef: 100, speed: 70 },
  { name: 'Tentacruel', id: 73, type: ['water', 'poison'], total: 515, hp: 80, attack: 70, defense: 65, spAtk: 80, spDef: 120, speed: 100 },
  { name: 'Geodude', id: 74, type: ['rock', 'ground'], total: 300, hp: 40, attack: 80, defense: 100, spAtk: 30, spDef: 30, speed: 20 },
  { name: 'Graveler', id: 75, type: ['rock', 'ground'], total: 390, hp: 55, attack: 95, defense: 115, spAtk: 45, spDef: 45, speed: 35 },
  { name: 'Golem', id: 76, type: ['rock', 'ground'], total: 495, hp: 80, attack: 120, defense: 130, spAtk: 55, spDef: 65, speed: 45 },
  { name: 'Ponyta', id: 77, type: ['fire'], total: 410, hp: 50, attack: 85, defense: 55, spAtk: 65, spDef: 65, speed: 90 },
  { name: 'Rapidash', id: 78, type: ['fire'], total: 500, hp: 65, attack: 100, defense: 70, spAtk: 80, spDef: 80, speed: 105 },
  { name: 'Slowpoke', id: 79, type: ['water', 'psychic'], total: 315, hp: 90, attack: 65, defense: 65, spAtk: 40, spDef: 40, speed: 15 },
  { name: 'Slowbro', id: 80, type: ['water', 'psychic'], total: 490, hp: 95, attack: 75, defense: 110, spAtk: 100, spDef: 80, speed: 30 },
  { name: 'Magnemite', id: 81, type: ['electric', 'steel'], total: 325, hp: 25, attack: 35, defense: 70, spAtk: 95, spDef: 55, speed: 45 },
  { name: 'Magneton', id: 82, type: ['electric', 'steel'], total: 465, hp: 50, attack: 60, defense: 95, spAtk: 120, spDef: 70, speed: 70 },
  { name: 'Farfetch\'d', id: 83, type: ['normal', 'flying'], total: 377, hp: 52, attack: 90, defense: 55, spAtk: 58, spDef: 62, speed: 60 },
  { name: 'Doduo', id: 84, type: ['normal', 'flying'], total: 310, hp: 35, attack: 85, defense: 45, spAtk: 35, spDef: 35, speed: 75 },
  { name: 'Dodrio', id: 85, type: ['normal', 'flying'], total: 470, hp: 60, attack: 110, defense: 70, spAtk: 60, spDef: 60, speed: 110 },
  { name: 'Seel', id: 86, type: ['water'], total: 325, hp: 65, attack: 45, defense: 55, spAtk: 45, spDef: 70, speed: 45 },
  { name: 'Dewgong', id: 87, type: ['water', 'ice'], total: 475, hp: 90, attack: 70, defense: 80, spAtk: 70, spDef: 95, speed: 70 },
  { name: 'Grimer', id: 88, type: ['poison'], total: 325, hp: 80, attack: 80, defense: 50, spAtk: 40, spDef: 50, speed: 25 },
  { name: 'Muk', id: 89, type: ['poison'], total: 500, hp: 105, attack: 105, defense: 75, spAtk: 65, spDef: 100, speed: 50 },
  { name: 'Shellder', id: 90, type: ['water'], total: 305, hp: 30, attack: 65, defense: 100, spAtk: 45, spDef: 25, speed: 40 },
  { name: 'Cloyster', id: 91, type: ['water', 'ice'], total: 525, hp: 50, attack: 95, defense: 180, spAtk: 85, spDef: 45, speed: 70 },
  { name: 'Gastly', id: 92, type: ['ghost', 'poison'], total: 310, hp: 30, attack: 35, defense: 30, spAtk: 100, spDef: 35, speed: 80 },
  { name: 'Haunter', id: 93, type: ['ghost', 'poison'], total: 405, hp: 45, attack: 50, defense: 45, spAtk: 115, spDef: 55, speed: 95 },
  { name: 'Gengar', id: 94, type: ['ghost', 'poison'], total: 500, hp: 60, attack: 65, defense: 60, spAtk: 130, spDef: 75, speed: 110 },
  { name: 'Onix', id: 95, type: ['rock', 'ground'], total: 385, hp: 35, attack: 45, defense: 160, spAtk: 30, spDef: 45, speed: 70 },
  { name: 'Drowzee', id: 96, type: ['psychic'], total: 328, hp: 60, attack: 48, defense: 45, spAtk: 43, spDef: 90, speed: 42 },
  { name: 'Hypno', id: 97, type: ['psychic'], total: 483, hp: 85, attack: 73, defense: 70, spAtk: 73, spDef: 115, speed: 67 },
  { name: 'Krabby', id: 98, type: ['water'], total: 325, hp: 30, attack: 105, defense: 90, spAtk: 25, spDef: 25, speed: 50 },
  { name: 'Kingler', id: 99, type: ['water'], total: 475, hp: 55, attack: 130, defense: 115, spAtk: 50, spDef: 50, speed: 75 },
  { name: 'Voltorb', id: 100, type: ['electric'], total: 330, hp: 40, attack: 30, defense: 50, spAtk: 55, spDef: 55, speed: 100 },
  { name: 'Electrode', id: 101, type: ['electric'], total: 490, hp: 60, attack: 50, defense: 70, spAtk: 80, spDef: 80, speed: 150 },
  { name: 'Exeggcute', id: 102, type: ['grass', 'psychic'], total: 325, hp: 60, attack: 40, defense: 80, spAtk: 60, spDef: 45, speed: 40 },
  { name: 'Exeggutor', id: 103, type: ['grass', 'psychic'], total: 530, hp: 95, attack: 95, defense: 85, spAtk: 125, spDef: 75, speed: 55 },
  { name: 'Cubone', id: 104, type: ['ground'], total: 320, hp: 50, attack: 50, defense: 95, spAtk: 40, spDef: 50, speed: 35 },
  { name: 'Marowak', id: 105, type: ['ground'], total: 425, hp: 60, attack: 80, defense: 110, spAtk: 50, spDef: 80, speed: 45 },
  { name: 'Hitmonlee', id: 106, type: ['fighting'], total: 455, hp: 50, attack: 120, defense: 53, spAtk: 35, spDef: 110, speed: 87 },
  { name: 'Hitmonchan', id: 107, type: ['fighting'], total: 455, hp: 50, attack: 105, defense: 79, spAtk: 35, spDef: 110, speed: 76 },
  { name: 'Lickitung', id: 108, type: ['normal'], total: 385, hp: 90, attack: 55, defense: 75, spAtk: 60, spDef: 75, speed: 30 },
  { name: 'Koffing', id: 109, type: ['poison'], total: 340, hp: 40, attack: 65, defense: 95, spAtk: 60, spDef: 45, speed: 35 },
  { name: 'Weezing', id: 110, type: ['poison'], total: 490, hp: 65, attack: 90, defense: 120, spAtk: 85, spDef: 70, speed: 60 },
  { name: 'Rhyhorn', id: 111, type: ['ground', 'rock'], total: 345, hp: 80, attack: 85, defense: 95, spAtk: 30, spDef: 30, speed: 25 },
  { name: 'Rhydon', id: 112, type: ['ground', 'rock'], total: 485, hp: 105, attack: 130, defense: 120, spAtk: 45, spDef: 45, speed: 40 },
  { name: 'Chansey', id: 113, type: ['normal'], total: 450, hp: 250, attack: 5, defense: 5, spAtk: 35, spDef: 105, speed: 50 },
  { name: 'Tangela', id: 114, type: ['grass'], total: 435, hp: 65, attack: 55, defense: 115, spAtk: 100, spDef: 40, speed: 60 },
  { name: 'Kangaskhan', id: 115, type: ['normal'], total: 490, hp: 105, attack: 95, defense: 80, spAtk: 40, spDef: 80, speed: 90 },
  { name: 'Horsea', id: 116, type: ['water'], total: 295, hp: 30, attack: 40, defense: 70, spAtk: 70, spDef: 25, speed: 60 },
  { name: 'Seadra', id: 117, type: ['water'], total: 440, hp: 55, attack: 65, defense: 95, spAtk: 95, spDef: 45, speed: 85 },
  { name: 'Goldeen', id: 118, type: ['water'], total: 320, hp: 45, attack: 67, defense: 60, spAtk: 35, spDef: 50, speed: 63 },
  { name: 'Seaking', id: 119, type: ['water'], total: 450, hp: 80, attack: 92, defense: 65, spAtk: 65, spDef: 80, speed: 68 },
  { name: 'Staryu', id: 120, type: ['water'], total: 340, hp: 30, attack: 45, defense: 55, spAtk: 70, spDef: 55, speed: 85 },
  { name: 'Starmie', id: 121, type: ['water', 'psychic'], total: 520, hp: 60, attack: 75, defense: 85, spAtk: 100, spDef: 85, speed: 115 },
  { name: 'Mr. Mime', id: 122, type: ['psychic', 'fairy'], total: 460, hp: 40, attack: 45, defense: 65, spAtk: 100, spDef: 120, speed: 90 },
  { name: 'Scyther', id: 123, type: ['bug', 'flying'], total: 500, hp: 70, attack: 110, defense: 80, spAtk: 55, spDef: 80, speed: 105 },
  { name: 'Jynx', id: 124, type: ['ice', 'psychic'], total: 455, hp: 65, attack: 50, defense: 35, spAtk: 115, spDef: 95, speed: 95 },
  { name: 'Electabuzz', id: 125, type: ['electric'], total: 490, hp: 65, attack: 83, defense: 57, spAtk: 95, spDef: 85, speed: 105 },
  { name: 'Magmar', id: 126, type: ['fire'], total: 495, hp: 65, attack: 95, defense: 57, spAtk: 100, spDef: 85, speed: 93 },
  { name: 'Pinsir', id: 127, type: ['bug'], total: 500, hp: 65, attack: 125, defense: 100, spAtk: 55, spDef: 70, speed: 85 },
  { name: 'Tauros', id: 128, type: ['normal'], total: 490, hp: 75, attack: 100, defense: 95, spAtk: 40, spDef: 70, speed: 110 },
  { name: 'Magikarp', id: 129, type: ['water'], total: 200, hp: 20, attack: 10, defense: 55, spAtk: 15, spDef: 20, speed: 80 },
  { name: 'Gyarados', id: 130, type: ['water', 'flying'], total: 540, hp: 95, attack: 125, defense: 79, spAtk: 60, spDef: 100, speed: 81 },
  { name: 'Lapras', id: 131, type: ['water', 'ice'], total: 535, hp: 130, attack: 85, defense: 80, spAtk: 85, spDef: 95, speed: 60 },
  { name: 'Ditto', id: 132, type: ['normal'], total: 288, hp: 48, attack: 48, defense: 48, spAtk: 48, spDef: 48, speed: 48 },
  { name: 'Eevee', id: 133, type: ['normal'], total: 325, hp: 55, attack: 55, defense: 50, spAtk: 45, spDef: 65, speed: 55 },
  { name: 'Vaporeon', id: 134, type: ['water'], total: 525, hp: 130, attack: 65, defense: 60, spAtk: 110, spDef: 95, speed: 65 },
  { name: 'Jolteon', id: 135, type: ['electric'], total: 525, hp: 65, attack: 65, defense: 60, spAtk: 110, spDef: 95, speed: 130 },
  { name: 'Flareon', id: 136, type: ['fire'], total: 525, hp: 65, attack: 130, defense: 60, spAtk: 95, spDef: 110, speed: 65 },
  { name: 'Porygon', id: 137, type: ['normal'], total: 395, hp: 65, attack: 60, defense: 70, spAtk: 85, spDef: 75, speed: 40 },
  { name: 'Omanyte', id: 138, type: ['rock', 'water'], total: 355, hp: 35, attack: 40, defense: 100, spAtk: 90, spDef: 55, speed: 35 },
  { name: 'Omastar', id: 139, type: ['rock', 'water'], total: 495, hp: 70, attack: 60, defense: 125, spAtk: 115, spDef: 70, speed: 55 },
  { name: 'Kabuto', id: 140, type: ['rock', 'water'], total: 355, hp: 30, attack: 80, defense: 90, spAtk: 55, spDef: 45, speed: 55 },
  { name: 'Kabutops', id: 141, type: ['rock', 'water'], total: 495, hp: 60, attack: 115, defense: 105, spAtk: 65, spDef: 70, speed: 80 },
  { name: 'Aerodactyl', id: 142, type: ['rock', 'flying'], total: 515, hp: 80, attack: 105, defense: 65, spAtk: 60, spDef: 75, speed: 130 },
  { name: 'Snorlax', id: 143, type: ['normal'], total: 540, hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 },
  { name: 'Articuno', id: 144, type: ['ice', 'flying'], total: 580, hp: 90, attack: 85, defense: 100, spAtk: 95, spDef: 125, speed: 85 },
  { name: 'Zapdos', id: 145, type: ['electric', 'flying'], total: 580, hp: 90, attack: 90, defense: 85, spAtk: 125, spDef: 90, speed: 100 },
  { name: 'Moltres', id: 146, type: ['fire', 'flying'], total: 580, hp: 90, attack: 100, defense: 90, spAtk: 125, spDef: 85, speed: 90 },
  { name: 'Dratini', id: 147, type: ['dragon'], total: 300, hp: 41, attack: 64, defense: 45, spAtk: 50, spDef: 50, speed: 50 },
  { name: 'Dragonair', id: 148, type: ['dragon'], total: 420, hp: 61, attack: 84, defense: 65, spAtk: 70, spDef: 70, speed: 70 },
  { name: 'Dragonite', id: 149, type: ['dragon', 'flying'], total: 600, hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80 },
  { name: 'Mewtwo', id: 150, type: ['psychic'], total: 680, hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 },
  { name: 'Mew', id: 151, type: ['psychic'], total: 600, hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 }
];

const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 }
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [memory, setMemory] = useState<number>(0);
  const [isScientific, setIsScientific] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'pokedex'>('log');
  const [pokedexSearch, setPokedexSearch] = useState('');
  const [pokedexType, setPokedexType] = useState('All');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Handle window resize for responsive logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const showScientific = isScientific || isDesktop;
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [battleStatus, setBattleStatus] = useState<BattleStatus>('idle');
  const [battleSprites, setBattleSprites] = useState({ attacker: POKEMON_SPRITES[0], defender: POKEMON_SPRITES[1] });
  const [battleEffectiveness, setBattleEffectiveness] = useState<number>(1);
  const [battleMoveType, setBattleMoveType] = useState<'physical' | 'special' | 'status'>('physical');
  const [screenPulse, setScreenPulse] = useState(false);

  // Trigger screen pulse on display change
  useEffect(() => {
    if (display !== '0') {
      triggerScreenPulse();
    }
  }, [display]);

  const audioCtx = useRef<AudioContext | null>(null);

  const playClickSound = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const triggerScreenPulse = () => {
    setScreenPulse(true);
    setTimeout(() => setScreenPulse(false), 200);
  };

  const addSpark = useCallback((x: number, y: number, isBurst = false) => {
    const id = Date.now() + Math.random();
    if (isBurst) {
      const burstSparks = Array.from({ length: 12 }).map((_, i) => ({
        id: id + i,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        isBurst: true
      }));
      setSparks(prev => [...prev, ...burstSparks]);
      setTimeout(() => {
        setSparks(prev => prev.filter(s => !burstSparks.find(bs => bs.id === s.id)));
      }, 500);
    } else {
      setSparks(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setSparks(prev => prev.filter(s => s.id !== id));
      }, 500);
    }
  }, []);

  const addToHistory = (expression: string, result: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => [{ id: Date.now(), expression, result, timestamp }, ...prev].slice(0, 20));
  };

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      const newValue = performCalculation(currentValue, inputValue, operator);
      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '*': return prev * current;
      case '/': 
        if (current === 0) return NaN;
        return prev / current;
      case '^': return Math.pow(prev, current);
      default: return current;
    }
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      const result = performCalculation(prevValue, inputValue, operator);
      const expression = `${prevValue} ${operator} ${inputValue}`;
      
      if (isNaN(result)) {
        setDisplay("That move failed! ⚡");
        setBattleStatus('error');
        setBattleSprites({ attacker: POKEMON_SPRITES[24], defender: POKEMON_SPRITES[0] }); // Pikachu vs Bulbasaur
      } else {
        const resultStr = String(Number(result.toFixed(8)));
        setDisplay(resultStr);
        setBattleStatus('success');
        
        // Pick an attacker
        const attacker = POKEMON_SPRITES[Math.floor(Math.random() * POKEMON_SPRITES.length)];
        
        // Pick a defender
        const potentialDefenders = POKEMON_SPRITES.filter(p => p.id !== attacker.id);
        const defender = potentialDefenders[Math.floor(Math.random() * potentialDefenders.length)];
        
        const effectiveness = TYPE_EFFECTIVENESS[attacker.type[0]]?.[defender.type[0]] ?? 1;
        
        // Determine move type based on operator
        const moveType: 'physical' | 'special' | 'status' = 
          operator === '+' || operator === '-' ? 'physical' :
          operator === '*' || operator === '/' ? 'special' : 'status';

        setBattleMoveType(moveType);
        setBattleSprites({ attacker, defender });
        setBattleEffectiveness(effectiveness);
        addToHistory(expression, resultStr);
      }
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      setTimeout(() => setBattleStatus('idle'), 3000);
    }
  };

  const handleScientific = (op: string) => {
    const inputValue = parseFloat(display);
    let result = 0;
    let expression = `${op}(${inputValue})`;

    switch (op) {
      case 'sin': result = Math.sin(inputValue); break;
      case 'cos': result = Math.cos(inputValue); break;
      case 'tan': result = Math.tan(inputValue); break;
      case 'ln': 
        if (inputValue <= 0) {
          setDisplay("Invalid Move! ⚡");
          setBattleStatus('error');
          setTimeout(() => setBattleStatus('idle'), 2000);
          return;
        }
        result = Math.log(inputValue); 
        break;
      case 'log10': 
        if (inputValue <= 0) {
          setDisplay("Invalid Move! ⚡");
          setBattleStatus('error');
          setTimeout(() => setBattleStatus('idle'), 2000);
          return;
        }
        result = Math.log10(inputValue); 
        break;
      case 'sqrt': 
        if (inputValue < 0) {
          setDisplay("Invalid Move! ⚡");
          setBattleStatus('error');
          setTimeout(() => setBattleStatus('idle'), 2000);
          return;
        }
        result = Math.sqrt(inputValue); 
        break;
      case 'fact':
        if (inputValue < 0 || !Number.isInteger(inputValue)) {
          setDisplay("Invalid Move! ⚡");
          setBattleStatus('error');
          setTimeout(() => setBattleStatus('idle'), 2000);
          return;
        }
        result = factorial(inputValue);
        expression = `${inputValue}!`;
        break;
      case 'pi':
        setDisplay(String(Math.PI));
        setWaitingForOperand(false);
        return;
      case 'e':
        setDisplay(String(Math.E));
        setWaitingForOperand(false);
        return;
      case 'phi':
        setDisplay(String((1 + Math.sqrt(5)) / 2));
        setWaitingForOperand(false);
        return;
      case 'percent':
        if (prevValue !== null) {
          result = (prevValue * inputValue) / 100;
          expression = `${prevValue} × ${inputValue}%`;
        } else {
          result = inputValue / 100;
          expression = `${inputValue}%`;
        }
        break;
      // Unit Conversions
      case 'c2f':
        result = (inputValue * 9/5) + 32;
        expression = `${inputValue}°C to °F`;
        break;
      case 'm2ft':
        result = inputValue * 3.28084;
        expression = `${inputValue}m to ft`;
        break;
      case 'kg2lb':
        result = inputValue * 2.20462;
        expression = `${inputValue}kg to lb`;
        break;
    }
    const resultStr = String(Number(result.toFixed(8)));
    setDisplay(resultStr);
    setWaitingForOperand(true);
    setBattleStatus('success');
    
    const attacker = POKEMON_SPRITES[Math.floor(Math.random() * POKEMON_SPRITES.length)];
    const defender = POKEMON_SPRITES[Math.floor(Math.random() * POKEMON_SPRITES.length)];
    const effectiveness = TYPE_EFFECTIVENESS[attacker.type[0]]?.[defender.type[0]] ?? 1;

    setBattleMoveType('special');
    setBattleSprites({ attacker, defender });
    setBattleEffectiveness(effectiveness);
    addToHistory(expression, resultStr);
    setTimeout(() => setBattleStatus('idle'), 2000);
  };

  const handleMemory = (op: string) => {
    const inputValue = parseFloat(display);
    switch (op) {
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(String(memory)); setWaitingForOperand(true); break;
      case 'M+': setMemory(prev => prev + inputValue); break;
      case 'M-': setMemory(prev => prev - inputValue); break;
    }
    triggerScreenPulse();
  };

  const factorial = (n: number): number => {
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setBattleStatus('idle');
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const onButtonClick = (e: React.MouseEvent, action: () => void, isEqual = false) => {
    playClickSound();
    addSpark(e.clientX, e.clientY, isEqual);
    triggerScreenPulse();
    action();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-poke-white overflow-y-auto">
      {/* Spark Layer */}
      <AnimatePresence>
        {sparks.map(spark => (
          <motion.div
            key={spark.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: spark.isBurst ? [1, 2.5] : 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="spark"
            style={{ left: spark.x, top: spark.y }}
          >
            <Zap className="text-poke-yellow fill-poke-yellow w-6 h-6 drop-shadow-[0_0_8px_rgba(255,217,61,0.8)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Handheld Device / Web Calculator Container */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative bg-poke-yellow p-4 sm:p-6 rounded-[32px] sm:rounded-[40px] border-6 sm:border-8 border-poke-dark-blue shadow-[0_20px_0_0_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col gap-4 ${isDesktop ? 'max-w-2xl w-full min-h-[600px]' : 'max-w-[420px] w-full max-h-[90vh]'}`}
      >
        {/* Left Side: Calculator */}
        <div className="w-full">
          {/* Decorative elements */}
          <div className="absolute top-4 left-1/4 -translate-x-1/2 flex gap-2 lg:hidden">
            <div className="w-12 h-2 bg-poke-dark-blue/20 rounded-full" />
            <div className="w-2 h-2 bg-poke-dark-blue/20 rounded-full" />
          </div>

          {/* Screen Container */}
          <div className="bg-poke-dark-blue p-4 rounded-2xl mb-6 border-4 border-poke-dark-blue/50 shadow-inner relative overflow-hidden">
            {/* Battle Animation Overlay */}
            <AnimatePresence>
              {battleStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-[#9bbc0f]/95 flex items-center justify-center pointer-events-none"
                >
                  {battleStatus === 'success' ? (
                    <div className="flex flex-col items-center justify-center h-full w-full relative">
                      {/* Background Effects */}
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.1, 0.3, 0.1],
                          rotate: [0, 90, 180, 270, 360]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none"
                      />
                      
                      <div className="flex items-center gap-6 sm:gap-10 z-10">
                        {/* Attacker */}
                        <motion.div 
                          animate={{ 
                            x: battleMoveType === 'physical' ? [0, 60, 0] : [0, 10, 0],
                            y: [0, -10, 0],
                            scale: battleMoveType === 'special' ? [1, 1.3, 1] : [1, 1.1, 1],
                            rotate: [0, -15, 0]
                          }} 
                          transition={{ duration: 0.5, repeat: 1, ease: "easeInOut" }} 
                          className="relative"
                        >
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${battleSprites.attacker.id}.png`}
                            alt={battleSprites.attacker.name}
                            className="w-16 h-16 sm:w-24 sm:h-24 object-contain pixelated drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            referrerPolicy="no-referrer"
                          />
                          <motion.div
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="absolute -top-2 -right-2"
                          >
                            <Zap className="text-poke-yellow fill-poke-yellow w-4 h-4" />
                          </motion.div>
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-[7px] font-bold uppercase bg-black/40 px-1 rounded text-white whitespace-nowrap">
                              {battleSprites.attacker.name}
                            </span>
                            <div className="w-12 h-1 bg-black/20 rounded-full mt-0.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: '100%' }}
                                animate={{ width: '100%' }}
                                className="h-full bg-poke-green"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Attack Effect */}
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <AnimatePresence>
                            {battleMoveType === 'physical' && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 2, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
                                transition={{ duration: 0.4 }}
                                className="absolute"
                              >
                                <Swords className="text-poke-dark-blue w-8 h-8" />
                              </motion.div>
                            )}
                            {battleMoveType === 'special' && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 3, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.6 }}
                                className="absolute bg-poke-blue/40 rounded-full blur-xl w-12 h-12"
                              />
                            )}
                            <motion.div 
                              animate={{ 
                                scale: [0, 3, 0], 
                                opacity: [0, 0.8, 0],
                                backgroundColor: battleEffectiveness > 1 ? ['#4ade80', '#22c55e', '#4ade80'] : ['#f87171', '#ef4444', '#f87171']
                              }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                              className="absolute inset-0 rounded-full blur-md"
                            />
                          </AnimatePresence>
                        </div>

                        {/* Defender */}
                        <motion.div 
                          animate={{ 
                            x: battleMoveType === 'physical' ? [0, 20, 0] : [0, 0, 0],
                            y: [0, 5, 0],
                            scale: [1, 0.85, 1],
                            opacity: [1, 0.5, 1],
                            filter: battleEffectiveness > 1 ? ['brightness(100%)', 'brightness(300%)', 'brightness(100%)'] : ['brightness(100%)', 'brightness(200%)', 'brightness(100%)']
                          }} 
                          transition={{ duration: 0.4, delay: 0.2 }} 
                          className="relative"
                        >
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${battleSprites.defender.id}.png`}
                            alt={battleSprites.defender.name}
                            className="w-16 h-16 sm:w-24 sm:h-24 object-contain pixelated"
                            referrerPolicy="no-referrer"
                          />
                          {/* Hit Effect */}
                          <motion.div
                            animate={{ 
                              scale: [0, 2, 0],
                              opacity: [0, 1, 0],
                              x: [0, (Math.random() - 0.5) * 20],
                              y: [0, (Math.random() - 0.5) * 20]
                            }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-full h-full border-4 border-white rounded-full opacity-50" />
                          </motion.div>
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-[7px] font-bold uppercase bg-black/40 px-1 rounded text-white whitespace-nowrap">
                              {battleSprites.defender.name}
                            </span>
                            <div className="w-12 h-1 bg-black/20 rounded-full mt-0.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: '100%' }}
                                animate={{ width: '30%' }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="h-full bg-poke-red"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Effectiveness Text */}
                      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-1 z-20">
                        {battleEffectiveness !== 1 && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-lg ${battleEffectiveness > 1 ? 'bg-poke-green text-white' : 'bg-poke-red text-white'}`}
                          >
                            {battleEffectiveness > 1 ? "Super Effective!" : "Not very effective..."}
                          </motion.span>
                        )}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] font-mono font-bold text-poke-dark-blue/60"
                        >
                          Result: {display}
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <motion.div 
                        animate={{ 
                          rotate: [0, 180, 360], 
                          y: [0, 60],
                          opacity: [1, 0],
                          scale: [1, 0.5]
                        }} 
                        transition={{ duration: 0.8 }}
                      >
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${battleSprites.attacker.id}.png`}
                          alt={battleSprites.attacker.name}
                          className="w-20 h-20 sm:w-28 sm:h-28 object-contain pixelated grayscale"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                      <span className="font-mono text-base sm:text-lg mt-4 uppercase font-bold text-poke-red tracking-tighter">Critical Miss!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              animate={{ 
                backgroundColor: screenPulse ? '#c4e34d' : ['#9bbc0f', '#98b80e', '#9bbc0f'],
                boxShadow: screenPulse ? 'inset 0 0 25px rgba(255,255,255,0.5)' : 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}
              transition={{
                backgroundColor: screenPulse ? { duration: 0.1 } : { duration: 4, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 0.2 }
              }}
              className={`h-36 rounded-lg flex flex-col items-end justify-center px-4 overflow-hidden relative ${battleStatus === 'success' ? 'animate-shake' : ''}`}
            >
              <div className="absolute inset-0 scanlines opacity-10" />
              <div className="absolute inset-0 screen-glow bg-white/5 pointer-events-none" />
              <AnimatePresence>
                {battleStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.15, repeat: 2 }}
                    className="absolute inset-0 bg-white z-10 pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <span className="text-[10px] font-mono opacity-50 absolute top-2 right-4 z-20">
                {prevValue !== null ? `${prevValue} ${operator || ''}` : ''}
              </span>
              <span className={`font-mono text-4xl text-poke-dark-blue/80 break-all text-right leading-tight z-20 ${display.length > 10 ? 'text-2xl' : ''}`}>
                {display}
              </span>
            </motion.div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] font-bold text-poke-white/30 tracking-widest uppercase">PokéCalc Pro</span>
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${battleStatus === 'error' ? 'bg-poke-red animate-ping' : 'bg-poke-red'}`} />
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${battleStatus === 'success' ? 'bg-poke-green animate-pulse' : 'bg-poke-white/20'}`} />
              </div>
            </div>
          </div>

          {/* Mode Toggle & Utility Buttons - Only on Mobile */}
          {!isDesktop && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={(e) => onButtonClick(e, () => setIsScientific(!isScientific))}
                className={`py-2 rounded-xl border-b-4 border-black/20 font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all active:border-b-0 active:translate-y-1 ${isScientific ? 'bg-poke-blue text-white' : 'bg-poke-white text-poke-dark-blue'}`}
              >
                <Beaker size={12} /> {isScientific ? 'Basic' : 'Sci'}
              </button>
              <button 
                onClick={(e) => onButtonClick(e, () => setShowHistory(true))}
                className="py-2 rounded-xl border-b-4 border-black/20 bg-poke-white text-poke-dark-blue font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all active:border-b-0 active:translate-y-1"
              >
                <HistoryIcon size={12} /> Log
              </button>
            </div>
          )}

          {/* Desktop Header Utility */}
          {isDesktop && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button 
                  onClick={(e) => onButtonClick(e, () => setShowHistory(!showHistory))}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border-b-2 border-black/10 transition-all ${showHistory ? 'bg-poke-red text-white' : 'bg-poke-white text-poke-dark-blue'}`}
                >
                  {showHistory ? 'Hide Data' : 'Show Data'}
                </button>
              </div>
              <div className="text-[10px] font-bold text-poke-dark-blue/40 uppercase tracking-widest">
                System Active
              </div>
            </div>
          )}

          {/* Buttons Grid Container */}
          <div className={`custom-scrollbar pr-1 ${isDesktop ? 'h-auto' : 'h-[320px] overflow-y-auto'}`}>
            <div className={`grid gap-2 sm:gap-3 ${isDesktop ? 'grid-cols-7' : 'grid-cols-4'}`}>
              {/* Desktop Layout (7 Columns) */}
              {isDesktop ? (
                <>
                  {/* Row 1 */}
                  <CalcButton label="sin" onClick={(e) => onButtonClick(e, () => handleScientific('sin'))} variant="secondary" small />
                  <CalcButton label="ln" onClick={(e) => onButtonClick(e, () => handleScientific('ln'))} variant="secondary" small />
                  <CalcButton label="7" onClick={(e) => onButtonClick(e, () => handleNumber('7'))} />
                  <CalcButton label="8" onClick={(e) => onButtonClick(e, () => handleNumber('8'))} />
                  <CalcButton label="9" onClick={(e) => onButtonClick(e, () => handleNumber('9'))} />
                  <CalcButton label="÷" onClick={(e) => onButtonClick(e, () => handleOperator('/'))} variant="secondary" icon={<Divide size={18} />} />
                  <CalcButton label="AC" onClick={(e) => onButtonClick(e, handleClear)} variant="danger" />

                  {/* Row 2 */}
                  <CalcButton label="cos" onClick={(e) => onButtonClick(e, () => handleScientific('cos'))} variant="secondary" small />
                  <CalcButton label="log" onClick={(e) => onButtonClick(e, () => handleScientific('log10'))} variant="secondary" small />
                  <CalcButton label="4" onClick={(e) => onButtonClick(e, () => handleNumber('4'))} />
                  <CalcButton label="5" onClick={(e) => onButtonClick(e, () => handleNumber('5'))} />
                  <CalcButton label="6" onClick={(e) => onButtonClick(e, () => handleNumber('6'))} />
                  <CalcButton label="×" onClick={(e) => onButtonClick(e, () => handleOperator('*'))} variant="secondary" icon={<X size={18} />} />
                  <CalcButton label="DEL" onClick={(e) => onButtonClick(e, () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0'))} variant="danger" />

                  {/* Row 3 */}
                  <CalcButton label="tan" onClick={(e) => onButtonClick(e, () => handleScientific('tan'))} variant="secondary" small />
                  <CalcButton label="√" onClick={(e) => onButtonClick(e, () => handleScientific('sqrt'))} variant="secondary" small />
                  <CalcButton label="1" onClick={(e) => onButtonClick(e, () => handleNumber('1'))} />
                  <CalcButton label="2" onClick={(e) => onButtonClick(e, () => handleNumber('2'))} />
                  <CalcButton label="3" onClick={(e) => onButtonClick(e, () => handleNumber('3'))} />
                  <CalcButton label="−" onClick={(e) => onButtonClick(e, () => handleOperator('-'))} variant="secondary" icon={<Minus size={18} />} />
                  <CalcButton label="DEL" onClick={(e) => onButtonClick(e, () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0'))} variant="danger" />

                  {/* Row 4 */}
                  <CalcButton label="π" onClick={(e) => onButtonClick(e, () => handleScientific('pi'))} variant="secondary" small />
                  <CalcButton label="x^y" onClick={(e) => onButtonClick(e, () => handleOperator('^'))} variant="secondary" small />
                  <CalcButton label="0" onClick={(e) => onButtonClick(e, () => handleNumber('0'))} />
                  <CalcButton label="." onClick={(e) => onButtonClick(e, handleDecimal)} />
                  <CalcButton label="=" onClick={(e) => onButtonClick(e, handleEqual, true)} variant="success" icon={<Equal size={18} />} />
                  <CalcButton label="+" onClick={(e) => onButtonClick(e, () => handleOperator('+'))} variant="secondary" icon={<Plus size={18} />} />
                  <CalcButton label="Log" onClick={(e) => onButtonClick(e, () => setShowHistory(true))} variant="secondary" small />

                  {/* Row 5 */}
                  <CalcButton label="e" onClick={(e) => onButtonClick(e, () => handleScientific('e'))} variant="secondary" small />
                  <CalcButton label="x!" onClick={(e) => onButtonClick(e, () => handleScientific('fact'))} variant="secondary" small />
                  <CalcButton label="(" onClick={(e) => onButtonClick(e, () => {})} variant="secondary" small />
                  <CalcButton label=")" onClick={(e) => onButtonClick(e, () => {})} variant="secondary" small />
                  <CalcButton label="%" onClick={(e) => onButtonClick(e, () => handleScientific('percent'))} variant="secondary" small />
                  <CalcButton label="M+" onClick={(e) => onButtonClick(e, () => handleMemory('M+'))} variant="secondary" small />
                  <CalcButton label="M-" onClick={(e) => onButtonClick(e, () => handleMemory('M-'))} variant="secondary" small />
                </>
              ) : (
                /* Mobile Layout (4 Columns) */
                <>
                  {isScientific && (
                    <>
                      <CalcButton label="Log" onClick={(e) => onButtonClick(e, () => setShowHistory(true))} variant="secondary" small />
                      <CalcButton label="M+" onClick={(e) => onButtonClick(e, () => handleMemory('M+'))} variant="secondary" small />
                      <CalcButton label="M-" onClick={(e) => onButtonClick(e, () => handleMemory('M-'))} variant="secondary" small />
                      <CalcButton label="sin" onClick={(e) => onButtonClick(e, () => handleScientific('sin'))} variant="secondary" small />
                      <CalcButton label="cos" onClick={(e) => onButtonClick(e, () => handleScientific('cos'))} variant="secondary" small />
                      <CalcButton label="tan" onClick={(e) => onButtonClick(e, () => handleScientific('tan'))} variant="secondary" small />
                      <CalcButton label="√" onClick={(e) => onButtonClick(e, () => handleScientific('sqrt'))} variant="secondary" small />
                      
                      <CalcButton label="ln" onClick={(e) => onButtonClick(e, () => handleScientific('ln'))} variant="secondary" small />
                      <CalcButton label="log" onClick={(e) => onButtonClick(e, () => handleScientific('log10'))} variant="secondary" small />
                      <CalcButton label="x^y" onClick={(e) => onButtonClick(e, () => handleOperator('^'))} variant="secondary" small />
                      <CalcButton label="!" onClick={(e) => onButtonClick(e, () => handleScientific('fact'))} variant="secondary" small />
                      
                      <CalcButton label="π" onClick={(e) => onButtonClick(e, () => handleScientific('pi'))} variant="secondary" small />
                      <CalcButton label="e" onClick={(e) => onButtonClick(e, () => handleScientific('e'))} variant="secondary" small />
                      <CalcButton label="φ" onClick={(e) => onButtonClick(e, () => handleScientific('phi'))} variant="secondary" small />
                      <CalcButton label="%" onClick={(e) => onButtonClick(e, () => handleScientific('percent'))} variant="secondary" icon={<Percent size={16} />} small />
                    </>
                  )}
                  
                  <CalcButton label="7" onClick={(e) => onButtonClick(e, () => handleNumber('7'))} />
                  <CalcButton label="8" onClick={(e) => onButtonClick(e, () => handleNumber('8'))} />
                  <CalcButton label="9" onClick={(e) => onButtonClick(e, () => handleNumber('9'))} />
                  <CalcButton label="÷" onClick={(e) => onButtonClick(e, () => handleOperator('/'))} variant="secondary" icon={<Divide size={20} />} />

                  <CalcButton label="4" onClick={(e) => onButtonClick(e, () => handleNumber('4'))} />
                  <CalcButton label="5" onClick={(e) => onButtonClick(e, () => handleNumber('5'))} />
                  <CalcButton label="6" onClick={(e) => onButtonClick(e, () => handleNumber('6'))} />
                  <CalcButton label="×" onClick={(e) => onButtonClick(e, () => handleOperator('*'))} variant="secondary" icon={<X size={20} />} />

                  <CalcButton label="1" onClick={(e) => onButtonClick(e, () => handleNumber('1'))} />
                  <CalcButton label="2" onClick={(e) => onButtonClick(e, () => handleNumber('2'))} />
                  <CalcButton label="3" onClick={(e) => onButtonClick(e, () => handleNumber('3'))} />
                  <CalcButton label="−" onClick={(e) => onButtonClick(e, () => handleOperator('-'))} variant="secondary" icon={<Minus size={20} />} />

                  <CalcButton label="0" onClick={(e) => onButtonClick(e, () => handleNumber('0'))} />
                  <CalcButton label="." onClick={(e) => onButtonClick(e, handleDecimal)} />
                  <CalcButton label="=" onClick={(e) => onButtonClick(e, handleEqual, true)} variant="success" icon={<Equal size={20} />} />
                  <CalcButton label="+" onClick={(e) => onButtonClick(e, () => handleOperator('+'))} variant="secondary" icon={<Plus size={20} />} />
                </>
              )}
            </div>

            {/* Mobile Clear Button */}
            {!isDesktop && (
              <div className="mt-3">
                <CalcButton 
                  label="AC" 
                  onClick={(e) => onButtonClick(e, handleClear)} 
                  variant="danger" 
                  fullWidth 
                  icon={<RotateCcw size={20} className="mr-2" />}
                />
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-poke-dark-blue/10 border-2 border-poke-dark-blue/20 flex items-center justify-center">
                  <div className="w-4 h-1 sm:w-6 sm:h-1 bg-poke-dark-blue/30 rounded-full rotate-45" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-poke-dark-blue/10 border-2 border-poke-dark-blue/20 flex items-center justify-center">
                  <div className="w-1 h-4 sm:w-1 sm:h-6 bg-poke-dark-blue/30 rounded-full" />
                </div>
              </div>
            <div className="text-[10px] font-bold text-poke-dark-blue/40 uppercase tracking-widest lg:hidden">
              PokéCalc Pro Edition
            </div>
          </div>
        </div>

        {/* Right Side: Battle Log & Pokedex (Desktop Only) - REMOVED AS PER REQUEST */}
      </motion.div>

      {/* Data Sidebar (History & Pokédex) */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex justify-end bg-black/40 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-poke-white w-full max-w-md h-full border-l-8 border-poke-yellow shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 bg-poke-yellow">
                <h2 className="text-2xl font-bold text-poke-dark-blue flex items-center gap-2">
                  <HistoryIcon size={24} /> Battle Data
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex border-b-4 border-poke-dark-blue/10">
                <button 
                  onClick={() => setActiveTab('log')}
                  className={`flex-1 py-4 font-bold text-xs uppercase transition-all ${activeTab === 'log' ? 'bg-poke-yellow text-poke-dark-blue' : 'bg-transparent text-poke-dark-blue/40 hover:bg-black/5'}`}
                >
                  Battle Log
                </button>
                <button 
                  onClick={() => setActiveTab('pokedex')}
                  className={`flex-1 py-4 font-bold text-xs uppercase transition-all ${activeTab === 'pokedex' ? 'bg-poke-red text-white' : 'bg-transparent text-poke-dark-blue/40 hover:bg-black/5'}`}
                >
                  Pokédex
                </button>
              </div>

              {activeTab === 'pokedex' && (
                <div className="px-6 py-4 bg-poke-dark-blue/5 border-b-2 border-poke-dark-blue/10 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[8px] font-bold uppercase text-poke-dark-blue/40 block mb-1">Search</label>
                      <input 
                        type="text" 
                        placeholder="Search Pokémon..." 
                        value={pokedexSearch}
                        onChange={(e) => setPokedexSearch(e.target.value)}
                        className="w-full bg-white border-2 border-poke-dark-blue/10 rounded-lg px-3 py-2 text-xs font-bold text-poke-dark-blue focus:outline-none focus:border-poke-blue/50 transition-all"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-[8px] font-bold uppercase text-poke-dark-blue/40 block mb-1">Type</label>
                      <select 
                        value={pokedexType}
                        onChange={(e) => setPokedexType(e.target.value)}
                        className="w-full bg-white border-2 border-poke-dark-blue/10 rounded-lg px-2 py-2 text-xs font-bold text-poke-dark-blue focus:outline-none focus:border-poke-blue/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="All">All Types</option>
                        {Object.keys(TYPE_EFFECTIVENESS).map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-poke-white/50">
                {activeTab === 'log' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-poke-dark-blue/40 uppercase">Recent Battles</span>
                      {history.length > 0 && (
                        <button 
                          onClick={() => window.confirm('Clear all battle records?') && setHistory([])}
                          className="text-[10px] font-bold text-poke-red uppercase hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Clear
                        </button>
                      )}
                    </div>
                    {history.length === 0 ? (
                      <div className="text-center py-20 text-poke-dark-blue/30 font-mono italic text-sm">
                        No battles recorded yet...
                      </div>
                    ) : (
                      history.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-black/5 shadow-sm hover:border-poke-blue/30 transition-all cursor-pointer group" onClick={() => {
                          setDisplay(item.result);
                          if (!isDesktop) setShowHistory(false);
                        }}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono text-poke-dark-blue/40">{item.timestamp}</span>
                            <span className="text-[10px] font-mono text-poke-dark-blue/40">{item.expression}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-2xl font-mono font-bold text-poke-dark-blue truncate">{item.result}</div>
                            <div className="opacity-0 group-hover:opacity-100 text-[8px] font-bold uppercase text-poke-blue bg-poke-blue/10 px-2 py-1 rounded-lg transition-all">
                              Recall
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 px-3 py-2 text-[8px] font-bold uppercase text-poke-dark-blue/40 border-b border-poke-dark-blue/10 sticky top-0 bg-poke-white/90 backdrop-blur-sm z-10">
                      <span>#</span>
                      <span>Name</span>
                      <span>Type</span>
                      <span className="text-right">Total</span>
                    </div>
                    {POKEMON_SPRITES.filter(p => {
                      const matchesSearch = p.name.toLowerCase().includes(pokedexSearch.toLowerCase());
                      const matchesType = pokedexType === 'All' || p.type.includes(pokedexType.toLowerCase());
                      return matchesSearch && matchesType;
                    }).map(p => (
                      <div key={p.id} className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 px-3 py-3 items-center bg-white rounded-xl border border-black/5 hover:border-poke-red/30 transition-all group">
                        <span className="text-[10px] font-mono text-poke-dark-blue/30">#{String(p.id).padStart(3, '0')}</span>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                            alt={p.name}
                            className="w-8 h-8 object-contain pixelated group-hover:scale-125 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-bold text-poke-dark-blue truncate">{p.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {p.type.map(t => (
                            <span key={t} className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-[4px] text-white ${
                              t === 'fire' ? 'bg-poke-red' : 
                              t === 'water' ? 'bg-poke-blue' : 
                              t === 'grass' ? 'bg-poke-green' : 
                              t === 'electric' ? 'bg-poke-yellow text-poke-dark-blue' : 
                              'bg-poke-dark-blue/20 text-poke-dark-blue'
                            }`}>
                              {t.charAt(0)}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-mono font-bold text-poke-dark-blue/60 text-right">{p.total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-poke-dark-blue/5 border-t-4 border-poke-dark-blue/10 flex justify-between items-center">
                <span className="text-[10px] font-bold text-poke-dark-blue/40 uppercase tracking-widest">PokéCalc v1.0.5</span>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="px-6 py-2 bg-poke-dark-blue text-white font-bold rounded-xl text-xs uppercase hover:bg-poke-dark-blue/80 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="fixed -bottom-20 -right-20 w-64 h-64 bg-poke-yellow/10 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-20 -left-20 w-64 h-64 bg-poke-blue/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}

interface CalcButtonProps {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  small?: boolean;
}

function CalcButton({ label, onClick, variant = 'primary', icon, fullWidth, small }: CalcButtonProps) {
  const getColors = () => {
    switch (variant) {
      case 'secondary': return 'bg-poke-blue text-white';
      case 'success': return 'bg-poke-green text-white';
      case 'danger': return 'bg-poke-red text-white';
      default: return 'bg-poke-white text-poke-dark-blue';
    }
  };

  return (
    <motion.button
      whileTap={{ 
        y: 2, 
        scale: 0.96,
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.25)',
        borderBottomWidth: '0px'
      }}
      transition={{ type: 'spring', stiffness: 600, damping: 20 }}
      onClick={onClick}
      className={`
        ${getColors()}
        ${fullWidth ? 'w-full' : 'aspect-square'}
        rounded-2xl border-b-4 border-black/20
        flex items-center justify-center
        font-bold ${small ? 'text-xs' : 'text-xl'} shadow-lg
        hover:brightness-110 transition-all duration-150
      `}
    >
      <span className="flex items-center justify-center pointer-events-none">
        {icon || label}
      </span>
    </motion.button>
  );
}
