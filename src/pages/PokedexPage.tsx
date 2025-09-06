import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUp } from "lucide-react";
import axios from "axios";

interface Pokemon {
  id: number;
  name: string;
  url: string;
  types: string[];
}

interface PokemonDetails {
  id: number;
  name: string;
  description: string;
  height: number;
  weight: number;
  abilities: string[];
  stats: number[];
  evolutionChain?: EvolutionPokemon[];
  sprite: string;
  animatedSprite: string;
  types: string[];
}

interface EvolutionPokemon {
  id: number;
  name: string;
  minLevel?: number;
}

const PokedexPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [currentPokemons, setCurrentPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [pokemonIndex, setPokemonIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Custom hook for responsive animations
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    // Check initial screen size
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Type colors matching your original implementation
  const typeColors: { [key: string]: string } = {
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

  // Capitalize first letter utility
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Get Pokemon number from URL
  const getPokemonNumberFromUrl = (url: string) => {
    const parts = url.split("/");
    const number = parts[parts.length - 2];
    return Number(number);
  };

  // Fetch all Pokemon data
  const getAllPokemonData = async () => {
    try {
      const res = await axios.get(
        "https://pokeapi.co/api/v2/pokemon?limit=898"
      );
      const pokemons = res.data.results;

      const pokemonList: Pokemon[] = [];
      for (let i = 0; i < pokemons.length; i++) {
        pokemonList.push({
          name: pokemons[i].name,
          id: i + 1,
          url: pokemons[i].url,
          types: [],
        });
      }

      setAllPokemons(pokemonList);
      await getAllPokemonTypes(pokemonList);
    } catch (error) {
      console.error("Error while fetching the data:", error);
    }
  };

  // Get Pokemon types
  const getAllPokemonTypes = async (pokemonList: Pokemon[]) => {
    try {
      const updatedPokemons = [...pokemonList];

      for (let i = 0; i < 18; i++) {
        const types = await axios.get(
          `https://pokeapi.co/api/v2/type/${i + 1}`
        );
        const pokemonTypeName = types.data.name;
        const pokemonWithType = types.data.pokemon;

        for (let j = 0; j < pokemonWithType.length; j++) {
          const pokemonId = parseInt(
            pokemonWithType[j].pokemon.url
              .replace("https://pokeapi.co/api/v2/pokemon/", "")
              .replace("/", "")
          );

          if (
            !isNaN(pokemonId) &&
            pokemonId > 0 &&
            pokemonId <= updatedPokemons.length
          ) {
            updatedPokemons[pokemonId - 1].types.push(pokemonTypeName);
          }
        }
      }

      setAllPokemons(updatedPokemons);
      setCurrentPokemons(updatedPokemons);
      setPokemonIndex(0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error while fetching Pokemon types:", error);
    }
  };

  // Fetch detailed Pokemon information
  const getPokemonDetails = async (
    pokemonId: number,
    pokemonName: string
  ): Promise<PokemonDetails> => {
    try {
      // Fetch species data for description
      const speciesResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`
      );

      let description = "";
      const descriptions = speciesResponse.data.flavor_text_entries;
      for (let i = 0; i < descriptions.length; i++) {
        if (descriptions[i].language.name === "en") {
          description = descriptions[i].flavor_text
            .replace(/\f/g, " ")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          break;
        }
      }

      // Fetch main Pokemon data
      const pokemonResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
      );

      const pokemonData = pokemonResponse.data;

      // Get abilities (max 2)
      const abilities: string[] = [];
      for (let i = 0; i < Math.min(2, pokemonData.abilities.length); i++) {
        abilities.push(pokemonData.abilities[i].ability.name);
      }

      // Get stats
      const stats: number[] = [];
      for (let i = 0; i < pokemonData.stats.length; i++) {
        stats.push(pokemonData.stats[i].base_stat);
      }

      // Get evolution chain
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
      const evolutionChain = await getEvolutionChain(evolutionChainUrl);

      // Get sprites
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
      const animatedSprite =
        pokemonId >= 650
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${pokemonId}.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;

      return {
        id: pokemonId,
        name: pokemonName,
        description,
        height: pokemonData.height / 10, // Convert to meters
        weight: pokemonData.weight / 10, // Convert to kg
        abilities,
        stats,
        evolutionChain,
        sprite,
        animatedSprite,
        types: allPokemons[pokemonId - 1]?.types || [],
      };
    } catch (error) {
      console.error("Error fetching Pokemon details:", error);
      throw error;
    }
  };

  // Get evolution chain
  const getEvolutionChain = async (
    chainUrl: string
  ): Promise<EvolutionPokemon[]> => {
    try {
      const response = await axios.get(chainUrl);
      const chain = response.data.chain;
      const evolution: EvolutionPokemon[] = [];

      if (chain.evolves_to.length !== 0) {
        evolution.push({
          id: getPokemonNumberFromUrl(chain.species.url),
          name: chain.species.name,
        });

        const firstEvolution = chain.evolves_to[0];
        evolution.push({
          id: getPokemonNumberFromUrl(firstEvolution.species.url),
          name: firstEvolution.species.name,
          minLevel: firstEvolution.evolution_details[0]?.min_level,
        });

        if (firstEvolution.evolves_to.length !== 0) {
          const secondEvolution = firstEvolution.evolves_to[0];
          evolution.push({
            id: getPokemonNumberFromUrl(secondEvolution.species.url),
            name: secondEvolution.species.name,
            minLevel: secondEvolution.evolution_details[0]?.min_level,
          });
        }
      }

      return evolution;
    } catch (error) {
      console.error("Error fetching evolution chain:", error);
      return [];
    }
  };

  // Handle Pokemon card click
  const handlePokemonClick = async (pokemon: Pokemon) => {
    if (selectedPokemon?.name === pokemon.name) return;

    setIsLoadingDetails(true);
    try {
      const details = await getPokemonDetails(pokemon.id, pokemon.name);
      setSelectedPokemon(details);
    } catch (error) {
      console.error("Error loading Pokemon details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle search with debouncing
  const debounceTimer = React.useRef<NodeJS.Timeout>();
  const handleSearch = useCallback(
    (value: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (value !== "") {
          setSearchActive(true);
          const searchResults = allPokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(value.toLowerCase())
          );
          setCurrentPokemons(searchResults);
          setPokemonIndex(0);
        } else {
          setSearchActive(false);
          setCurrentPokemons(allPokemons);
          setPokemonIndex(0);
        }
      }, 300);
    },
    [allPokemons]
  );

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      // Infinite scroll
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;

      if (Math.ceil(scrolled) === scrollable && !searchActive) {
        setPokemonIndex((prev) => prev + 24);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchActive]);

  // Load initial data
  useEffect(() => {
    getAllPokemonData();
  }, []);

  // Update search term
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  const visiblePokemons = currentPokemons.slice(0, pokemonIndex + 24);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 relative">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your pokemon"
              disabled
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pokemon Grid - Loading State */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-md border-2 border-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="text-center">
                        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>

                        <div className="w-20 h-20 mx-auto mb-2 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                          <motion.div
                            className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </div>

                        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>

                        <div className="flex justify-center gap-1">
                          <div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pokemon Detail Panel - Loading State */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <motion.img
                      src="/pokeball_logo.png"
                      alt="Loading"
                      className="w-16 h-16 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/no-pokemon.png";
                      }}
                    />
                    <p className="text-gray-600 font-semibold pokedex-font">
                      Loading Pokédex...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your pokemon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pokemon Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visiblePokemons.map((pokemon) => (
                  <motion.div
                    key={pokemon.id}
                    className="bg-white rounded-xl p-4 shadow-md cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePokemonClick(pokemon)}
                  >
                    <div className="text-center">
                      <div className="text-sm text-gray-500 font-semibold mb-1 pokedex-font">
                        N°{pokemon.id}
                      </div>

                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        className="w-20 h-20 mx-auto mb-2 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/no-pokemon.png";
                        }}
                      />

                      <h3 className="font-bold text-gray-800 uppercase text-sm mb-2 pokedex-font">
                        {capitalizeFirstLetter(pokemon.name)}
                      </h3>

                      <div className="flex justify-center gap-1">
                        {pokemon.types.map((type, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 rounded-full text-xs font-semibold text-white uppercase pokedex-font"
                            style={{
                              backgroundColor: typeColors[type] || "#68A090",
                              fontSize: "10px",
                            }}
                          >
                            {capitalizeFirstLetter(type)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pokemon Detail Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-40 mt-16 h-[80vh]">
                {/* Static loading logo background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.img
                    src="/pokeball_logo.png"
                    alt="Loading"
                    className="w-16 h-16 opacity-20"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/no-pokemon.png";
                    }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {selectedPokemon ? (
                    <motion.div
                      key={selectedPokemon.id}
                      initial={{
                        y: isLargeScreen ? 0 : "-100vh",
                        x: isLargeScreen ? "100vw" : 0,
                        opacity: 0,
                      }}
                      animate={{
                        y: 0,
                        x: 0,
                        opacity: 1,
                      }}
                      exit={{
                        y: isLargeScreen ? 0 : "-100vh",
                        x: isLargeScreen ? "100vw" : 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                      }}
                      className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-visible h-full relative z-10"
                    >
                      {/* Header with Pokémon sprite */}
                      <div
                        className="relative h-24 flex items-center justify-center rounded-t-xl"
                        style={{
                          backgroundColor:
                            typeColors[
                              selectedPokemon.types[1] ||
                                selectedPokemon.types[0]
                            ] || "#68A090",
                        }}
                      >
                        <motion.img
                          src={selectedPokemon.animatedSprite}
                          alt={selectedPokemon.name}
                          className="w-32 h-32 object-contain drop-shadow-lg -mt-16 relative z-10"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = selectedPokemon.sprite;
                          }}
                        />
                      </div>

                      {/* Main content area */}
                      <div className="p-3 space-y-2">
                        {/* Basic Info */}
                        <div className="text-center space-y-0.5">
                          <div className="text-lg font-bold text-pokemon-gray pokedex-font">
                            N°{selectedPokemon.id}
                          </div>
                          <div className="text-xl font-bold text-blue-600 uppercase pokedex-large">
                            {capitalizeFirstLetter(selectedPokemon.name)}
                          </div>
                          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                            POKÉMON ENTRY
                          </div>
                          <div className="text-xs text-gray-700 leading-tight px-2 pokedex-font">
                            {selectedPokemon.description}
                          </div>
                        </div>

                        {/* Physical Attributes */}
                        <div className="flex justify-between items-center py-1 border-t border-b border-gray-200">
                          <div className="text-center">
                            <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                              HEIGHT
                            </div>
                            <div className="text-lg font-bold text-pokemon-gray pokedex-font">
                              {selectedPokemon.height}M
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                              WEIGHT
                            </div>
                            <div className="text-lg font-bold text-pokemon-gray pokedex-font">
                              {selectedPokemon.weight}KG
                            </div>
                          </div>
                        </div>

                        {/* Abilities */}
                        <div className="text-center space-y-1">
                          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                            ABILITIES
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm font-bold text-pokemon-gray uppercase pokedex-font">
                              {selectedPokemon.abilities[0]
                                ? capitalizeFirstLetter(
                                    selectedPokemon.abilities[0].replace(
                                      "-",
                                      " "
                                    )
                                  )
                                : "N/A"}
                            </div>
                            <div className="text-sm font-bold text-pokemon-gray uppercase pokedex-font">
                              {selectedPokemon.abilities[1]
                                ? capitalizeFirstLetter(
                                    selectedPokemon.abilities[1].replace(
                                      "-",
                                      " "
                                    )
                                  )
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-center space-y-1">
                          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                            STATS
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {selectedPokemon.stats.map((value, index) => {
                              const statNames = [
                                "HP",
                                "ATK",
                                "DEF",
                                "SpA",
                                "SpD",
                                "SPD",
                              ];
                              const statColors = [
                                "#FF5959",
                                "#F5AC78",
                                "#FAE078",
                                "#9DB7F5",
                                "#A7DB8D",
                                "#FA92B2",
                              ];
                              return (
                                <div key={index} className="text-center">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-0.5"
                                    style={{
                                      fontSize: "9px",
                                      backgroundColor: statColors[index],
                                    }}
                                  >
                                    {statNames[index]}
                                  </div>
                                  <div className="text-xs font-bold text-pokemon-gray pokedex-font">
                                    {value}
                                  </div>
                                </div>
                              );
                            })}
                            <div className="text-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-0.5"
                                style={{
                                  fontSize: "9px",
                                  backgroundColor: "#68A090",
                                }}
                              >
                                TOT
                              </div>
                              <div className="text-xs font-bold text-pokemon-gray pokedex-font">
                                {selectedPokemon.stats.reduce(
                                  (a, b) => a + b,
                                  0
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Evolution Line */}
                        {selectedPokemon.evolutionChain &&
                          selectedPokemon.evolutionChain.length > 0 && (
                            <div className="text-center space-y-2">
                              <div className="text-sm font-bold text-blue-600 uppercase tracking-wider pokedex-title">
                                EVOLUTION
                              </div>
                              <div className="flex justify-center items-center space-x-1">
                                {selectedPokemon.evolutionChain.map(
                                  (evolution, index) => (
                                    <React.Fragment key={evolution.id}>
                                      {index > 0 && (
                                        <div className="flex flex-col items-center mx-2">
                                          <div className="text-black text-xs font-bold pokedex-font">
                                            LVL.
                                          </div>
                                          <div className="text-black text-xs font-bold pokedex-font">
                                            {evolution.minLevel || "?"}
                                          </div>
                                        </div>
                                      )}
                                      <div className="text-center">
                                        <div
                                          className="cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            const evolutionPokemon =
                                              allPokemons.find(
                                                (p) => p.id === evolution.id
                                              );
                                            if (evolutionPokemon) {
                                              handlePokemonClick(
                                                evolutionPokemon
                                              );
                                            }
                                          }}
                                        >
                                          <img
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`}
                                            alt={evolution.name}
                                            className="w-16 h-16 mx-auto object-contain"
                                            onError={(e) => {
                                              const target =
                                                e.target as HTMLImageElement;
                                              target.src = "/no-pokemon.png";
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Type Badges */}
                        <div className="text-center space-y-1">
                          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                            TYPE
                          </div>
                          <div className="flex justify-center space-x-2">
                            {selectedPokemon.types.map((type, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 rounded-full text-white font-bold text-xs uppercase pokedex-font"
                                style={{
                                  backgroundColor:
                                    typeColors[type] || "#68A090",
                                }}
                              >
                                {capitalizeFirstLetter(type)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-400 h-full flex flex-col justify-center relative z-10"
                    >
                      <img
                        src="/no-pokemon.png"
                        alt="No Pokemon selected"
                        className="w-32 h-32 mx-auto mb-4 object-contain"
                      />
                      <h3 className="text-lg font-semibold mb-2 text-blue-600 pokedex-title">
                        Choose a Pokémon to display here
                      </h3>
                      <p className="text-sm pokedex-font">
                        Click on any Pokémon card to see detailed information
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PokedexPage;
