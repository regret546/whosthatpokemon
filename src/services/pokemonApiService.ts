import {
  Pokemon,
  PokemonType,
  PokemonStats,
  PokemonSearchResult,
} from "@/types";

export interface PokemonApiResponse {
  pokemon: Pokemon;
  choices: string[];
  correctAnswer: string;
  hints: GameHint[];
}

export interface PokemonDetailedData {
  id: number;
  name: string;
  description: string;
  height: number;
  weight: number;
  abilities: string[];
  stats: number[];
  evolutionChain: EvolutionChain;
  sprite: string;
  animatedSprite?: string;
  types: PokemonType[];
}

export interface EvolutionChain {
  id: number;
  name: string;
  sprite: string;
  minLevel?: number;
  evolvesTo?: EvolutionChain[];
}

export interface GameHint {
  type:
    | "flavor_text"
    | "type"
    | "height_weight"
    | "evolution"
    | "generation";
  content: string;
  cost: number;
}

export interface PokemonListResponse {
  pokemon: Pokemon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class PokemonApiService {
  private baseUrl = "https://pokeapi.co/api/v2";
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  // Get random Pokémon for game
  async getRandomPokemon(
    params: {
      difficulty?: string;
      generation?: number;
      type?: string;
      isLegendary?: boolean;
    } = {}
  ): Promise<PokemonApiResponse> {
    try {
      console.log("Getting random Pokémon with params:", params);

      // First, get a list of Pokémon IDs based on criteria
      const pokemonIds = await this.getPokemonIdsByCriteria(params);

      console.log("Pokémon IDs found:", pokemonIds.length);

      if (pokemonIds.length === 0) {
        throw new Error("No Pokémon found matching criteria");
      }

      // Pick a random Pokémon
      const randomId =
        pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
      console.log("Selected Pokémon ID:", randomId);

      const pokemon = await this.getPokemonById(randomId);

      if (!pokemon) {
        throw new Error("Failed to fetch Pokémon data");
      }

      console.log("Pokémon data:", pokemon);

      // Generate multiple choice options
      const choices = await this.generateChoices(pokemon, params.generation);
      console.log("Generated choices:", choices);

      // Generate hints
      const hints = await this.generateHints(pokemon);

      return {
        pokemon,
        choices,
        correctAnswer: pokemon.name,
        hints,
      };
    } catch (error) {
      console.error("Error getting random Pokémon:", error);

      // Fallback to a hardcoded Pokémon if API fails
      console.log("Using fallback Pokémon data");
      return this.getFallbackPokemon();
    }
  }

  // Get detailed Pokémon data for Pokédex display
  async getPokemonDetailedData(
    pokemonId: number
  ): Promise<PokemonDetailedData> {
    try {
      console.log("Fetching detailed data for Pokémon:", pokemonId);

      // Fetch basic Pokémon data
      const pokemonData = await this.fetchFromApi(`pokemon/${pokemonId}`);

      // Fetch species data for description and evolution chain
      const speciesData = await this.fetchFromApi(
        `pokemon-species/${pokemonId}`
      );

      // Get English description
      const description = this.getEnglishDescription(
        speciesData.flavor_text_entries
      );

      // Get evolution chain
      const evolutionChain = await this.getEvolutionChain(
        speciesData.evolution_chain.url
      );

      // Get animated sprite for generation V+ Pokémon
      const animatedSprite =
        pokemonId >= 650
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${pokemonId}.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;

      // Extract stats array
      const stats = pokemonData.stats.map((stat: any) => stat.base_stat);

      // Extract abilities
      const abilities = pokemonData.abilities
        .slice(0, 2)
        .map((ability: any) => ability.ability.name);

      // Extract types
      const types: PokemonType[] = pokemonData.types.map((type: any) => ({
        name: type.type.name,
        color: this.getTypeColor(type.type.name),
      }));

      return {
        id: pokemonData.id,
        name: pokemonData.name,
        description: description,
        height: pokemonData.height / 10, // Convert to meters
        weight: pokemonData.weight / 10, // Convert to kg
        abilities: abilities,
        stats: stats,
        evolutionChain: evolutionChain,
        sprite: pokemonData.sprites.front_default,
        animatedSprite: animatedSprite,
        types: types,
      };
    } catch (error) {
      console.error("Failed to fetch detailed Pokémon data:", error);
      throw error;
    }
  }

  // Get English description from flavor text entries
  private getEnglishDescription(flavorTextEntries: any[]): string {
    for (const entry of flavorTextEntries) {
      if (entry.language.name === "en") {
        return entry.flavor_text
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
    return "No description available.";
  }

  // Get evolution chain data
  private async getEvolutionChain(
    evolutionChainUrl: string
  ): Promise<EvolutionChain> {
    try {
      const response = await this.fetchFromApi(
        evolutionChainUrl.replace(this.baseUrl, "")
      );
      return this.parseEvolutionChain(response.chain);
    } catch (error) {
      console.error("Failed to fetch evolution chain:", error);
      return {
        id: 0,
        name: "unknown",
        sprite: "",
        evolvesTo: [],
      };
    }
  }

  // Parse evolution chain recursively
  private parseEvolutionChain(chain: any): EvolutionChain {
    const id = this.getPokemonNumberFromUrl(chain.species.url);
    const name = chain.species.name;

    const evolution: EvolutionChain = {
      id: id,
      name: name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      evolvesTo: [],
    };

    if (chain.evolves_to && chain.evolves_to.length > 0) {
      const firstEvolution = chain.evolves_to[0];
      const nextEvolution = this.parseEvolutionChain(firstEvolution);
      // Set the minLevel on the evolved form, not the current form
      nextEvolution.minLevel =
        firstEvolution.evolution_details[0]?.min_level || null;
      evolution.evolvesTo = [nextEvolution];
    }

    return evolution;
  }

  // Extract Pokémon number from URL
  private getPokemonNumberFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1]) : 0;
  }

