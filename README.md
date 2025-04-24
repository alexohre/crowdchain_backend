<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Crowdchain Backend

The backend service for the Crowdchain decentralized application, built with NestJS framework.

## Description

Crowdchain backend provides the API services and blockchain integration for the Crowdchain platform, enabling decentralized crowdfunding and project management capabilities.

Key Features:

- Blockchain integration for smart contract interaction
- User authentication and authorization
- Project management APIs
- Crowdfunding transaction handling
- Data persistence and caching

## Project setup

```bash
$ yarn install
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=your_database_url
BLOCKCHAIN_RPC_URL=your_blockchain_node_url
JWT_SECRET=your_jwt_secret
```

## Running the Application

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Testing

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api-docs
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # API endpoints
├── services/      # Business logic
├── models/        # Data models
├── blockchain/    # Blockchain integration
└── utils/         # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
