# Typescript CQRS + Sagas proof of concept

## Introduction

CQRS is an architectural pattern that separates the responsibility of issuing commands (which modify data) from the responsibility of issuing queries (which retrieve data). This separation of concerns can improve the performance and scalability of a system, as well as improve its reliability and maintainability.

One way to implement CQRS in a TypeScript project is to use the Mediator pattern, which allows different components of the system to communicate with each other through a central mediator object. The mediator can then route commands and queries to the appropriate handler or handler-like object.

Sagas, on the other hand, are a pattern for managing long-running transactions or processes that span multiple microservices or bounded contexts. They allow you to coordinate the processing of multiple commands and events in a way that ensures consistency and integrity of data across the system.

This project is a proof-of-concept implementation of Sagas in TypeScript. 
CQRS is not yet implemented.
