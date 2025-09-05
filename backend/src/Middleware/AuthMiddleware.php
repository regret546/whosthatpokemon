<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\AuthService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class AuthMiddleware implements MiddlewareInterface
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $this->unauthorizedResponse();
        }

        $token = $matches[1];
        
        try {
            $user = $this->authService->validateToken($token);
            
            if (!$user) {
                return $this->unauthorizedResponse();
            }

            // Add user to request attributes
            $request = $request->withAttribute('user', $user);
            
            return $handler->handle($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse();
        }
    }

    private function unauthorizedResponse(): ResponseInterface
    {
        $response = new Response();
        $errorData = [
            'success' => false,
            'error' => 'Unauthorized',
            'code' => 401,
            'message' => 'Valid authentication token required',
            'timestamp' => date('c')
        ];

        $response->getBody()->write(json_encode($errorData));
        return $response
            ->withStatus(401)
            ->withHeader('Content-Type', 'application/json');
    }
}
