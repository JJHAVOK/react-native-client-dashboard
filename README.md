graph TD
    subgraph Client Mobile App [React Native / Expo]
        UI[Native UI & Expo Router]
        State[Zustand Auth Store]
        Storage[Expo SecureStore]
        API_Client[Axios Instance]
        
        UI --> State
        State <--> Storage
        UI --> API_Client
    end

    subgraph Client Web Storefront [Next.js]
        WebUI[Next.js App Router]
        WebAPI[Next.js API Routes]
    end

    subgraph Staff Admin Panel [Next.js]
        AdminUI[Admin Dashboard]
    end

    subgraph Backend Infrastructure [NestJS / Docker VPS]
        Gateway[NestJS REST API]
        DB[(PostgreSQL Database)]
        
        Gateway <--> DB
    end

    %% Network Connections
    API_Client -- "REST API (withCredentials: true)" --> Gateway
    WebUI -- "REST API (HTTP-Only Cookies)" --> Gateway
    AdminUI -- "REST API (RBAC Secured)" --> Gateway

    classDef mobile fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff;
    classDef web fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;
    classDef backend fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff;
    
    class Client Mobile App,UI,State,Storage,API_Client mobile;
    class Client Web Storefront,WebUI web;
    class Backend Infrastructure,Gateway,DB backend;
