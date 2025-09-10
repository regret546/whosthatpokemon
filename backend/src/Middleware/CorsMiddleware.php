<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class CorsMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Get allowed origins from environment and normalize
        $allowedOriginsRaw = explode(',', $_ENV['CORS_ORIGINS'] ?? 'http://localhost:3000');
        $allowedOrigins = array_map(fn($o) => rtrim(trim($o), '/'), $allowedOriginsRaw);
        $origin = $request->getHeaderLine('Origin');
        $normalizedOrigin = rtrim($origin, '/');

        // Handle preflight OPTIONS requests
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();

            if (in_array($normalizedOrigin, $allowedOrigins)) {
                $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
            }

            return $response
                ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID')
                ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->withHeader('Access-Control-Allow-Credentials', 'true')
                ->withHeader('Access-Control-Max-Age', '86400')
                ->withStatus(200);
        }

        // Handle actual requests
        $response = $handler->handle($request);

        if (in_array($normalizedOrigin, $allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }

        return $response
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Max-Age', '86400');
    }
}
