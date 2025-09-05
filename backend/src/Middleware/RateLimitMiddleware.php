<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class RateLimitMiddleware implements MiddlewareInterface
{
    private array $requests = [];

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $clientIp = $this->getClientIp($request);
        $currentTime = time();
        $window = (int) ($_ENV['RATE_LIMIT_WINDOW'] ?? 3600); // 1 hour default
        $maxRequests = (int) ($_ENV['RATE_LIMIT_REQUESTS'] ?? 100); // 100 requests per hour default

        // Clean old entries
        $this->cleanOldEntries($currentTime, $window);

        // Check if client has exceeded rate limit
        if (isset($this->requests[$clientIp])) {
            $clientRequests = $this->requests[$clientIp];
            $recentRequests = array_filter($clientRequests, function ($timestamp) use ($currentTime, $window) {
                return $timestamp > ($currentTime - $window);
            });

            if (count($recentRequests) >= $maxRequests) {
                $response = new Response();
                $errorData = [
                    'success' => false,
                    'error' => 'Rate limit exceeded',
                    'code' => 429,
                    'retryAfter' => $window,
                    'timestamp' => date('c')
                ];

                $response->getBody()->write(json_encode($errorData));
                return $response
                    ->withStatus(429)
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Retry-After', (string) $window);
            }
        }

        // Record this request
        $this->requests[$clientIp][] = $currentTime;

        return $handler->handle($request);
    }

    private function getClientIp(ServerRequestInterface $request): string
    {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if ($request->getServerParams()[$header] ?? false) {
                $ips = explode(',', $request->getServerParams()[$header]);
                return trim($ips[0]);
            }
        }

        return $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown';
    }

    private function cleanOldEntries(int $currentTime, int $window): void
    {
        foreach ($this->requests as $ip => $timestamps) {
            $this->requests[$ip] = array_filter($timestamps, function ($timestamp) use ($currentTime, $window) {
                return $timestamp > ($currentTime - $window);
            });

            if (empty($this->requests[$ip])) {
                unset($this->requests[$ip]);
            }
        }
    }
}
