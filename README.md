# Teachfloor CLI

This is a boilerplate CLI application built using [oclif](https://oclif.io/). The project is designed to be developed and tested within a Dockerized environment, making it easy to build, run, and maintain third-party extensions.

## Features

- Authentication with Laravel Passport using OAuth2
- Interactive prompts via Inquirer
- Secure credential storage using Keytar
- Environment management with Dotenv
- Dockerized development environment

---

## Prerequisites

1. **Docker**: Ensure Docker is installed and running on your local machine.
2. **Node.js**: Installed within the Docker container.

---

## Setup

### 1. Clone the Repository

Clone this repository to your local machine and navigate to the project directory:

```bash
git clone <repository-url>
cd app-cli
```

### 2. Build the Docker Image

Once inside the project directory, build the Docker image:

```bash
./execute build --rm --tag app-cli .
```

### 3. Use the execute script

The execute script helps manage Docker container interactions and run commands inside the container. To start working on your CLI project, use the following commands:

**Start the Development Environment**

Run the following command to open a shell in the Docker container where your CLI will be developed:

```bash
./execute cli-shell
```

This will:

* Ensure Docker is running.
* Map your current project directory to /workspace inside the container.
* Open a shell where you can interact with the CLI.

**Run Other Docker Commands**

You can also proxy other Docker commands through the execute script. For example, to list running containers, use:

```bash
./execute ps
```