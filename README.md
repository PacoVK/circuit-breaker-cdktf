# README #

This repo contains a simple reference implementation of a [ciruit-breaker](https://martinfowler.com/bliki/CircuitBreaker.html) in AWS using **Lambda**, **SNS**, and **DynamoDB**.

## Technology

* [Typescript](https://www.typescriptlang.org/)
* [Cloud Development Kit for Terraform (CDKTF)](https://www.terraform.io/cdktf)

## The problem
The problem to solve pops up when you are starting over with Serverless applications that need to integrate with external APIs. 
You are charged for the Lambda functions consumed resources (memory and cpu) multiplied by time the lambda is actually running.
Given your function relies on external APIs that need to be fetched during runtime, latency of the 3rd. party service becomes a crucial part of your 
applications costs.
Given a Lambda is running 600ms we would be charged for 600ms. If the API increases the latency or is down and the HTTP requests 
run into a timeout after 10 seconds we are charged for the entire 10,5s. Especially in a high traffic environment it 
is very relevant to optimize here.

## The solution

Basically a simple circuit-breaker has the following flow:

![Flow](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/PacoVK/circuit-breaker-cdktf/main/docs/flow.iuml)

Designed in AWS it could look like this:

![Technical view](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/PacoVK/circuit-breaker-cdktf/main/docs/technical_view.iuml)

## How to use

The application source is under `application` and the infrastructure related stuff is under `infrastructure`.

**Prerequisite:** Run `yarn install` in the projects root

### Run locally - Application

1. Start local environment with `docker compose up -d` this will setup local SNS,SQS,Dynamodb using [Localstack](https://localstack.cloud/).
Additionally there is a [webUI for SQS](http://localhost:3999) and a [webUI for DynamoDb](http://localhost:8001) running on localhost for debugging purposes.
2. `cd application`
3. Run `yarn test` to run the functions locally

To bundle the functions for Lambda run `yarn build` 

### Deploy

1. Head over into `infrastructure` 
2. Run `yarn build:deploy:all` - this will bundle the Lambda and deploy all components to AWS

### Cleanup

1. Head over into `infrastructure`
2. Run `yarn destroy:all` - this will **delete** all components 

### Infrastructure Unit tests

The infrastructure is based on [cdktf](https://www.terraform.io/cdktf). 
to run the jest tests use `yarn test` inside the `infrastructure` folder. Although **no** AWS service will actually be deployed,
you need to have valid AWS AccessCredentials in order to meet Terraforms requirements. 

## References

* [Circuit Breaker - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
* [SQS Admin](https://github.com/PacoVK/sqs-admin)
* [DynamoDb Admin](https://github.com/aaronshaf/dynamodb-admin)
* [cdktf](https://www.terraform.io/cdktf)
* [Localstack](https://localstack.cloud/)