  // Get type color
  private getTypeColor(typeName: string): string {
    const colors: Record<string, string> = {
      normal: "#BCBCAC",
      fighting: "#BC5442",
      flying: "#669AFF",
      poison: "#AB549A",
      ground: "#DEBC54",
      rock: "#BCAC66",
      bug: "#ABBC1C",
      ghost: "#6666BC",
      steel: "#ABACBC",
      fire: "#FF421C",
      water: "#2F9AFF",
      grass: "#78CD54",
      electric: "#FFCD30",
      psychic: "#FF549A",
      ice: "#78DEFF",
      dragon: "#7866EF",
      dark: "#785442",
      fairy: "#FFACFF",
      shadow: "#0E2E4C",
    };
    return colors[typeName.toLowerCase()] || "#BCBCAC";
  }

  private getFallbackPokemon(): PokemonApiResponse {
    const fallbackPokemon: Pokemon = {
      id: 1,
      name: "bulbasaur",
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      types: [
        { name: "grass", color: "#78C850" },
        { name: "poison", color: "#A040A0" },
      ],
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        specialAttack: 65,
        specialDefense: 65,
        speed: 45,
      },
      abilities: ["overgrow", "chlorophyll"],
      height: 0.7,
      weight: 6.9,
      baseExperience: 64,
      isLegendary: false,
      isMythical: false,
      generation: 1,
    };

    const choices = ["bulbasaur", "charmander", "squirtle", "pikachu"];
    const shuffledChoices = this.shuffleArray(choices);

