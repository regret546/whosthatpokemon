<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Exception\HttpException;
use Slim\Psr7\Response;

class ErrorHandlerMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        try {
            return $handler->handle($request);
        } catch (\Throwable $exception) {
            $response = new Response();
            
            $statusCode = 500;
            $message = 'Internal Server Error';
            
            if ($exception instanceof HttpException) {
                $statusCode = $exception->getCode();
                $message = $exception->getMessage();
            }
            
            $errorData = [
                'success' => false,
                'error' => $message,
                'code' => $statusCode,
                'timestamp' => date('c'),
                'requestId' => $request->getHeaderLine('X-Request-ID') ?: uniqid()
            ];
            
            // Add debug information in development
            if ($_ENV['APP_DEBUG'] === 'true') {
                $errorData['debug'] = [
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => $exception->getTraceAsString()
                ];
            }
            
            $response->getBody()->write(json_encode($errorData));
            return $response
                ->withStatus($statusCode)
                ->withHeader('Content-Type', 'application/json');
        }
    }
}
