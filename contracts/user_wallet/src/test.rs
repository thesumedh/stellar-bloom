#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Events}, Address, Env, IntoVal, symbol_short};
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::token::StellarAssetClient as TokenAdminClient;

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let contract_address = e.register_stellar_asset_contract(admin.clone());
    (
        TokenClient::new(e, &contract_address),
        TokenAdminClient::new(e, &contract_address),
    )
}

#[test]
fn test_successful_execution() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserWallet);
    let client = UserWalletClient::new(&env, &contract_id);

    // Setup Token
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let amount = 500;

    // Mint tokens to the sender
    token_admin_client.mint(&sender, &1000);

    // Execute transfer
    client.execute_transfer(&sender, &recipient, &token.address, &amount);

    // Assert balances
    assert_eq!(token.balance(&sender), 500);
    assert_eq!(token.balance(&recipient), 500);
}

#[test]
#[should_panic]
fn test_unauthorized_execution_fails() {
    let env = Env::default();
    // Intentionally NOT calling env.mock_all_auths() to cause auth failure

    let contract_id = env.register_contract(None, UserWallet);
    let client = UserWalletClient::new(&env, &contract_id);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let amount = 500;

    token_admin_client.mint(&sender, &1000);

    // Execution without auth should panic
    client.execute_transfer(&sender, &recipient, &token.address, &amount);
}

#[test]
#[should_panic]
fn test_insufficient_balance_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserWallet);
    let client = UserWalletClient::new(&env, &contract_id);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    
    // Sender gets 100 tokens
    token_admin_client.mint(&sender, &100);

    // Attempts to send 500, which should panic due to insufficient funds
    client.execute_transfer(&sender, &recipient, &token.address, &500);
}
