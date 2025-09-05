<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Psr7\Response;

abstract class BaseController
{
    protected function successResponse(ResponseInterface $response, mixed $data = null, string $message = 'Success', int $statusCode = 200): ResponseInterface
    {
        $responseData = [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'timestamp' => date('c')
        ];

        $response->getBody()->write(json_encode($responseData));
        return $response
            ->withStatus($statusCode)
            ->withHeader('Content-Type', 'application/json');
    }

    protected function errorResponse(ResponseInterface $response, string $message = 'Error', int $statusCode = 400, mixed $data = null): ResponseInterface
    {
        $responseData = [
            'success' => false,
            'error' => $message,
            'code' => $statusCode,
            'timestamp' => date('c')
        ];

        if ($data !== null) {
            $responseData['data'] = $data;
        }

        $response->getBody()->write(json_encode($responseData));
        return $response
            ->withStatus($statusCode)
            ->withHeader('Content-Type', 'application/json');
    }

    protected function getJsonBody(ServerRequestInterface $request): array
    {
        $body = $request->getBody()->getContents();
        return json_decode($body, true) ?? [];
    }

    protected function getCurrentUser(ServerRequestInterface $request): ?array
    {
        return $request->getAttribute('user');
    }
}
