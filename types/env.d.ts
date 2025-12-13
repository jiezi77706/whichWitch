declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_CHAIN_ID?: string;
    NEXT_PUBLIC_NETWORK_NAME?: string;
    NEXT_PUBLIC_RPC_URL?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID?: string;
    NEXT_PUBLIC_NFT_MANAGER_ADDRESS?: string;
    NEXT_PUBLIC_MARKETPLACE_ADDRESS?: string;
    NEXT_PUBLIC_CREATION_MANAGER_ADDRESS?: string;
    NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS?: string;
    NEXT_PUBLIC_AUTHORIZATION_MANAGER_ADDRESS?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}