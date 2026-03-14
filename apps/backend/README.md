# Backend (Hono on Azure Functions)

## Prequisites
- Node.js 20 or later
- Azure Functions Core Tools
- Azure CLI
- An Azure account
- Docker

### Download and install Azure Functions Core Tools
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```
or check the [official documentation](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=windows%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-typescript) for installation instructions.

### Download and install Azure CLI
Consult the [official documentation](https://learn.microsoft.com/fr-fr/cli/azure/install-azure-cli-windows?view=azure-cli-latest&pivots=wingeti) for installation instructions.


### Download and install Docker
Consult the [official documentation](https://docs.docker.com/get-docker/) for installation instructions depending on your operating system.



## Running the backend locally
To run the backend locally, follow these steps:
1. Navigate to the `apps/backend` directory.
2. Install the dependencies (if you haven't already during the setup of the glbal project):
```bash
yarn install
```
3. Start the Azure Functions host:
```bash
func start
```
This will start the backend server locally, and you can access the API endpoints at `http://localhost:7071/api`.

### Running the backend in watch mode
To run the backend in watch mode, which automatically restarts the server when file changes are detected, use the following command:
```bash
yarn dev
```

### Note on prestart
The `prestart` script is used to build the TypeScript code before starting the Azure Functions host. This ensures that the latest changes are compiled and ready to be served when you run `func start`. The `prestart` script is automatically executed before the `start` script, so you don't need to run it manually.

## Testing

### Tests with Vitest
Vitest is a testing framework for JavaScript and TypeScript. It's used to run unit tests for the backend code.
All the tests are specified with the `.spec.ts` extension and are located in the `src` directory. To run the tests, execute the following command in the terminal:
```bash
yarn test
```

### Tests with Bruno
Bruno is a tool for testing APIs. Here it's used to test the backend API endpoints. The test files are located in the `api-tests` directory. Each test file corresponds to a specific API endpoint and contains tests to verify the functionality of that endpoint.

If you haven't already, make sure to install Bruno globally:
```bash
npm install -g @bruno/cli
```

To run the tests, navigate to the `api-tests` directory and execute the following command:
```bash
bru run --env local
```

You can also open the Bruno UI to run and manage your tests.

If you need to run a specific test file, you can use the following command:
```bash
bru run --env local <path-to-test-file-or-directory>
```

You can also export the test results in JUnit format for integration with CI/CD pipelines:
```bash
bru run --env local --export-junit
```

You can also run the prod and dev environments tests by replacing `local` with `prod` or `dev` in the command:
```bash
bru run --env prod
```
```bash
bru run --env dev
```