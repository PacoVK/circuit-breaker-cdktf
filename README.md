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

```puml
start

:invoke fancy API handler;
if (Circuit is open) then (yes)
    :Call external 
    Cat Facts API;
    if (Cat Facts API is 
    slow/ down) then (yes)
        :Abort after 
        timeout;
        :Increment error 
        counter;
    else (no)
    endif
else (no)
endif
:return response;
stop
```

Designed in AWS it could look like this:

```puml
@startuml Technical View

!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v13.1/dist
!include AWSPuml/AWSCommon.puml
!include AWSPuml/AWSSimplified.puml

!include AWSPuml/General/Users.puml
!include AWSPuml/ApplicationIntegration/APIGateway.puml
!include AWSPuml/ApplicationIntegration/SimpleNotificationService.puml
!include AWSPuml/SecurityIdentityCompliance/Cognito.puml
!include AWSPuml/Compute/Lambda.puml
!include AWSPuml/Database/DynamoDB.puml
!include AWSPuml/General/Traditionalserver.puml

left to right direction

Users(sources, "Users", "")
APIGateway(fancyAPI, "Fancy API", "")
Lambda(processor, "Processor", "")
Lambda(errorHandler, "Error handler", "")
SimpleNotificationService(sns, "Messaging system", "")
DynamoDB(errorDB, "Service Error DB", "")
Traditionalserver(otherApi, "Cat Facts API", "")

sources --> fancyAPI : call
fancyAPI --> processor : invoke
processor --> otherApi : request
processor <-- otherApi : response
processor --> sns : send failure message
sns --> errorHandler : invoke
errorHandler --> errorDB : put an error with TTL
processor --> errorDB : check if there are errors 
@enduml
```

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