    return {
      pokemon: fallbackPokemon,
      choices: shuffledChoices,
      correctAnswer: "bulbasaur",
      hints: [
        { type: "type", content: "Type: Grass, Poison", cost: 10 },
        { type: "generation", content: "Generation: 1", cost: 5 },
      ],
    };
  }

  // Get Pokémon by ID
  async getPokemonById(id: number): Promise<Pokemon | null> {
    try {
      const data = await this.fetchFromApi(`pokemon/${id}`);
      return this.transformPokemonData(data);
    } catch (error) {
      console.error(`Error fetching Pokémon ${id}:`, error);
      return null;
    }
  }

  // Get Pokémon by name
  async getPokemonByName(name: string): Promise<Pokemon | null> {
    try {
      const data = await this.fetchFromApi(`pokemon/${name.toLowerCase()}`);
      return this.transformPokemonData(data);
    } catch (error) {
      console.error(`Error fetching Pokémon ${name}:`, error);
      return null;
    }
  }

  // Search Pokémon
  async searchPokemon(
    query: string,
    limit: number = 20
  ): Promise<PokemonSearchResult[]> {
    try {
      // Get all Pokémon names first
      const allPokemon = await this.getAllPokemonNames();

      // Filter by query
      const filtered = allPokemon
        .filter((pokemon) =>
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);

      // Fetch detailed data for filtered results
      const results = await Promise.all(
        filtered.map(async (pokemon) => {
          const details = await this.getPokemonById(pokemon.id);
          if (!details) return null;

          return {
            id: details.id,
            name: details.name,
            sprite: details.sprite,
            types: details.types.map((t) => t.name),
            generation: details.generation,
            isLegendary: details.isLegendary || false,
            isMythical: details.isMythical || false,
          };
        })
      );

      return results.filter(Boolean) as PokemonSearchResult[];
    } catch (error) {
      console.error("Error searching Pokémon:", error);
      return [];
    }
  }

  // Get Pokémon by type
  async getPokemonByType(type: string): Promise<Pokemon[]> {
    try {
      const data = await this.fetchFromApi(`type/${type}`);
      const pokemonData = data.pokemon.map((p: any) => p.pokemon);

      const pokemon = await Promise.all(
        pokemonData.slice(0, 50).map(async (p: any) => {
          const details = await this.getPokemonById(
            this.extractIdFromUrl(p.url)
          );
          return details;
        })
      );

      return pokemon.filter(Boolean) as Pokemon[];
    } catch (error) {
      console.error(`Error fetching Pokémon by type ${type}:`, error);
      return [];
    }
  }

  // Get Pokémon by generation
  async getPokemonByGeneration(generation: number): Promise<Pokemon[]> {
    try {
      const { startId, endId } = this.getGenerationRange(generation);
      const pokemonIds = Array.from(
        { length: endId - startId + 1 },
        (_, i) => startId + i
      );

      const pokemon = await Promise.all(
        pokemonIds.slice(0, 20).map(async (id) => {
          return await this.getPokemonById(id);
        })
      );

      return pokemon.filter(Boolean) as Pokemon[];
    } catch (error) {
      console.error(
        `Error fetching Pokémon by generation ${generation}:`,
        error
      );
      return [];
    }
  }

  // Get all Pokémon types
  async getPokemonTypes(): Promise<string[]> {
    try {
      const data = await this.fetchFromApi("type");
      return data.results.map((type: any) => type.name);
    } catch (error) {
      console.error("Error fetching Pokémon types:", error);
      return [];
    }
  }

  // Get actual generation data from PokeAPI
  async getGenerationFromAPI(generationId: number): Promise<any> {
    try {
      const data = await this.fetchFromApi(`generation/${generationId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch generation ${generationId}:`, error);
      return null;
    }
  }

  // Get Pokémon generations info
  getPokemonGenerations(): Array<{
    id: number;
    name: string;
    region: string;
    pokemonCount: number;
    startId: number;
    endId: number;
  }> {
    return [
      {
        id: 1,
        name: "Generation I",
        region: "Kanto",
        pokemonCount: 151,
        startId: 1,
        endId: 151,
      },
      {
        id: 2,
        name: "Generation II",
        region: "Johto",
        pokemonCount: 100,
        startId: 152,
        endId: 251,
      },
      {
        id: 3,
        name: "Generation III",
        region: "Hoenn",
        pokemonCount: 135,
        startId: 252,
        endId: 386,
      },
      {
        id: 4,
        name: "Generation IV",
        region: "Sinnoh",
        pokemonCount: 107,
        startId: 387,
        endId: 493,
      },
      {
        id: 5,
        name: "Generation V",
        region: "Unova",
        pokemonCount: 156,
        startId: 494,
        endId: 649,
      },
      {
        id: 6,
        name: "Generation VI",
        region: "Kalos",
        pokemonCount: 72,
        startId: 650,
        endId: 721,
      },
      {
        id: 7,
        name: "Generation VII",
        region: "Alola",
        pokemonCount: 88,
        startId: 722,
        endId: 809,
      },
      {
        id: 8,
        name: "Generation VIII",
        region: "Galar",
        pokemonCount: 96,
        startId: 810,
        endId: 905,
      },
      {
        id: 9,
        name: "Generation IX",
        region: "Paldea",
        pokemonCount: 103,
        startId: 906,
        endId: 1008,
      },
    ];
  }

  // Generate silhouette effect
  generateSilhouette(spriteUrl: string): string {
    // In a real implementation, you'd use canvas to create a silhouette
    // For now, we'll return the original URL and handle the effect in CSS
    return spriteUrl;
  }

  // Get Pokémon cry URL
  getPokemonCryUrl(id: number): string {
    return `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
  }

  // Private helper methods
  private async getPokemonIdsByCriteria(params: {
    difficulty?: string;
    generation?: number;
    type?: string;
    isLegendary?: boolean;
  }): Promise<number[]> {
    try {
      let pokemonIds: number[] = [];

      if (params.generation) {
        const { startId, endId } = this.getGenerationRange(params.generation);
        pokemonIds = Array.from(
          { length: endId - startId + 1 },
          (_, i) => startId + i
        );
      } else {
        // Get all Pokémon IDs (limit to first 1000 for performance)
        pokemonIds = Array.from({ length: 1000 }, (_, i) => i + 1);
      }

      console.log("Initial Pokémon IDs:", pokemonIds.length);

      // Filter by difficulty
      if (params.difficulty) {
        pokemonIds = await this.filterByDifficulty(
          pokemonIds,
          params.difficulty
        );
        console.log("After difficulty filter:", pokemonIds.length);
      }

      // Filter by type
      if (params.type) {
        pokemonIds = await this.filterByType(pokemonIds, params.type);
        console.log("After type filter:", pokemonIds.length);
      }

      // Filter by legendary status
      if (params.isLegendary !== undefined) {
        pokemonIds = await this.filterByLegendaryStatus(
          pokemonIds,
          params.isLegendary
        );
        console.log("After legendary filter:", pokemonIds.length);
      }

      return pokemonIds;
    } catch (error) {
      console.error("Error getting Pokémon IDs by criteria:", error);
      // Fallback to basic Pokémon IDs
      return Array.from({ length: 151 }, (_, i) => i + 1); // Gen 1 Pokémon
    }
  }

  private async filterByDifficulty(
    pokemonIds: number[],
    difficulty: string
  ): Promise<number[]> {
    // This is a simplified implementation
    // In a real app, you'd have a more sophisticated difficulty system
    switch (difficulty) {
      case "easy":
        return pokemonIds.slice(0, 151); // Gen 1 only
      case "medium":
        return pokemonIds.slice(0, 400); // Gen 1-3
      case "hard":
        return pokemonIds.slice(0, 700); // Gen 1-6
      case "expert":
        return pokemonIds; // All generations
      default:
        return pokemonIds;
    }
  }

  private async filterByType(
    pokemonIds: number[],
    type: string
  ): Promise<number[]> {
    try {
      const data = await this.fetchFromApi(`type/${type}`);
      return data.pokemon.map((p: any) => this.extractIdFromUrl(p.pokemon.url));
    } catch (error) {
      console.error(`Error filtering by type ${type}:`, error);
      return pokemonIds;
    }
  }

  private async filterByLegendaryStatus(
    pokemonIds: number[],
    isLegendary: boolean
  ): Promise<number[]> {
    // This would require checking each Pokémon's species data
    // For now, we'll return a subset of known legendary Pokémon IDs
    const legendaryIds = [
      144,
      145,
      146,
      150,
      151, // Gen 1 legendaries
      243,
      244,
      245,
      249,
      250,
      251, // Gen 2 legendaries
      377,
      378,
      379,
      380,
      381,
      382,
      383,
      384,
      385,
      386, // Gen 3 legendaries
      // Add more as needed
    ];

    return isLegendary
      ? legendaryIds
      : pokemonIds.filter((id) => !legendaryIds.includes(id));
  }

  private async generateChoices(
    pokemon: Pokemon,
    generation?: number
  ): Promise<string[]> {
    try {
      const targetGeneration = generation || pokemon.generation;
      const { startId, endId } = this.getGenerationRange(targetGeneration);

      // Get 3 random Pokémon from the same generation
      const otherIds = [];
      for (let i = 0; i < 3; i++) {
        let randomId;
        do {
          randomId =
            Math.floor(Math.random() * (endId - startId + 1)) + startId;
        } while (randomId === pokemon.id || otherIds.includes(randomId));
        otherIds.push(randomId);
      }

      const otherPokemon = await Promise.all(
        otherIds.map((id) => this.getPokemonById(id))
      );

      const choices = [
        pokemon.name,
        ...otherPokemon.filter(Boolean).map((p) => p!.name),
      ];

      // Shuffle the choices
      return this.shuffleArray(choices);
    } catch (error) {
      console.error("Error generating choices:", error);
      // Fallback to hardcoded choices
      return [pokemon.name, "Pikachu", "Charizard", "Blastoise"];
    }
  }

  private async generateHints(pokemon: Pokemon): Promise<GameHint[]> {
    const hints: GameHint[] = [];

    try {
      // Get detailed Pokemon data for better hints
      const detailedData = await this.getPokemonDetailedData(pokemon.id);

      // 1. Flavor Text Hint (Best hint - gives context without being too obvious)
      if (detailedData.description) {
        hints.push({
          type: "flavor_text",
          content: `Pokédex Entry: "${detailedData.description}"`,
          cost: 15,
        });
      }

      // 2. Type Hint (Good balance of helpful and not too revealing)
      if (pokemon.types.length > 0) {
        const typeNames = pokemon.types.map((t) => t.name).join("/");
        hints.push({
          type: "type",
          content: `This Pokémon is ${typeNames}-type.`,
          cost: 10,
        });
      }


      // 4. Height/Weight Hint (Fun trivia that helps differentiate)
      hints.push({
        type: "height_weight",
        content: `It is ${pokemon.height}m tall and weighs ${pokemon.weight}kg.`,
        cost: 8,
      });

      // 5. Evolution Hint (Only if it won't make it too obvious)
      if (
        detailedData.evolutionChain &&
        detailedData.evolutionChain.evolvesTo &&
        detailedData.evolutionChain.evolvesTo.length > 0
      ) {
        const evolvesTo = detailedData.evolutionChain.evolvesTo[0];
        if (evolvesTo.name.toLowerCase() !== pokemon.name.toLowerCase()) {
          hints.push({
            type: "evolution",
            content: `It evolves into ${evolvesTo.name}.`,
            cost: 12,
          });
        }
      }

      // 6. Generation Hint (Good for narrowing down without spoiling)
      const generationNames = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
      ];
      const genName =
        generationNames[pokemon.generation - 1] ||
        pokemon.generation.toString();
      hints.push({
        type: "generation",
        content: `This Pokémon was first introduced in Generation ${genName}.`,
        cost: 3,
      });
    } catch (error) {
      console.error(
        "Failed to generate detailed hints, using fallback:",
        error
      );

      // Fallback hints if detailed data fails

      if (pokemon.types.length > 0) {
        hints.push({
          type: "type",
          content: `This Pokémon is ${pokemon.types
            .map((t) => t.name)
            .join("/")}-type.`,
          cost: 10,
        });
      }
    }

    return hints;
  }

  private async getAllPokemonNames(): Promise<
    Array<{ id: number; name: string }>
  > {
    try {
      const data = await this.fetchFromApi("pokemon?limit=1000");
      return data.results.map((pokemon: any, index: number) => ({
        id: index + 1,
        name: pokemon.name,
      }));
    } catch (error) {
      console.error("Error fetching all Pokémon names:", error);
      return [];
    }
  }

  private async fetchFromApi(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    const cacheKey = url;

    console.log("Fetching from API:", url);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log("Using cached data for:", url);
      return cached.data;
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response received for:", url);

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(`Error fetching from API: ${url}`, error);
      throw error;
    }
  }

  private transformPokemonData(data: any): Pokemon {
    const types: PokemonType[] = data.types.map((type: any) => ({
      name: type.type.name,
      color: this.getTypeColor(type.type.name),
    }));

    const stats: PokemonStats = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    };

    data.stats.forEach((stat: any) => {
      const statName = stat.stat.name;
      if (statName in stats) {
        stats[statName as keyof PokemonStats] = stat.base_stat;
      }
    });

    return {
      id: data.id,
      name: data.name,
      sprite:
        data.sprites.front_default ||
        data.sprites.other?.["official-artwork"]?.front_default ||
        "",
      types,
      stats,
      abilities: data.abilities.map((ability: any) => ability.ability.name),
      height: data.height / 10, // Convert from decimeters to meters
      weight: data.weight / 10, // Convert from hectograms to kilograms
      baseExperience: data.base_experience,
      isLegendary: data.is_legendary || false,
      isMythical: data.is_mythical || false,
      generation: this.getGenerationFromId(data.id),
    };
  }

  private getGenerationFromId(id: number): number {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    if (id <= 1008) return 9;
    return 9; // Default to Generation IX for any higher IDs
  }

  private getGenerationRange(generation: number): {
    startId: number;
    endId: number;
  } {
    const ranges: Record<number, { startId: number; endId: number }> = {
      1: { startId: 1, endId: 151 },
      2: { startId: 152, endId: 251 },
      3: { startId: 252, endId: 386 },
      4: { startId: 387, endId: 493 },
      5: { startId: 494, endId: 649 },
      6: { startId: 650, endId: 721 },
      7: { startId: 722, endId: 809 },
      8: { startId: 810, endId: 905 },
      9: { startId: 906, endId: 1008 },
    };

    return ranges[generation] || { startId: 1, endId: 1008 };
  }

  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const pokemonApiService = new PokemonApiService();
