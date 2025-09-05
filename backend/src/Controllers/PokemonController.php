<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\PokemonService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class PokemonController extends BaseController
{
    private PokemonService $pokemonService;

    public function __construct()
    {
        $this->pokemonService = new PokemonService();
    }

    public function getList(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        
        try {
            $pokemon = $this->pokemonService->getList(
                (int) ($queryParams['page'] ?? 1),
                (int) ($queryParams['limit'] ?? 20),
                $queryParams['generation'] ?? null,
                $queryParams['type'] ?? null,
                $queryParams['search'] ?? null
            );

            return $this->successResponse($response, $pokemon, 'Pokémon list retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getById(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $id = (int) $args['id'];
        
        try {
            $pokemon = $this->pokemonService->getById($id);
            
            if (!$pokemon) {
                return $this->errorResponse($response, 'Pokémon not found', 404);
            }

            return $this->successResponse($response, $pokemon, 'Pokémon retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getByName(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $name = $args['name'];
        
        try {
            $pokemon = $this->pokemonService->getByName($name);
            
            if (!$pokemon) {
                return $this->errorResponse($response, 'Pokémon not found', 404);
            }

            return $this->successResponse($response, $pokemon, 'Pokémon retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function search(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $query = $queryParams['q'] ?? '';
        $limit = (int) ($queryParams['limit'] ?? 20);
        
        try {
            $results = $this->pokemonService->search($query, $limit);
            return $this->successResponse($response, $results, 'Search completed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getRandom(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        
        try {
            $result = $this->pokemonService->getRandom(
                $queryParams['difficulty'] ?? 'medium',
                $queryParams['generation'] ?? null,
                $queryParams['type'] ?? null
            );

            return $this->successResponse($response, $result, 'Random Pokémon generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getTypes(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        try {
            $types = $this->pokemonService->getTypes();
            return $this->successResponse($response, $types, 'Pokémon types retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }
}
