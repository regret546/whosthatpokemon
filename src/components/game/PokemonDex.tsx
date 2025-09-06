import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pokemon } from "@/types";
import {
  PokemonDetailedData,
  pokemonApiService,
} from "@/services/pokemonApiService";

interface PokemonDexProps {
  pokemon: Pokemon | null;
  isRevealed: boolean;
  isLoading?: boolean;
}

const PokemonDex: React.FC<PokemonDexProps> = ({
  pokemon,
  isRevealed,
  isLoading = false,
}) => {
  const [detailedData, setDetailedData] = useState<PokemonDetailedData | null>(
    null
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (pokemon && isRevealed) {
      loadDetailedData();
    }
  }, [pokemon, isRevealed]);

  const loadDetailedData = async () => {
    if (!pokemon) return;

    setIsLoadingDetails(true);
    try {
      const data = await pokemonApiService.getPokemonDetailedData(pokemon.id);
      setDetailedData(data);
    } catch (error) {
      console.error("Failed to load detailed Pokémon data:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (!pokemon) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/pokeball_logo.png"
              alt="Loading..."
              className="w-12 h-12 animate-spin mx-auto mb-4"
            />
            <div className="text-gray-500 text-lg">Loading Pokémon...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingDetails) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/pokeball_logo.png"
              alt="Loading..."
              className="w-12 h-12 animate-spin mx-auto mb-4"
            />
            <div className="text-gray-500 text-lg">Loading Pokédex data...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton loading for next Pokemon transition
  if (isLoading) {
    return (
      <motion.div
        className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-visible"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header skeleton */}
        <div className="relative h-24 flex items-center justify-center rounded-t-xl bg-gray-200 animate-pulse">
          <div className="w-32 h-32 bg-gray-300 rounded-full -mt-16 animate-pulse"></div>
        </div>

        {/* Content skeleton */}
        <div className="p-3 space-y-2">
          {/* Basic Info skeleton */}
          <div className="text-center space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Physical Attributes skeleton */}
          <div className="flex justify-between items-center py-1 border-t border-b border-gray-200">
            <div className="text-center space-y-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="text-center space-y-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Abilities skeleton */}
          <div className="text-center space-y-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="text-center space-y-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                <div key={index} className="text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Type skeleton */}
          <div className="text-center space-y-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex justify-center space-x-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Use detailed data if available, otherwise fall back to basic pokemon data
  const displayData = detailedData || {
    id: pokemon.id,
    name: pokemon.name,
    description: "No description available.",
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities,
    stats: [
      pokemon.stats.hp,
      pokemon.stats.attack,
      pokemon.stats.defense,
      pokemon.stats.specialAttack,
      pokemon.stats.specialDefense,
      pokemon.stats.speed,
    ],
    evolutionChain: {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprite,
      evolvesTo: [],
    },
    sprite: pokemon.sprite,
    types: pokemon.types,
  };

  const getTypeColor = (typeName: string) => {
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
  };

  const getStatColor = (statName: string) => {
    const colors: Record<string, string> = {
      hp: "#4CAF50",
      attack: "#F44336",
      defense: "#2196F3",
      specialAttack: "#FF9800",
      specialDefense: "#9C27B0",
      speed: "#FFEB3B",
      total: "#795548",
    };
    return colors[statName.toLowerCase()] || "#757575";
  };

  const getStatAbbreviation = (statName: string) => {
    const abbreviations: Record<string, string> = {
      hp: "HP",
      attack: "ATK",
      defense: "DEF",
      specialattack: "SpA",
      specialdefense: "SpD",
      specialAttack: "SpA",
      specialDefense: "SpD",
      speed: "SPD",
    };
    return (
      abbreviations[statName] ||
      abbreviations[statName.toLowerCase()] ||
      statName.toUpperCase()
    );
  };

  const totalStats = displayData.stats.reduce((sum, stat) => sum + stat, 0);

  // Get the sprite to display (animated if available)
  const displaySprite = detailedData?.animatedSprite || displayData.sprite;

  // Render evolution chain horizontally
  const renderEvolutionChain = (evolution: any) => {
    if (!evolution) return null;

    const evolutionChain = [];
    let current = evolution;

    // Build the chain array
    while (current) {
      evolutionChain.push(current);
      current =
        current.evolvesTo && current.evolvesTo.length > 0
          ? current.evolvesTo[0]
          : null;
    }

    return (
      <div className="flex items-center justify-center space-x-4">
        {evolutionChain.map((evo, index) => (
          <div key={evo.id} className="flex items-center">
            {index > 0 && (
              <div className="mx-2 text-gray-600 pokedex-font text-xs flex items-center h-12">
                {evo.minLevel !== null ? `LVL. ${evo.minLevel}` : "LVL. ?"}
              </div>
            )}
            <div className="text-center">
              <img
                src={evo.sprite}
                alt={evo.name}
                className="w-12 h-12 object-contain mx-auto mb-1"
              />
              <div className="text-xs font-bold text-pokemon-gray uppercase pokedex-font">
                {evo.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-visible"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Pokémon sprite */}
      <div
        className="relative h-24 flex items-center justify-center rounded-t-xl"
        style={{
          backgroundColor: getTypeColor(
            displayData.types[1]?.name || displayData.types[0]?.name || "normal"
          ),
        }}
      >
        <motion.img
          src={displaySprite}
          alt={displayData.name}
          className="w-32 h-32 object-contain drop-shadow-lg -mt-16 relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/no-pokemon.png";
          }}
        />
      </div>

      {/* Main content area */}
      <div className="p-3 space-y-2">
        {/* Basic Info */}
        <div className="text-center space-y-0.5">
          <div className="text-lg font-bold text-pokemon-gray pokedex-font">
            N°{displayData.id}
          </div>
          <div className="text-xl font-bold text-blue-600 uppercase pokedex-large">
            {displayData.name}
          </div>
          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
            POKÉMON ENTRY
          </div>
          <div className="text-xs text-gray-700 leading-tight px-2 pokedex-font">
            {displayData.description}
          </div>
        </div>
        {/* Physical Attributes */}
        <div className="flex justify-between items-center py-1 border-t border-b border-gray-200">
          <div className="text-center">
            <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
              HEIGHT
            </div>
            <div className="text-lg font-bold text-pokemon-gray pokedex-font">
              {displayData.height}M
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
              WEIGHT
            </div>
            <div className="text-lg font-bold text-pokemon-gray pokedex-font">
              {displayData.weight}KG
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
              {displayData.abilities[0] || "N/A"}
            </div>
            <div className="text-sm font-bold text-pokemon-gray uppercase pokedex-font">
              {displayData.abilities[1] || "N/A"}
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="text-center space-y-1">
          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
            STATS
          </div>
          <div className="grid grid-cols-7 gap-1">
            {displayData.stats.map((value, index) => {
              const statNames = [
                "hp",
                "attack",
                "defense",
                "specialAttack",
                "specialDefense",
                "speed",
              ];
              const statName = statNames[index];
              return (
                <div key={statName} className="text-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-0.5"
                    style={{
                      fontSize: "10px",
                      backgroundColor: getStatColor(statName),
                    }}
                  >
                    {getStatAbbreviation(statName)}
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
                  fontSize: "10px",
                  backgroundColor: getStatColor("total"),
                }}
              >
                TOT
              </div>
              <div className="text-xs font-bold text-pokemon-gray pokedex-font">
                {totalStats}
              </div>
            </div>
          </div>
        </div>{" "}
        on the
        {/* Evolution Line */}
        {displayData.evolutionChain &&
          displayData.evolutionChain.evolvesTo &&
          displayData.evolutionChain.evolvesTo.length > 0 && (
            <div className="text-center space-y-1">
              <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
                EVOLUTION
              </div>
              {renderEvolutionChain(displayData.evolutionChain)}
            </div>
          )}
        {/* Type Badges */}
        <div className="text-center space-y-1">
          <div className="text-sm font-bold text-blue-600 uppercase pokedex-title">
            TYPE
          </div>
          <div className="flex justify-center space-x-2">
            {displayData.types.map((type, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-white font-bold text-xs uppercase pokedex-font"
                style={{ backgroundColor: getTypeColor(type.name) }}
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PokemonDex;
