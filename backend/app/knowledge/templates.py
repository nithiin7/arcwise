from typing import TypedDict


class Template(TypedDict):
    id: str
    name: str
    description: str
    mermaid_dsl: str


TEMPLATES: list[Template] = [
    {
        "id": "monolith",
        "name": "Monolith",
        "description": "Single deployable with shared DB and cache. Best for early-stage.",
        "mermaid_dsl": """flowchart LR
    subgraph Clients
        Web[Web App]
        Mobile[Mobile App]
    end
    CDN[CDN]
    LB[Load Balancer]
    App[App Server]
    Cache[Redis Cache]
    DB[(Primary DB)]

    Clients -->|HTTPS| CDN
    CDN -->|cache miss| LB
    LB -->|routes| App
    App -->|read-through| Cache
    App -->|read / write| DB""",
    },
    {
        "id": "microservices",
        "name": "Microservices",
        "description": "Services per domain behind an API gateway, each owning its data store.",
        "mermaid_dsl": """flowchart LR
    Client[Client]
    CDN[CDN]
    AG[API Gateway]
    Auth[Auth Service]
    SvcA[Service A]
    SvcB[Service B]
    Queue[Message Queue]
    DBA[(DB - A)]
    DBB[(DB - B)]
    Cache[Redis]

    Client -->|HTTPS| CDN
    CDN -->|cache miss| AG
    AG -->|authenticate| Auth
    AG -->|route| SvcA
    AG -->|route| SvcB
    SvcA -->|async events| Queue
    Queue -->|consume| SvcB
    SvcA -->|read / write| DBA
    SvcB -->|read / write| DBB
    SvcA -->|cache| Cache""",
    },
    {
        "id": "event-driven",
        "name": "Event-Driven",
        "description": "Services communicate via an event bus. Loose coupling, high throughput.",
        "mermaid_dsl": """flowchart LR
    Client[Client]
    AG[API Gateway]
    Producer[Producer Service]
    Bus[Event Bus / Kafka]
    ConsumerA[Consumer A]
    ConsumerB[Consumer B]
    EventStore[(Event Store)]
    ReadDB[(Read DB)]

    Client -->|request| AG
    AG -->|command| Producer
    Producer -->|publish| Bus
    Producer -->|persist| EventStore
    Bus -->|subscribe| ConsumerA
    Bus -->|subscribe| ConsumerB
    ConsumerA -->|project| ReadDB""",
    },
    {
        "id": "serverless",
        "name": "Serverless",
        "description": "Functions triggered by HTTP or events. No servers, pay-per-invocation.",
        "mermaid_dsl": """flowchart LR
    Client[Client]
    CDN[CDN]
    AG[API Gateway]
    FnAuth[Lambda - Auth]
    FnCore[Lambda - Core]
    FnNotify[Lambda - Notify]
    Queue[SQS Queue]
    DB[(DynamoDB)]
    Storage[S3]

    Client -->|HTTPS| CDN
    CDN -->|miss| AG
    AG -->|trigger| FnAuth
    FnAuth -->|authorized| FnCore
    FnCore -->|read / write| DB
    FnCore -->|enqueue| Queue
    Queue -->|trigger| FnNotify
    FnCore -->|store| Storage""",
    },
    {
        "id": "cqrs",
        "name": "CQRS",
        "description": "Separate command (write) and query (read) paths for independent scaling.",
        "mermaid_dsl": """flowchart LR
    Client[Client]
    AG[API Gateway]

    subgraph Write
        Cmd[Command Handler]
        Store[(Event Store)]
        Bus[Event Bus]
    end

    subgraph Read
        Query[Query Handler]
        ReadDB[(Read Model)]
        Cache[Cache]
    end

    Proj[Projector]

    Client -->|command| AG
    Client -->|query| AG
    AG -->|write| Cmd
    AG -->|read| Query
    Cmd -->|persist| Store
    Store -->|publish| Bus
    Bus -->|project| Proj
    Proj -->|update| ReadDB
    Query -->|cache| Cache
    Query -->|miss| ReadDB""",
    },
]

TEMPLATES_BY_ID: dict[str, Template] = {t["id"]: t for t in TEMPLATES}
