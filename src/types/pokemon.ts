// Pokemon-specific type definitions

export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: {
    name: string
    url: string
  }
  pokedex_numbers: Array<{
    entry_number: number
    pokedex: {
      name: string
      url: string
    }
  }>
  egg_groups: Array<{
    name: string
    url: string
  }>
  color: {
    name: string
    url: string
  }
  shape: {
    name: string
    url: string
  }
  evolves_from_species?: {
    name: string
    url: string
  }
  evolution_chain: {
    url: string
  }
  habitat?: {
    name: string
    url: string
  }
  generation: {
    name: string
    url: string
  }
  names: Array<{
    name: string
    language: {
      name: string
      url: string
    }
  }>
  flavor_text_entries: Array<{
    flavor_text: string
    language: {
      name: string
      url: string
    }
    version: {
      name: string
      url: string
    }
  }>
  form_descriptions: Array<{
    description: string
    language: {
      name: string
      url: string
    }
  }>
  genera: Array<{
    genus: string
    language: {
      name: string
      url: string
    }
  }>
  varieties: Array<{
    is_default: boolean
    pokemon: {
      name: string
      url: string
    }
  }>
}

export interface PokemonForm {
  id: number
  name: string
  order: number
  form_order: number
  is_default: boolean
  is_battle_only: boolean
  is_mega: boolean
  form_name: string
  pokemon: {
    name: string
    url: string
  }
  sprites: {
    front_default: string | null
    front_shiny: string | null
    front_female: string | null
    front_shiny_female: string | null
    back_default: string | null
    back_shiny: string | null
    back_female: string | null
    back_shiny_female: string | null
  }
  version_group: {
    name: string
    url: string
  }
  names: Array<{
    name: string
    language: {
      name: string
      url: string
    }
  }>
  form_names: Array<{
    name: string
    language: {
      name: string
      url: string
    }
  }>
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: {
    name: string
    url: string
  }
}

export interface PokemonMove {
  move: {
    name: string
    url: string
  }
  version_group_details: Array<{
    level_learned_at: number
    version_group: {
      name: string
      url: string
    }
    move_learn_method: {
      name: string
      url: string
    }
  }>
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  front_female: string | null
  front_shiny_female: string | null
  back_default: string | null
  back_shiny: string | null
  back_female: string | null
  back_shiny_female: string | null
  other: {
    dream_world: {
      front_default: string | null
      front_female: string | null
    }
    home: {
      front_default: string | null
      front_female: string | null
      front_shiny: string | null
      front_shiny_female: string | null
    }
    'official-artwork': {
      front_default: string | null
      front_shiny: string | null
    }
  }
  versions: {
    'generation-i': {
      'red-blue': {
        back_default: string | null
        back_gray: string | null
        back_transparent: string | null
        front_default: string | null
        front_gray: string | null
        front_transparent: string | null
      }
      yellow: {
        back_default: string | null
        back_gray: string | null
        back_transparent: string | null
        front_default: string | null
        front_gray: string | null
        front_transparent: string | null
      }
    }
    'generation-ii': {
      crystal: {
        back_default: string | null
        back_shiny: string | null
        back_shiny_transparent: string | null
        back_transparent: string | null
        front_default: string | null
        front_shiny: string | null
        front_shiny_transparent: string | null
        front_transparent: string | null
      }
      gold: {
        back_default: string | null
        back_shiny: string | null
        front_default: string | null
        front_shiny: string | null
        front_transparent: string | null
      }
      silver: {
        back_default: string | null
        back_shiny: string | null
        front_default: string | null
        front_shiny: string | null
        front_transparent: string | null
      }
    }
    // ... other generations would be included here
  }
}

export interface PokemonCry {
  name: string
  url: string
}

export interface PokemonEvolution {
  id: number
  name: string
  sprite: string
  level?: number
  condition?: string
  item?: string
  time?: string
  location?: string
  happiness?: number
  known_move?: string
  known_move_type?: string
  min_level?: number
  min_happiness?: number
  min_beauty?: number
  min_affection?: number
  needs_overworld_rain?: boolean
  turn_upside_down?: boolean
}

export interface PokemonEvolutionChain {
  id: number
  baby_trigger_item: string | null
  chain: {
    is_baby: boolean
    species: {
      name: string
      url: string
    }
    evolution_details: Array<{
      item: string | null
      trigger: {
        name: string
        url: string
      }
      gender: number | null
      held_item: string | null
      known_move: string | null
      known_move_type: string | null
      location: string | null
      min_level: number | null
      min_happiness: number | null
      min_beauty: number | null
      min_affection: number | null
      needs_overworld_rain: boolean
      party_species: string | null
      party_type: string | null
      relative_physical_stats: number | null
      time_of_day: string
      trade_species: string | null
      turn_upside_down: boolean
    }>
    evolves_to: PokemonEvolutionChain[]
  }
}

// Utility types for game mechanics
export interface PokemonRarity {
  common: number[]
  uncommon: number[]
  rare: number[]
  legendary: number[]
  mythical: number[]
}

export interface PokemonGeneration {
  id: number
  name: string
  region: string
  pokemonCount: number
  startId: number
  endId: number
}

export interface PokemonTypeEffectiveness {
  [attackingType: string]: {
    [defendingType: string]: number // 0, 0.5, 1, 2
  }
}

export interface PokemonSearchResult {
  id: number
  name: string
  sprite: string
  types: string[]
  generation: number
  isLegendary: boolean
  isMythical: boolean
}
